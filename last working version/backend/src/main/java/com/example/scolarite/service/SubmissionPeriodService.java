package com.example.scolarite.service;

import com.example.scolarite.dto.*;
import com.example.scolarite.entity.*;
import com.example.scolarite.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmissionPeriodService {

    private final SubmissionPeriodRepository periodRepository;
    private final SubmissionPeriodExceptionRepository exceptionRepository;
    private final ProfessorRepository professorRepository;
    private final TeachingPreferencesRepository preferencesRepository;
    private final KeycloakUserService keycloakUserService;

    public SubmissionPeriodService(SubmissionPeriodRepository periodRepository,
                                   SubmissionPeriodExceptionRepository exceptionRepository,
                                   ProfessorRepository professorRepository,
                                   TeachingPreferencesRepository preferencesRepository,
                                   KeycloakUserService keycloakUserService) {
        this.periodRepository = periodRepository;
        this.exceptionRepository = exceptionRepository;
        this.professorRepository = professorRepository;
        this.preferencesRepository = preferencesRepository;
        this.keycloakUserService = keycloakUserService;
    }

    // ==================== GESTION DES PÉRIODES ====================

    public SubmissionPeriodDto createPeriod(SubmissionPeriodDto dto) {
        SubmissionPeriod period = new SubmissionPeriod();
        period.setName(dto.getName());
        period.setAcademicYear(dto.getAcademicYear());
        period.setSemester(dto.getSemester());
        period.setStartDate(dto.getStartDate());
        period.setEndDate(dto.getEndDate());
        period.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        period.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);

        if (period.getIsDefault()) {
            disableOtherDefaultPeriods();
        }

        period = periodRepository.save(period);
        return mapToDto(period);
    }

    public SubmissionPeriodDto updatePeriod(Long id, SubmissionPeriodDto dto) {
        SubmissionPeriod period = periodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Période non trouvée"));

        period.setName(dto.getName());
        period.setAcademicYear(dto.getAcademicYear());
        period.setSemester(dto.getSemester());
        period.setStartDate(dto.getStartDate());
        period.setEndDate(dto.getEndDate());
        period.setIsActive(dto.getIsActive());

        if (dto.getIsDefault() && !period.getIsDefault()) {
            disableOtherDefaultPeriods();
            period.setIsDefault(true);
        } else if (!dto.getIsDefault()) {
            period.setIsDefault(false);
        }

        period = periodRepository.save(period);
        return mapToDto(period);
    }

    public void deletePeriod(Long id) {
        SubmissionPeriod period = periodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Période non trouvée"));
        period.setIsActive(false);
        periodRepository.save(period);
    }

    public List<SubmissionPeriodDto> getAllPeriods() {
        return periodRepository.findByIsActiveTrueOrderByStartDateDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SubmissionPeriodDto getCurrentPeriod() {
        Optional<SubmissionPeriod> period = periodRepository.findCurrentPeriod(LocalDateTime.now());
        return period.map(this::mapToDto).orElse(null);
    }

    public SubmissionPeriod getCurrentPeriodEntity() {
        return periodRepository.findCurrentPeriod(LocalDateTime.now()).orElse(null);
    }

    public boolean isSubmissionPeriodOpen(String professorKeycloakId) {
        Professor professor = professorRepository.findByKeycloakId(professorKeycloakId).orElse(null);

        if (professor != null) {
            List<SubmissionPeriodException> exceptions = exceptionRepository
                    .findActiveExceptionsByProfessor(professor, LocalDateTime.now());
            for (SubmissionPeriodException exception : exceptions) {
                if (exception.isActive()) {  // ← Utilise la méthode héritée
                    return true;
                }
            }
        }

        Optional<SubmissionPeriod> currentPeriod = periodRepository.findCurrentPeriod(LocalDateTime.now());
        return currentPeriod.map(BasePeriod::isActive).orElse(false);  // ← Utilise la méthode héritée
    }
    private void disableOtherDefaultPeriods() {
        Optional<SubmissionPeriod> currentDefault = periodRepository.findByIsDefaultTrue();
        currentDefault.ifPresent(period -> {
            period.setIsDefault(false);
            periodRepository.save(period);
        });
    }

    // ==================== PÉRIODES EXCEPTIONNELLES ====================

    @Transactional
    public SubmissionPeriodException grantExceptionPeriod(String professorKeycloakId, Long periodId,
                                                          LocalDateTime startDate, LocalDateTime endDate,
                                                          String reason) {
        System.out.println("=== CRÉATION PÉRIODE EXCEPTIONNELLE ===");
        System.out.println("Professor Keycloak ID: " + professorKeycloakId);
        System.out.println("Period ID: " + periodId);
        System.out.println("Start: " + startDate);
        System.out.println("End: " + endDate);
        System.out.println("Reason: " + reason);

        Professor professor = professorRepository.findByKeycloakId(professorKeycloakId)
                .orElseThrow(() -> {
                    System.err.println("Professeur non trouvé avec keycloakId: " + professorKeycloakId);
                    return new RuntimeException("Professeur non trouvé");
                });
        System.out.println("Professeur trouvé: ID=" + professor.getId() + ", KeycloakId=" + professor.getKeycloakId());

        SubmissionPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> {
                    System.err.println("Période non trouvée avec ID: " + periodId);
                    return new RuntimeException("Période non trouvée");
                });
        System.out.println("Période trouvée: " + period.getName());

        // Vérifier si une exception existe déjà
        Optional<SubmissionPeriodException> existing = exceptionRepository
                .findByProfessorAndPeriod(professor, period);

        SubmissionPeriodException exception;
        if (existing.isPresent()) {
            exception = existing.get();
            exception.setStartDate(startDate);
            exception.setEndDate(endDate);
            exception.setReason(reason);
            System.out.println("Mise à jour d'une exception existante, ID=" + exception.getId());
        } else {
            exception = new SubmissionPeriodException();
            exception.setProfessor(professor);
            exception.setPeriod(period);
            exception.setStartDate(startDate);
            exception.setEndDate(endDate);
            exception.setReason(reason);
            System.out.println("Création d'une nouvelle exception");
        }

        // Mettre à jour les préférences du professeur
        TeachingPreferences preferences = preferencesRepository
                .findByProfessorId(professor.getId())
                .orElse(new TeachingPreferences(professor));

        preferences.setExceptionGranted(true);
        preferences.setPeriod(period);
        preferencesRepository.save(preferences);
        System.out.println("Préférences mises à jour avec exceptionGranted=true");

        SubmissionPeriodException saved = exceptionRepository.save(exception);
        System.out.println("Exception sauvegardée avec ID: " + saved.getId());

        return saved;
    }

    public void revokeExceptionPeriod(Long exceptionId) {
        SubmissionPeriodException exception = exceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new RuntimeException("Exception non trouvée"));

        TeachingPreferences preferences = preferencesRepository
                .findByProfessorId(exception.getProfessor().getId())
                .orElse(null);

        if (preferences != null) {
            preferences.setExceptionGranted(false);
            preferencesRepository.save(preferences);
        }

        exceptionRepository.delete(exception);
    }

    public List<ExceptionPeriodDto> getExceptionPeriodsByPeriod(Long periodId) {
        SubmissionPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Période non trouvée"));

        return exceptionRepository.findByPeriod(period)
                .stream()
                .map(this::mapExceptionToDto)
                .collect(Collectors.toList());
    }

    // ==================== STATISTIQUES ====================

    // Dans SubmissionPeriodService.java, corrigez getSubmissionStatistics
    public SubmissionStatisticsDto getSubmissionStatistics(Long periodId) {
        SubmissionPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Période non trouvée"));

        // Récupérer TOUS les professeurs (via Keycloak)
        List<ProfileDto> allProfessors = keycloakUserService.getAllUsers("PROFESSOR", null);

        // Récupérer TOUTES les préférences soumises pour cette période
        List<TeachingPreferences> allPreferences = preferencesRepository.findAll().stream()
                .filter(p -> p.getPeriod() != null && p.getPeriod().getId().equals(periodId))
                .collect(Collectors.toList());

        // Récupérer TOUTES les exceptions pour cette période
        List<SubmissionPeriodException> allExceptions = exceptionRepository.findByPeriod(period);

        System.out.println("=== STATISTIQUES PÉRIODE " + periodId + " ===");
        System.out.println("Total professeurs: " + allProfessors.size());
        System.out.println("Préférences trouvées: " + allPreferences.size());
        System.out.println("Exceptions trouvées: " + allExceptions.size());

        SubmissionStatisticsDto stats = new SubmissionStatisticsDto();
        stats.setPeriodId(period.getId());
        stats.setPeriodName(period.getName());
        stats.setTotalProfessors(allProfessors.size());

        List<ProfessorSubmissionStatusDto> submittedList = new ArrayList<>();
        List<ProfessorSubmissionStatusDto> notSubmittedList = new ArrayList<>();
        List<ProfessorSubmissionStatusDto> exceptionList = new ArrayList<>();

        // Map des professeurs qui ont soumis
        Set<String> submittedProfessorIds = allPreferences.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsSubmitted()))
                .map(p -> p.getProfessor().getKeycloakId())
                .collect(Collectors.toSet());

        // Map des professeurs qui ont une exception
        Set<String> exceptionProfessorIds = allExceptions.stream()
                .map(e -> e.getProfessor().getKeycloakId())
                .collect(Collectors.toSet());

        System.out.println("Professeurs ayant soumis: " + submittedProfessorIds);
        System.out.println("Professeurs avec exception: " + exceptionProfessorIds);

        for (ProfileDto professorProfile : allProfessors) {
            ProfessorSubmissionStatusDto status = new ProfessorSubmissionStatusDto();
            status.setKeycloakId(professorProfile.getId());
            status.setUsername(professorProfile.getUsername());
            status.setFirstName(professorProfile.getFirstName());
            status.setLastName(professorProfile.getLastName());
            status.setEmail(professorProfile.getEmail());
            status.setHasExceptionPeriod(exceptionProfessorIds.contains(professorProfile.getId()));

            if (submittedProfessorIds.contains(professorProfile.getId())) {
                // Professeur a soumis
                status.setSubmissionStatus("SUBMITTED");
                allPreferences.stream()
                        .filter(p -> p.getProfessor().getKeycloakId().equals(professorProfile.getId()))
                        .findFirst()
                        .ifPresent(pref -> status.setSubmittedAt(pref.getSubmittedAt()));
                submittedList.add(status);
            } else if (exceptionProfessorIds.contains(professorProfile.getId())) {
                // Professeur a une exception mais n'a pas soumis
                status.setSubmissionStatus("EXCEPTION_GRANTED");
                exceptionList.add(status);
            } else {
                // Professeur n'a rien
                status.setSubmissionStatus("NOT_SUBMITTED");
                notSubmittedList.add(status);
            }
        }

        stats.setSubmittedCount(submittedList.size());
        stats.setNotSubmittedCount(notSubmittedList.size());
        stats.setExceptionGrantedCount(exceptionList.size());
        stats.setSubmittedProfessors(submittedList);
        stats.setNotSubmittedProfessors(notSubmittedList);
        stats.setExceptionProfessors(exceptionList);

        System.out.println("=== RÉSULTATS ===");
        System.out.println("Soumis: " + submittedList.size());
        System.out.println("Non soumis: " + notSubmittedList.size());
        System.out.println("Exceptions: " + exceptionList.size());

        return stats;
    }

    public List<TeachingPreferencesDto> getSubmissionsByPeriod(Long periodId) {
        return preferencesRepository.findBySubmissionPeriodId(periodId)
                .stream()
                .map(this::mapPreferencesToDto)
                .collect(Collectors.toList());
    }

    // ==================== MÉTHODES DE MAPPING ====================

    private SubmissionPeriodDto mapToDto(SubmissionPeriod period) {
        SubmissionPeriodDto dto = new SubmissionPeriodDto();
        dto.setId(period.getId());
        dto.setName(period.getName());
        dto.setAcademicYear(period.getAcademicYear());
        dto.setSemester(period.getSemester());
        dto.setStartDate(period.getStartDate());
        dto.setEndDate(period.getEndDate());
        dto.setIsActive(period.getIsActive());
        dto.setIsDefault(period.getIsDefault());
        return dto;
    }

    private ExceptionPeriodDto mapExceptionToDto(SubmissionPeriodException exception) {
        ExceptionPeriodDto dto = new ExceptionPeriodDto();
        dto.setId(exception.getId());
        dto.setProfessorKeycloakId(exception.getProfessor().getKeycloakId());
        dto.setProfessorName(exception.getProfessor().getKeycloakId());
        dto.setPeriodId(exception.getPeriod().getId());
        dto.setStartDate(exception.getStartDate());
        dto.setEndDate(exception.getEndDate());
        dto.setReason(exception.getReason());
        return dto;
    }

    private TeachingPreferencesDto mapPreferencesToDto(TeachingPreferences preferences) {
        TeachingPreferencesDto dto = new TeachingPreferencesDto();
        dto.setId(preferences.getId());
        dto.setProfessorId(preferences.getProfessor().getId());
        dto.setSubmittedAt(preferences.getSubmittedAt());
        dto.setIsSubmitted(preferences.getIsSubmitted());
        dto.setMaxHoursPerDay(preferences.getMaxHoursPerDay());
        dto.setMaxHoursPerWeek(preferences.getMaxHoursPerWeek());
        dto.setNotes(preferences.getNotes());
        return dto;
    }

    /**
     * Récupérer les préférences détaillées d'un professeur pour une période
     */
    public TeachingPreferencesDto getProfessorPreferencesForPeriod(Long periodId, String professorKeycloakId) {
        System.out.println("=== getProfessorPreferencesForPeriod ===");
        System.out.println("periodId: " + periodId);
        System.out.println("professorKeycloakId: " + professorKeycloakId);

        Professor professor = professorRepository.findByKeycloakId(professorKeycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));
        System.out.println("Professeur trouvé: ID=" + professor.getId());

        TeachingPreferences preferences = preferencesRepository
                .findByProfessorId(professor.getId())
                .orElse(null);

        if (preferences == null) {
            System.out.println("Aucune préférence trouvée pour le professeur");
            TeachingPreferencesDto emptyDto = new TeachingPreferencesDto();
            emptyDto.setIsSubmitted(false);
            emptyDto.setSubmissionStatus("NOT_SUBMITTED");
            return emptyDto;
        }

        System.out.println("Préférence trouvée:");
        System.out.println("  - isSubmitted: " + preferences.getIsSubmitted());
        System.out.println("  - period: " + (preferences.getPeriod() != null ? preferences.getPeriod().getId() : "null"));
        System.out.println("  - constraints: " + (preferences.getConstraints() != null ? preferences.getConstraints().substring(0, Math.min(200, preferences.getConstraints().length())) : "null"));

        TeachingPreferencesDto dto = mapPreferencesToDetailDto(preferences);

        // Ajouter les informations du professeur depuis Keycloak
        ProfileDto professorProfile = keycloakUserService.getUserProfile(professorKeycloakId);
        if (professorProfile != null) {
            dto.setProfessorId(professor.getId());
            // Si vous avez besoin d'ajouter ces champs au DTO, ajoutez-les
        }

        return dto;
    }
    /**
     * Récupérer les préférences détaillées de tous les professeurs pour une période
     */
    public List<ProfessorPreferencesDetailDto> getAllProfessorsPreferencesForPeriod(Long periodId) {
        SubmissionPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Période non trouvée"));

        List<ProfileDto> allProfessors = keycloakUserService.getAllUsers("PROFESSOR", null);
        List<ProfessorPreferencesDetailDto> result = new ArrayList<>();

        // Récupérer toutes les préférences pour cette période
        Map<String, TeachingPreferences> preferencesMap = new HashMap<>();
        List<TeachingPreferences> allPreferences = preferencesRepository.findAll().stream()
                .filter(p -> p.getPeriod() != null && p.getPeriod().getId().equals(periodId))
                .collect(Collectors.toList());

        for (TeachingPreferences pref : allPreferences) {
            preferencesMap.put(pref.getProfessor().getKeycloakId(), pref);
        }

        for (ProfileDto professorProfile : allProfessors) {
            ProfessorPreferencesDetailDto dto = new ProfessorPreferencesDetailDto();
            dto.setProfessorKeycloakId(professorProfile.getId());
            dto.setProfessorFirstName(professorProfile.getFirstName());
            dto.setProfessorLastName(professorProfile.getLastName());
            dto.setProfessorName((professorProfile.getFirstName() != null ? professorProfile.getFirstName() : "") + " " +
                    (professorProfile.getLastName() != null ? professorProfile.getLastName() : ""));
            dto.setProfessorEmail(professorProfile.getEmail());

            TeachingPreferences preferences = preferencesMap.get(professorProfile.getId());

            if (preferences != null && Boolean.TRUE.equals(preferences.getIsSubmitted())) {
                dto.setSubmissionStatus("SUBMITTED");
                dto.setSubmittedAt(preferences.getSubmittedAt());
                dto.setMaxHoursPerDay(preferences.getMaxHoursPerDay());
                dto.setMaxHoursPerWeek(preferences.getMaxHoursPerWeek());
                dto.setGlobalNotes(preferences.getNotes());

                // Parser les préférences détaillées
                try {
                    if (preferences.getConstraints() != null && !preferences.getConstraints().isEmpty()) {
                        ObjectMapper mapper = new ObjectMapper();
                        List<DailyPreferencesDetailDto> dailyPrefs = mapper.readValue(preferences.getConstraints(),
                                mapper.getTypeFactory().constructCollectionType(List.class, DailyPreferencesDetailDto.class));
                        dto.setDailyPreferences(dailyPrefs);
                    }
                } catch (Exception e) {
                    // Ignorer
                }
            } else if (preferences != null && Boolean.TRUE.equals(preferences.getExceptionGranted())) {
                dto.setSubmissionStatus("EXCEPTION_GRANTED");
                dto.setHasExceptionPeriod(true);
            } else {
                dto.setSubmissionStatus("NOT_SUBMITTED");
            }

            result.add(dto);
        }

        return result;
    }




    /**
     * Mettre à jour une période exceptionnelle
     */
    public void updateExceptionPeriod(Long exceptionId, ExceptionPeriodRequestDto request) {
        SubmissionPeriodException exception = exceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new RuntimeException("Exception non trouvée"));

        exception.setStartDate(request.getStartDate());
        exception.setEndDate(request.getEndDate());
        exception.setReason(request.getReason());

        exceptionRepository.save(exception);
    }

    /**
     * Parser les préférences quotidiennes
     */
    private List<DailyPreferencesDetailDto> parseDailyPreferences(TeachingPreferences preferences) {
        List<DailyPreferencesDetailDto> result = new ArrayList<>();

        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        String[] dayLabels = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"};

        try {
            // Si les préférences sont stockées en JSON, les parser
            if (preferences.getConstraints() != null && preferences.getConstraints().contains("dailyPreferences")) {
                ObjectMapper mapper = new ObjectMapper();
                // Parser le JSON existant
            }
        } catch (Exception e) {
            // Fallback: créer des préférences par défaut
        }

        return result;
    }

    private TeachingPreferencesDto mapPreferencesToDetailDto(TeachingPreferences preferences) {
        TeachingPreferencesDto dto = new TeachingPreferencesDto();
        dto.setId(preferences.getId());
        dto.setProfessorId(preferences.getProfessor().getId());
        dto.setSubmittedAt(preferences.getSubmittedAt());
        dto.setIsSubmitted(preferences.getIsSubmitted());
        dto.setMaxHoursPerDay(preferences.getMaxHoursPerDay());
        dto.setMaxHoursPerWeek(preferences.getMaxHoursPerWeek());
        dto.setNotes(preferences.getNotes());
        dto.setGlobalNotes(preferences.getNotes());
        dto.setSubmissionStatus(preferences.getSubmissionStatus());

        // ⚠️ CRITIQUE: Parser les dailyPreferences depuis constraints
        if (preferences.getConstraints() != null && !preferences.getConstraints().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                List<DailyPreferencesDetailDto> dailyPrefs = mapper.readValue(
                        preferences.getConstraints(),
                        mapper.getTypeFactory().constructCollectionType(List.class, DailyPreferencesDetailDto.class)
                );
                dto.setDailyPreferences(dailyPrefs);
                System.out.println("✅ DailyPreferences parsées: " + dailyPrefs.size());
            } catch (Exception e) {
                System.err.println("Erreur parsing dailyPreferences: " + e.getMessage());
            }
        }

        return dto;
    }
    /**
     * Vérifier si un professeur a une période exceptionnelle active
     */
    public boolean hasActiveExceptionPeriod(String professorKeycloakId) {
        Professor professor = professorRepository.findByKeycloakId(professorKeycloakId)
                .orElse(null);
        if (professor == null) return false;

        List<SubmissionPeriodException> exceptions = exceptionRepository
                .findActiveExceptionsByProfessor(professor, LocalDateTime.now());
        return !exceptions.isEmpty();
    }

    /**
     * Récupérer la période exceptionnelle active d'un professeur
     */
    public SubmissionPeriodException getActiveExceptionPeriod(String professorKeycloakId) {
        Professor professor = professorRepository.findByKeycloakId(professorKeycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        List<SubmissionPeriodException> exceptions = exceptionRepository
                .findActiveExceptionsByProfessor(professor, LocalDateTime.now());
        if (exceptions.isEmpty()) {
            throw new RuntimeException("Aucune période exceptionnelle active");
        }
        return exceptions.get(0);
    }

    /**
     * Vérifier si un professeur a une période exceptionnelle active pour une période spécifique
     */
    public boolean hasActiveExceptionPeriodForPeriod(String professorKeycloakId, Long periodId) {
        Professor professor = professorRepository.findByKeycloakId(professorKeycloakId).orElse(null);
        if (professor == null) return false;

        SubmissionPeriod period = periodRepository.findById(periodId).orElse(null);
        if (period == null) return false;

        Optional<SubmissionPeriodException> exception = exceptionRepository.findByProfessorAndPeriod(professor, period);
        if (exception.isEmpty()) return false;

        LocalDateTime now = LocalDateTime.now();
        SubmissionPeriodException ex = exception.get();
        return (ex.getStartDate() == null || now.isAfter(ex.getStartDate())) &&
                (ex.getEndDate() == null || now.isBefore(ex.getEndDate()));
    }
}