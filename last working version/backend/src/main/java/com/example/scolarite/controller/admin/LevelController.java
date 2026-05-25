// LevelController.java
package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.LevelDto;
import com.example.scolarite.service.LevelService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/levels")
@PreAuthorize("hasRole('ADMIN')")
public class LevelController {

    private final LevelService levelService;

    public LevelController(LevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping
    public ResponseEntity<List<LevelDto>> getAllLevels(
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) Long specialtyId) {
        return ResponseEntity.ok(levelService.getAllLevels(activeOnly, specialtyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LevelDto> getLevelById(@PathVariable Long id) {
        return ResponseEntity.ok(levelService.getLevelById(id));
    }

    @PostMapping
    public ResponseEntity<LevelDto> createLevel(@RequestBody LevelDto dto) {
        return ResponseEntity.ok(levelService.createLevel(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LevelDto> updateLevel(@PathVariable Long id,
                                                @RequestBody LevelDto dto) {
        return ResponseEntity.ok(levelService.updateLevel(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteLevel(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            levelService.deleteLevel(id);
            response.put("success", true);
            response.put("message", "Niveau désactivé avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, Object>> hardDeleteLevel(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            levelService.hardDeleteLevel(id);
            response.put("success", true);
            response.put("message", "Niveau supprimé définitivement");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}