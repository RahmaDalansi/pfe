package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.ClassroomDto;
import com.example.scolarite.entity.Classroom;
import com.example.scolarite.entity.ClassroomType;
import com.example.scolarite.repository.ClassroomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/classrooms")
@PreAuthorize("hasRole('ADMIN')")
public class ClassroomController {

    private final ClassroomRepository classroomRepository;

    public ClassroomController(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }

    @GetMapping
    public ResponseEntity<List<ClassroomDto>> getAllClassrooms() {
        List<Classroom> classrooms = classroomRepository.findAll();
        return ResponseEntity.ok(classrooms.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ClassroomDto>> getActiveClassrooms() {
        List<Classroom> classrooms = classroomRepository.findByIsActiveTrue();
        return ResponseEntity.ok(classrooms.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassroomDto> getClassroomById(@PathVariable Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
        return ResponseEntity.ok(mapToDto(classroom));
    }

    @PostMapping
    public ResponseEntity<ClassroomDto> createClassroom(@RequestBody ClassroomDto dto) {
        Classroom classroom = new Classroom();
        classroom.setName(dto.getName());
        classroom.setNumber(dto.getNumber());
        classroom.setType(ClassroomType.valueOf(dto.getType()));
        classroom.setCapacity(dto.getCapacity());
        classroom.setIsActive(true);

        classroom = classroomRepository.save(classroom);
        return ResponseEntity.ok(mapToDto(classroom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassroomDto> updateClassroom(@PathVariable Long id, @RequestBody ClassroomDto dto) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle non trouvée"));

        if (dto.getName() != null) classroom.setName(dto.getName());
        if (dto.getNumber() != null) classroom.setNumber(dto.getNumber());
        if (dto.getType() != null) classroom.setType(ClassroomType.valueOf(dto.getType()));
        if (dto.getCapacity() != null) classroom.setCapacity(dto.getCapacity());
        if (dto.getIsActive() != null) classroom.setIsActive(dto.getIsActive());

        classroom = classroomRepository.save(classroom);
        return ResponseEntity.ok(mapToDto(classroom));
    }

    // ✅ SOFT DELETE - Désactiver (isActive = false)
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateClassroom(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Classroom classroom = classroomRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
            classroom.setIsActive(false);
            classroomRepository.save(classroom);
            response.put("success", true);
            response.put("message", "Salle désactivée avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    // ✅ SOFT DELETE - Réactiver (isActive = true)
    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activateClassroom(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Classroom classroom = classroomRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
            classroom.setIsActive(true);
            classroomRepository.save(classroom);
            response.put("success", true);
            response.put("message", "Salle réactivée avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    // ✅ HARD DELETE - Suppression définitive
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> hardDeleteClassroom(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Classroom classroom = classroomRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Salle non trouvée"));
            classroomRepository.delete(classroom);
            response.put("success", true);
            response.put("message", "Salle supprimée définitivement avec succès");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    private ClassroomDto mapToDto(Classroom classroom) {
        ClassroomDto dto = new ClassroomDto();
        dto.setId(classroom.getId());
        dto.setName(classroom.getName());
        dto.setNumber(classroom.getNumber());
        dto.setType(classroom.getType().name());
        dto.setCapacity(classroom.getCapacity());
        dto.setIsActive(classroom.getIsActive());
        return dto;
    }
}