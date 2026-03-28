package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.ProfessorDto;
import com.example.scolarite.dto.SubjectDto;
import com.example.scolarite.service.ProfessorService;
import com.example.scolarite.service.SubjectService;
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
}