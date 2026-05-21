// com.example.scolarite.controller/admin/SubmissionPeriodController.java
package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.*;
import com.example.scolarite.service.SubmissionPeriodService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/submission-periods")
@PreAuthorize("hasRole('ADMIN')")
public class SubmissionPeriodController {

    private final SubmissionPeriodService periodService;

    public SubmissionPeriodController(SubmissionPeriodService periodService) {
        this.periodService = periodService;
    }

    // ==================== GESTION DES PÉRIODES ====================

    @GetMapping
    public ResponseEntity<List<SubmissionPeriodDto>> getAllPeriods() {
        return ResponseEntity.ok(periodService.getAllPeriods());
    }

    @GetMapping("/current")
    public ResponseEntity<SubmissionPeriodDto> getCurrentPeriod() {
        return ResponseEntity.ok(periodService.getCurrentPeriod());
    }

    @PostMapping
    public ResponseEntity<SubmissionPeriodDto> createPeriod(@RequestBody SubmissionPeriodDto dto) {
        return ResponseEntity.ok(periodService.createPeriod(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubmissionPeriodDto> updatePeriod(@PathVariable Long id,
                                                            @RequestBody SubmissionPeriodDto dto) {
        return ResponseEntity.ok(periodService.updatePeriod(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePeriod(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            periodService.deletePeriod(id);
            response.put("success", true);
            response.put("message", "Période supprimée avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    // ==================== STATISTIQUES ====================

    @GetMapping("/{periodId}/statistics")
    public ResponseEntity<SubmissionStatisticsDto> getSubmissionStatistics(@PathVariable Long periodId) {
        return ResponseEntity.ok(periodService.getSubmissionStatistics(periodId));
    }

    @GetMapping("/{periodId}/submissions")
    public ResponseEntity<List<TeachingPreferencesDto>> getSubmissionsByPeriod(@PathVariable Long periodId) {
        return ResponseEntity.ok(periodService.getSubmissionsByPeriod(periodId));
    }

    // ==================== PÉRIODES EXCEPTIONNELLES ====================

    @PostMapping("/{periodId}/exceptions")
    public ResponseEntity<Map<String, Object>> grantExceptionPeriod(
            @PathVariable Long periodId,
            @RequestBody ExceptionPeriodRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            periodService.grantExceptionPeriod(
                    request.getProfessorKeycloakId(),
                    periodId,
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getReason()
            );
            response.put("success", true);
            response.put("message", "Période exceptionnelle accordée");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/exceptions/{exceptionId}")
    public ResponseEntity<Map<String, Object>> revokeExceptionPeriod(@PathVariable Long exceptionId) {
        Map<String, Object> response = new HashMap<>();
        try {
            periodService.revokeExceptionPeriod(exceptionId);
            response.put("success", true);
            response.put("message", "Période exceptionnelle révoquée");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{periodId}/exceptions")
    public ResponseEntity<List<ExceptionPeriodDto>> getExceptionPeriods(@PathVariable Long periodId) {
        return ResponseEntity.ok(periodService.getExceptionPeriodsByPeriod(periodId));
    }

    // Dans SubmissionPeriodController.java, ajoutez :

    /**
     * Récupérer les préférences détaillées d'un professeur pour une période donnée
     */
    @GetMapping("/{periodId}/professors/{professorKeycloakId}/preferences")
    public ResponseEntity<TeachingPreferencesDto> getProfessorPreferencesForPeriod(
            @PathVariable Long periodId,
            @PathVariable String professorKeycloakId) {
        TeachingPreferencesDto preferences = periodService.getProfessorPreferencesForPeriod(periodId, professorKeycloakId);
        return ResponseEntity.ok(preferences);
    }

    /**
     * Mettre à jour une période exceptionnelle
     */
    @PutMapping("/exceptions/{exceptionId}")
    public ResponseEntity<Map<String, Object>> updateExceptionPeriod(
            @PathVariable Long exceptionId,
            @RequestBody ExceptionPeriodRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        try {
            periodService.updateExceptionPeriod(exceptionId, request);
            response.put("success", true);
            response.put("message", "Période exceptionnelle mise à jour avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer les préférences détaillées de tous les professeurs pour une période
     */
    @GetMapping("/{periodId}/all-preferences")
    public ResponseEntity<List<ProfessorPreferencesDetailDto>> getAllProfessorsPreferencesForPeriod(
            @PathVariable Long periodId) {
        List<ProfessorPreferencesDetailDto> preferences = periodService.getAllProfessorsPreferencesForPeriod(periodId);
        return ResponseEntity.ok(preferences);
    }
}