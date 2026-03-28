package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.SubjectDto;
import com.example.scolarite.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/subjects")
@PreAuthorize("hasRole('ADMIN')")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    /**
     * Récupérer toutes les matières
     */
    @GetMapping
    public ResponseEntity<List<SubjectDto>> getAllSubjects(
            @RequestParam(required = false) Boolean activeOnly) {
        List<SubjectDto> subjects = subjectService.getAllSubjects(activeOnly);
        return ResponseEntity.ok(subjects);
    }

    /**
     * Récupérer une matière par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubjectDto> getSubjectById(@PathVariable Long id) {
        SubjectDto subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(subject);
    }

    /**
     * Créer une nouvelle matière
     */
    @PostMapping
    public ResponseEntity<SubjectDto> createSubject(@RequestBody SubjectDto subjectDto) {
        SubjectDto created = subjectService.createSubject(subjectDto);
        return ResponseEntity.ok(created);
    }

    /**
     * Mettre à jour une matière
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubjectDto> updateSubject(
            @PathVariable Long id,
            @RequestBody SubjectDto subjectDto) {
        SubjectDto updated = subjectService.updateSubject(id, subjectDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprimer une matière (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSubject(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            subjectService.deleteSubject(id);
            response.put("success", true);
            response.put("message", "Matière supprimée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Récupérer les matières par semestre
     */
    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<SubjectDto>> getSubjectsBySemester(@PathVariable Integer semester) {
        List<SubjectDto> subjects = subjectService.getSubjectsBySemester(semester);
        return ResponseEntity.ok(subjects);
    }
}