package com.example.scolarite.controller;

import com.example.scolarite.dto.ProfessorDto;
import com.example.scolarite.dto.TeachingPreferencesDto;
import com.example.scolarite.entity.Professor;
import com.example.scolarite.entity.TeachingPreferences;
import com.example.scolarite.service.ProfessorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/professor")
@PreAuthorize("hasRole('PROFESSOR')")
public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    /**
     * Récupérer le profil du professeur connecté
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfessorDto> getProfile(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        ProfessorDto profile = professorService.getOrCreateProfessorProfile(keycloakId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Mettre à jour les informations du professeur
     */
    @PutMapping("/profile")
    public ResponseEntity<ProfessorDto> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProfessorDto professorDto) {
        String keycloakId = jwt.getSubject();
        ProfessorDto updated = professorService.updateProfessorInfo(keycloakId, professorDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Vérifier si la période de saisie est ouverte
     */
    @GetMapping("/submission-period/status")
    public ResponseEntity<Map<String, Object>> getSubmissionPeriodStatus(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        Map<String, Object> response = new HashMap<>();
        response.put("isOpen", professorService.isSubmissionPeriodOpen(keycloakId));
        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer les préférences d'enseignement
     */
    @GetMapping("/preferences")
    public ResponseEntity<TeachingPreferencesDto> getPreferences(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        TeachingPreferencesDto preferences = professorService.getTeachingPreferences(keycloakId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Enregistrer les préférences d'enseignement
     */
    @PostMapping("/preferences")
    public ResponseEntity<TeachingPreferencesDto> savePreferences(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody TeachingPreferencesDto preferencesDto) {
        String keycloakId = jwt.getSubject();

        // Vérifier si la période est ouverte
        if (!professorService.isSubmissionPeriodOpen(keycloakId)) {
            throw new RuntimeException("La période de saisie des préférences est fermée");
        }

        TeachingPreferencesDto saved = professorService.saveTeachingPreferences(keycloakId, preferencesDto);
        return ResponseEntity.ok(saved);
    }

    // Dans ProfessorController.java, ajouter un endpoint pour sauvegarder le brouillon
    @PostMapping("/preferences/draft")
    public ResponseEntity<Map<String, Object>> saveDraftPreferences(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody TeachingPreferencesDto preferencesDto) {
        String keycloakId = jwt.getSubject();
        Map<String, Object> response = new HashMap<>();

        try {
            // Permettre la sauvegarde même si période fermée (pour brouillon)
            TeachingPreferencesDto saved = professorService.saveTeachingPreferencesDraft(keycloakId, preferencesDto);
            response.put("success", true);
            response.put("message", "Brouillon sauvegardé");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ✅ CORRECTION: Endpoint de débogage
    @GetMapping("/debug/preferences")
    public ResponseEntity<Map<String, Object>> debugPreferences(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        Map<String, Object> response = new HashMap<>();

        // ✅ Correction: getProfessorProfile retourne ProfessorDto, pas Professor
        // On utilise getProfessorByKeycloakId si disponible, ou on récupère directement
        ProfessorDto professorDto = professorService.getProfessorProfile(keycloakId);
        TeachingPreferences preferences = professorService.getTeachingPreferencesRaw(keycloakId);

        response.put("professor", professorDto);
        response.put("preferences", preferences);
        response.put("constraints", preferences != null ? preferences.getConstraints() : null);
        response.put("hasPreferences", preferences != null);
        response.put("isSubmitted", preferences != null ? preferences.getIsSubmitted() : false);

        return ResponseEntity.ok(response);
    }
}