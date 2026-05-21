package com.example.scolarite.service;

import com.example.scolarite.dto.DailyPreferencesDetailDto;
import com.example.scolarite.dto.ProfessorDto;
import com.example.scolarite.dto.SubjectDto;
import com.example.scolarite.dto.TeachingPreferencesDto;
import com.example.scolarite.entity.*;
import com.example.scolarite.repository.ProfessorRepository;
import com.example.scolarite.repository.SubjectRepository;
import com.example.scolarite.repository.TeachingPreferencesRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final SubjectRepository subjectRepository;
    private final TeachingPreferencesRepository teachingPreferencesRepository;
    private final KeycloakUserService keycloakUserService;
    private final ObjectMapper objectMapper;
    private final SubmissionPeriodService submissionPeriodService;

    public ProfessorService(ProfessorRepository professorRepository,
                            SubjectRepository subjectRepository,
                            TeachingPreferencesRepository teachingPreferencesRepository,
                            KeycloakUserService keycloakUserService,
                            ObjectMapper objectMapper,
                            SubmissionPeriodService submissionPeriodService) {
        this.professorRepository = professorRepository;
        this.subjectRepository = subjectRepository;
        this.teachingPreferencesRepository = teachingPreferencesRepository;
        this.keycloakUserService = keycloakUserService;
        this.objectMapper = objectMapper;
        this.submissionPeriodService = submissionPeriodService;
    }

    /**
     * Créer ou mettre à jour le profil professeur à partir des données Keycloak
     */
    public ProfessorDto getOrCreateProfessorProfile(String keycloakId) {
        Optional<Professor> existing = professorRepository.findByKeycloakId(keycloakId);

        if (existing.isPresent()) {
            return mapToDto(existing.get());
        }

        // Créer un nouveau professeur
        Professor professor = new Professor(keycloakId);

        // Récupérer les infos de Keycloak
        var keycloakProfile = keycloakUserService.getUserProfile(keycloakId);
        if (keycloakProfile != null) {
            professor.setKeycloakId(keycloakId);
        }

        professor = professorRepository.save(professor);

        // Créer les préférences associées
        TeachingPreferences preferences = new TeachingPreferences(professor);
        teachingPreferencesRepository.save(preferences);

        return mapToDto(professor);
    }

    /**
     * Récupérer le profil d'un professeur avec ses matières
     */
    public ProfessorDto getProfessorProfile(String keycloakId) {
        Professor professor = professorRepository.findByKeycloakIdWithSubjects(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));
        return mapToDto(professor);
    }

    /**
     * Mettre à jour les informations du professeur (spécialité, bureau, téléphone)
     */
    public ProfessorDto updateProfessorInfo(String keycloakId, ProfessorDto professorDto) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        if (professorDto.getSpecialite() != null) {
            professor.setSpecialite(professorDto.getSpecialite());
        }
        if (professorDto.getBureau() != null) {
            professor.setBureau(professorDto.getBureau());
        }
        if (professorDto.getTelephone() != null) {
            professor.setTelephone(professorDto.getTelephone());
        }
        if (professorDto.getDateEmbauche() != null) {
            professor.setDateEmbauche(professorDto.getDateEmbauche());
        }

        professor = professorRepository.save(professor);
        return mapToDto(professor);
    }

    /**
     * Assigner une matière à un professeur
     */
    public void assignSubjectToProfessor(String keycloakId, Long subjectId, Boolean isPrimary) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Matière non trouvée"));

        // Vérifier si l'assignation existe déjà
        boolean alreadyAssigned = professor.getProfessorSubjects().stream()
                .anyMatch(ps -> ps.getSubject().getId().equals(subjectId));

        if (!alreadyAssigned) {
            ProfessorSubject professorSubject = new ProfessorSubject(professor, subject);
            professorSubject.setIsPrimary(isPrimary != null ? isPrimary : false);
            professor.getProfessorSubjects().add(professorSubject);
            professorRepository.save(professor);
        }
    }

    /**
     * Retirer une matière à un professeur
     */
    public void removeSubjectFromProfessor(String keycloakId, Long subjectId) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        professor.getProfessorSubjects().removeIf(ps -> ps.getSubject().getId().equals(subjectId));
        professorRepository.save(professor);
    }
    /**
     * Enregistrer les préférences d'enseignement
     */
    @Transactional
    public TeachingPreferencesDto saveTeachingPreferences(String keycloakId, TeachingPreferencesDto preferencesDto) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        TeachingPreferences preferences = teachingPreferencesRepository
                .findByProfessorId(professor.getId())
                .orElse(new TeachingPreferences(professor));

        // Récupérer la période courante ou exceptionnelle
        SubmissionPeriod currentPeriod = submissionPeriodService.getCurrentPeriodEntity();
        boolean hasException = submissionPeriodService.hasActiveExceptionPeriod(keycloakId);

        if (hasException) {
            SubmissionPeriodException exception = submissionPeriodService.getActiveExceptionPeriod(keycloakId);
            preferences.setPeriod(exception.getPeriod());
            preferences.setExceptionGranted(true);
        } else if (currentPeriod != null && currentPeriod.getIsActive()) {
            preferences.setPeriod(currentPeriod);
            preferences.setExceptionGranted(false);
            // Mettre à jour l'ancien champ pour compatibilité
            preferences.setSubmissionPeriodId(currentPeriod.getId());
        } else {
            throw new RuntimeException("Aucune période de soumission active");
        }

        // Sauvegarder les préférences
        preferences.setMaxHoursPerDay(preferencesDto.getMaxHoursPerDay());
        preferences.setMaxHoursPerWeek(preferencesDto.getMaxHoursPerWeek());

        // Utiliser globalNotes ou notes
        String notes = preferencesDto.getGlobalNotes() != null ? preferencesDto.getGlobalNotes() : preferencesDto.getNotes();
        preferences.setNotes(notes);

        // Sauvegarder les préférences détaillées en JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            if (preferencesDto.getDailyPreferences() != null && !preferencesDto.getDailyPreferences().isEmpty()) {
                String dailyPrefsJson = mapper.writeValueAsString(preferencesDto.getDailyPreferences());
                preferences.setConstraints(dailyPrefsJson);

                System.out.println("✅ DailyPreferences sauvegardées en JSON: " + dailyPrefsJson);
            }

            // Sauvegarder aussi les listes simples
            if (preferencesDto.getPreferredDays() != null && !preferencesDto.getPreferredDays().isEmpty()) {
                preferences.setPreferredDays(mapper.writeValueAsString(preferencesDto.getPreferredDays()));
            }
            if (preferencesDto.getUnavailableDays() != null && !preferencesDto.getUnavailableDays().isEmpty()) {
                preferences.setUnavailableDays(mapper.writeValueAsString(preferencesDto.getUnavailableDays()));
            }
            if (preferencesDto.getPreferredTimeSlots() != null && !preferencesDto.getPreferredTimeSlots().isEmpty()) {
                preferences.setPreferredTimeSlots(mapper.writeValueAsString(preferencesDto.getPreferredTimeSlots()));
            }
        } catch (Exception e) {
            System.err.println("Error saving preferences JSON: " + e.getMessage());
        }

        preferences.setIsSubmitted(true);
        preferences.setSubmissionStatus("SUBMITTED");
        preferences.setSubmittedAt(LocalDateTime.now());

        preferences = teachingPreferencesRepository.save(preferences);

        return mapPreferencesToDto(preferences);
    }


    /**
     * Récupérer les préférences d'enseignement avec création automatique du profil si nécessaire
     */
    public TeachingPreferencesDto getTeachingPreferences(String keycloakId) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> {
                    Professor newProfessor = new Professor(keycloakId);
                    newProfessor = professorRepository.save(newProfessor);
                    TeachingPreferences newPreferences = new TeachingPreferences(newProfessor);
                    teachingPreferencesRepository.save(newPreferences);
                    return newProfessor;
                });

        TeachingPreferences preferences = teachingPreferencesRepository
                .findByProfessorId(professor.getId())
                .orElseGet(() -> {
                    TeachingPreferences newPrefs = new TeachingPreferences(professor);
                    return teachingPreferencesRepository.save(newPrefs);
                });

        TeachingPreferencesDto dto = mapPreferencesToDto(preferences);

        // Si les préférences existent déjà, les retourner (même si non soumises)
        // pour permettre la reprise après rafraîchissement
        return dto;
    }

    /**
     * Vérifier si la période de saisie est ouverte
     */
    public boolean isSubmissionPeriodOpen(String keycloakId) {
        return submissionPeriodService.isSubmissionPeriodOpen(keycloakId);

    }

    // ==================== MÉTHODES DE MAPPING ====================

    private ProfessorDto mapToDto(Professor professor) {
        ProfessorDto dto = new ProfessorDto();
        dto.setKeycloakId(professor.getKeycloakId());

        // Récupérer les infos Keycloak
        var keycloakProfile = keycloakUserService.getUserProfile(professor.getKeycloakId());
        if (keycloakProfile != null) {
            dto.setUsername(keycloakProfile.getUsername());
            dto.setEmail(keycloakProfile.getEmail());
            dto.setFirstName(keycloakProfile.getFirstName());
            dto.setLastName(keycloakProfile.getLastName());
        }

        // Infos locales
        dto.setSpecialite(professor.getSpecialite());
        dto.setBureau(professor.getBureau());
        dto.setTelephone(professor.getTelephone());
        dto.setDateEmbauche(professor.getDateEmbauche());

        // Matières enseignées
        List<SubjectDto> subjects = professor.getProfessorSubjects().stream()
                .map(ps -> {
                    SubjectDto subjectDto = mapSubjectToDto(ps.getSubject());
                    subjectDto.setIsAssignedToCurrentProfessor(true);
                    return subjectDto;
                })
                .collect(Collectors.toList());
        dto.setSubjects(subjects);

        // Vérifier si les préférences ont été soumises
        Optional<TeachingPreferences> preferences = teachingPreferencesRepository.findByProfessorId(professor.getId());
        if (preferences.isPresent()) {
            dto.setHasSubmittedPreferences(preferences.get().getIsSubmitted());
            dto.setPreferencesSubmittedAt(preferences.get().getSubmittedAt());
        } else {
            dto.setHasSubmittedPreferences(false);
        }

        return dto;
    }

    private SubjectDto mapSubjectToDto(Subject subject) {
        SubjectDto dto = new SubjectDto();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setDescription(subject.getDescription());
        dto.setWeeklyHours(subject.getWeeklyHours());
        dto.setSemester(subject.getSemester());
        dto.setCredits(subject.getCredits());
        dto.setIsActive(subject.getIsActive());
        return dto;
    }

    // Dans ProfessorService.java - mapPreferencesToDto
    private TeachingPreferencesDto mapPreferencesToDto(TeachingPreferences preferences) {
        TeachingPreferencesDto dto = new TeachingPreferencesDto();
        dto.setId(preferences.getId());
        dto.setProfessorId(preferences.getProfessor().getId());
        dto.setSubmissionPeriodId(preferences.getSubmissionPeriodId());
        if (preferences.getPeriod() != null) {
            dto.setSubmissionPeriodId(preferences.getPeriod().getId());
        }
        dto.setSubmittedAt(preferences.getSubmittedAt());
        dto.setIsSubmitted(preferences.getIsSubmitted());
        dto.setMaxHoursPerDay(preferences.getMaxHoursPerDay());
        dto.setMaxHoursPerWeek(preferences.getMaxHoursPerWeek());
        dto.setNotes(preferences.getNotes());
        dto.setGlobalNotes(preferences.getNotes());
        dto.setSubmissionStatus(preferences.getSubmissionStatus());

        // ⚠️ CRITIQUE: Désérialiser correctement les JSON
        try {
            ObjectMapper mapper = new ObjectMapper();

            // Lire les préférences depuis constraints (qui stocke dailyPreferences)
            if (preferences.getConstraints() != null && !preferences.getConstraints().isEmpty()) {
                System.out.println("=== DÉSÉRIALISATION DES PRÉFÉRENCES ===");
                System.out.println("Constraints JSON: " + preferences.getConstraints());

                try {
                    // Essayer de parser comme une liste de DailyPreferencesDetailDto
                    List<DailyPreferencesDetailDto> dailyPrefs = mapper.readValue(
                            preferences.getConstraints(),
                            mapper.getTypeFactory().constructCollectionType(List.class, DailyPreferencesDetailDto.class)
                    );
                    dto.setDailyPreferences(dailyPrefs);
                    System.out.println("✅ DailyPreferences chargées: " + dailyPrefs.size());

                    // Afficher le contenu pour déboguer
                    for (DailyPreferencesDetailDto day : dailyPrefs) {
                        System.out.println("  " + day.getDay() + ": Matin=" + day.getMorning().getStatus() +
                                ", AM=" + day.getAfternoon().getStatus() +
                                ", Soir=" + day.getEvening().getStatus());
                    }
                } catch (Exception e) {
                    System.out.println("❌ Erreur parsing dailyPreferences: " + e.getMessage());
                }
            }

            // Backup: lire les anciens formats
            if (preferences.getPreferredDays() != null && !preferences.getPreferredDays().isEmpty()) {
                dto.setPreferredDays(mapper.readValue(preferences.getPreferredDays(),
                        mapper.getTypeFactory().constructCollectionType(List.class, String.class)));
            }
            if (preferences.getUnavailableDays() != null && !preferences.getUnavailableDays().isEmpty()) {
                dto.setUnavailableDays(mapper.readValue(preferences.getUnavailableDays(),
                        mapper.getTypeFactory().constructCollectionType(List.class, String.class)));
            }
            if (preferences.getPreferredTimeSlots() != null && !preferences.getPreferredTimeSlots().isEmpty()) {
                dto.setPreferredTimeSlots(mapper.readValue(preferences.getPreferredTimeSlots(),
                        mapper.getTypeFactory().constructCollectionType(List.class, String.class)));
            }
        } catch (Exception e) {
            System.err.println("Error parsing preferences JSON: " + e.getMessage());
            e.printStackTrace();
        }

        return dto;
    }

    @Transactional
    public TeachingPreferencesDto saveTeachingPreferencesDraft(String keycloakId, TeachingPreferencesDto preferencesDto) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        TeachingPreferences preferences = teachingPreferencesRepository
                .findByProfessorId(professor.getId())
                .orElse(new TeachingPreferences(professor));

        // Sauvegarder les préférences sans marquer comme soumises
        preferences.setMaxHoursPerDay(preferencesDto.getMaxHoursPerDay());
        preferences.setMaxHoursPerWeek(preferencesDto.getMaxHoursPerWeek());

        String notes = preferencesDto.getGlobalNotes() != null ? preferencesDto.getGlobalNotes() : preferencesDto.getNotes();
        preferences.setNotes(notes);

        // Sauvegarder les préférences détaillées
        try {
            ObjectMapper mapper = new ObjectMapper();
            if (preferencesDto.getDailyPreferences() != null && !preferencesDto.getDailyPreferences().isEmpty()) {
                String dailyPrefsJson = mapper.writeValueAsString(preferencesDto.getDailyPreferences());
                preferences.setConstraints(dailyPrefsJson);
            }
        } catch (Exception e) {
            System.err.println("Error saving draft: " + e.getMessage());
        }

        // Ne pas set isSubmitted à true pour le brouillon
        preferences = teachingPreferencesRepository.save(preferences);

        return mapPreferencesToDto(preferences);
    }

    // Dans ProfessorService.java
    public TeachingPreferences getTeachingPreferencesRaw(String keycloakId) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        return teachingPreferencesRepository.findByProfessorId(professor.getId()).orElse(null);
    }
}