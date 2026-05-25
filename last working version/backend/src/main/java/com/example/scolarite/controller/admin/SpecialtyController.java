// SpecialtyController.java
package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.SpecialtyDto;
import com.example.scolarite.service.SpecialtyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/specialties")
@PreAuthorize("hasRole('ADMIN')")
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    public SpecialtyController(SpecialtyService specialtyService) {
        this.specialtyService = specialtyService;
    }

    @GetMapping
    public ResponseEntity<List<SpecialtyDto>> getAllSpecialties(
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(specialtyService.getAllSpecialties(activeOnly, departmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialtyDto> getSpecialtyById(@PathVariable Long id) {
        return ResponseEntity.ok(specialtyService.getSpecialtyById(id));
    }

    @PostMapping
    public ResponseEntity<SpecialtyDto> createSpecialty(@RequestBody SpecialtyDto dto) {
        return ResponseEntity.ok(specialtyService.createSpecialty(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpecialtyDto> updateSpecialty(@PathVariable Long id,
                                                        @RequestBody SpecialtyDto dto) {
        return ResponseEntity.ok(specialtyService.updateSpecialty(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSpecialty(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            specialtyService.deleteSpecialty(id);
            response.put("success", true);
            response.put("message", "Spécialité désactivée avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, Object>> hardDeleteSpecialty(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            specialtyService.hardDeleteSpecialty(id);
            response.put("success", true);
            response.put("message", "Spécialité supprimée définitivement");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}