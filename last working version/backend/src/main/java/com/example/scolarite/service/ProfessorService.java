package com.example.scolarite.service;

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

    public ProfessorService(ProfessorRepository professorRepository,
                            SubjectRepository subjectRepository,
                            TeachingPreferencesRepository teachingPreferencesRepository,
                            KeycloakUserService keycloakUserService,
                            ObjectMapper objectMapper) {
        this.professorRepository = professorRepository;
        this.subjectRepository = subjectRepository;
        this.teachingPreferencesRepository = teachingPreferencesRepository;
        this.keycloakUserService = keycloakUserService;
        this.objectMapper = objectMapper;
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
    public TeachingPreferencesDto saveTeachingPreferences(String keycloakId, TeachingPreferencesDto preferencesDto) {
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        TeachingPreferences preferences = teachingPreferencesRepository
                .findByProfessorId(professor.getId())
                .orElse(new TeachingPreferences(professor));

        // Mettre à jour les préférences
        if (preferencesDto.getPreferredDays() != null) {
            try {
                preferences.setPreferredDays(objectMapper.writeValueAsString(preferencesDto.getPreferredDays()));
            } catch (Exception e) {
                preferences.setPreferredDays(preferencesDto.getPreferredDays().toString());
            }
        }

        if (preferencesDto.getUnavailableDays() != null) {
            try {
                preferences.setUnavailableDays(objectMapper.writeValueAsString(preferencesDto.getUnavailableDays()));
            } catch (Exception e) {
                preferences.setUnavailableDays(preferencesDto.getUnavailableDays().toString());
            }
        }

        if (preferencesDto.getPreferredTimeSlots() != null) {
            try {
                preferences.setPreferredTimeSlots(objectMapper.writeValueAsString(preferencesDto.getPreferredTimeSlots()));
            } catch (Exception e) {
                preferences.setPreferredTimeSlots(preferencesDto.getPreferredTimeSlots().toString());
            }
        }

        if (preferencesDto.getMaxHoursPerDay() != null) {
            preferences.setMaxHoursPerDay(preferencesDto.getMaxHoursPerDay());
        }

        if (preferencesDto.getMaxHoursPerWeek() != null) {
            preferences.setMaxHoursPerWeek(preferencesDto.getMaxHoursPerWeek());
        }

        if (preferencesDto.getNotes() != null) {
            preferences.setNotes(preferencesDto.getNotes());
        }

        if (preferencesDto.getConstraints() != null) {
            try {
                preferences.setConstraints(objectMapper.writeValueAsString(preferencesDto.getConstraints()));
            } catch (Exception e) {
                // Ignorer
            }
        }

        // Marquer comme soumis
        preferences.setIsSubmitted(true);
        preferences.setSubmittedAt(LocalDateTime.now());

        preferences = teachingPreferencesRepository.save(preferences);

        return mapPreferencesToDto(preferences);
    }

    /**
     * Récupérer les préférences d'enseignement avec création automatique du profil si nécessaire
     */
    public TeachingPreferencesDto getTeachingPreferences(String keycloakId) {
        // S'assurer que le professeur existe
        Professor professor = professorRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> {
                    // Créer le professeur s'il n'existe pas
                    Professor newProfessor = new Professor(keycloakId);
                    newProfessor = professorRepository.save(newProfessor);

                    // Créer les préférences associées
                    TeachingPreferences newPreferences = new TeachingPreferences(newProfessor);
                    teachingPreferencesRepository.save(newPreferences);

                    return newProfessor;
                });

        // Récupérer ou créer les préférences
        TeachingPreferences preferences = teachingPreferencesRepository
                .findByProfessorId(professor.getId())
                .orElseGet(() -> {
                    TeachingPreferences newPrefs = new TeachingPreferences(professor);
                    return teachingPreferencesRepository.save(newPrefs);
                });

        return mapPreferencesToDto(preferences);
    }
    /**
     * Vérifier si la période de saisie est ouverte
     */
    public boolean isSubmissionPeriodOpen() {
        // TODO: Implémenter la logique de période de saisie
        return true; // Temporaire: toujours ouvert
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

    private TeachingPreferencesDto mapPreferencesToDto(TeachingPreferences preferences) {
        TeachingPreferencesDto dto = new TeachingPreferencesDto();
        dto.setId(preferences.getId());
        dto.setProfessorId(preferences.getProfessor().getId());
        dto.setSubmissionPeriodId(preferences.getSubmissionPeriodId());
        dto.setSubmittedAt(preferences.getSubmittedAt());
        dto.setIsSubmitted(preferences.getIsSubmitted());
        dto.setMaxHoursPerDay(preferences.getMaxHoursPerDay());
        dto.setMaxHoursPerWeek(preferences.getMaxHoursPerWeek());
        dto.setNotes(preferences.getNotes());

        // Désérialiser les JSON
        try {
            if (preferences.getPreferredDays() != null) {
                dto.setPreferredDays(objectMapper.readValue(preferences.getPreferredDays(), List.class));
            }
            if (preferences.getUnavailableDays() != null) {
                dto.setUnavailableDays(objectMapper.readValue(preferences.getUnavailableDays(), List.class));
            }
            if (preferences.getPreferredTimeSlots() != null) {
                dto.setPreferredTimeSlots(objectMapper.readValue(preferences.getPreferredTimeSlots(), List.class));
            }
            if (preferences.getConstraints() != null) {
                dto.setConstraints(objectMapper.readValue(preferences.getConstraints(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TeachingPreferencesDto.ConstraintDto.class)));
            }
        } catch (Exception e) {
            // Ignorer les erreurs de parsing
        }

        return dto;
    }


}