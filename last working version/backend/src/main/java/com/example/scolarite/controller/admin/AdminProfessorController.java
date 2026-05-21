package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.ProfessorDto;
import com.example.scolarite.dto.ProfileDto;
import com.example.scolarite.dto.SubjectDto;
import com.example.scolarite.entity.Professor;
import com.example.scolarite.entity.TeachingPreferences;
import com.example.scolarite.repository.ProfessorRepository;
import com.example.scolarite.repository.TeachingPreferencesRepository;
import com.example.scolarite.service.KeycloakUserService;
import com.example.scolarite.service.ProfessorService;
import com.example.scolarite.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/professors")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfessorController {

    private final ProfessorService professorService;
    private final SubjectService subjectService;

    public AdminProfessorController(ProfessorService professorService, SubjectService subjectService) {
        this.professorService = professorService;
        this.subjectService = subjectService;
    }

    /**
     * Récupérer tous les professeurs
     */
    @GetMapping
    public ResponseEntity<List<ProfessorDto>> getAllProfessors() {
        // TODO: Implémenter la récupération de tous les professeurs
        return ResponseEntity.ok(List.of());
    }

    /**
     * Récupérer les matières d'un professeur
     */
    @GetMapping("/{keycloakId}/subjects")
    public ResponseEntity<List<SubjectDto>> getProfessorSubjects(@PathVariable String keycloakId) {
        ProfessorDto professor = professorService.getProfessorProfile(keycloakId);
        return ResponseEntity.ok(professor.getSubjects());
    }

    /**
     * Assigner une matière à un professeur
     */
    @PostMapping("/{keycloakId}/subjects/{subjectId}")
    public ResponseEntity<Map<String, Object>> assignSubject(
            @PathVariable String keycloakId,
            @PathVariable Long subjectId,
            @RequestParam(required = false) Boolean isPrimary) {
        Map<String, Object> response = new HashMap<>();

        try {
            professorService.assignSubjectToProfessor(keycloakId, subjectId, isPrimary);
            response.put("success", true);
            response.put("message", "Matière assignée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Retirer une matière d'un professeur
     */
    @DeleteMapping("/{keycloakId}/subjects/{subjectId}")
    public ResponseEntity<Map<String, Object>> removeSubject(
            @PathVariable String keycloakId,
            @PathVariable Long subjectId) {
        Map<String, Object> response = new HashMap<>();

        try {
            professorService.removeSubjectFromProfessor(keycloakId, subjectId);
            response.put("success", true);
            response.put("message", "Matière retirée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }







    // Dans AdminProfessorController.java
    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private TeachingPreferencesRepository teachingPreferencesRepository;

    @Autowired
    private KeycloakUserService keycloakUserService;

    @PostMapping("/sync-from-keycloak")
    public ResponseEntity<Map<String, Object>> syncProfessorsFromKeycloak() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<ProfileDto> allProfessors = keycloakUserService.getAllUsers("PROFESSOR", null);
            int created = 0;
            int alreadyExist = 0;

            for (ProfileDto professorProfile : allProfessors) {
                if (!professorRepository.existsByKeycloakId(professorProfile.getId())) {
                    Professor professor = new Professor(professorProfile.getId());
                    professor = professorRepository.save(professor);

                    // Créer les préférences associées
                    TeachingPreferences preferences = new TeachingPreferences(professor);
                    teachingPreferencesRepository.save(preferences);

                    created++;
                } else {
                    alreadyExist++;
                }
            }

            response.put("success", true);
            response.put("totalKeycloakProfessors", allProfessors.size());
            response.put("created", created);
            response.put("alreadyExist", alreadyExist);
            response.put("message", created + " professeurs synchronisés avec succès");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }



}