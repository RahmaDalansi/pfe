package com.example.scolarite.controller.admin;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin/professors")
public class AdminProfessorController {

    // Get all professors
    @GetMapping
    public List<Map<String, Object>> getAllProfessors() {
        List<Map<String, Object>> professors = new ArrayList<>();

        Map<String, Object> prof1 = new HashMap<>();
        prof1.put("id", 1);
        prof1.put("firstName", "John");
        prof1.put("lastName", "Doe");
        prof1.put("email", "john.doe@school.com");
        prof1.put("department", "Mathematics");
        prof1.put("specialization", "Algebra");
        prof1.put("hireDate", "2020-09-01");
        professors.add(prof1);

        Map<String, Object> prof2 = new HashMap<>();
        prof2.put("id", 2);
        prof2.put("firstName", "Jane");
        prof2.put("lastName", "Smith");
        prof2.put("email", "jane.smith@school.com");
        prof2.put("department", "Physics");
        prof2.put("specialization", "Quantum Mechanics");
        prof2.put("hireDate", "2019-08-15");
        professors.add(prof2);

        return professors;
    }

    // Get professor by ID
    @GetMapping("/{id}")
    public Map<String, Object> getProfessorById(@PathVariable Long id) {
        Map<String, Object> professor = new HashMap<>();
        professor.put("id", id);
        professor.put("firstName", "John");
        professor.put("lastName", "Doe");
        professor.put("email", "john.doe@school.com");
        professor.put("department", "Mathematics");
        professor.put("specialization", "Algebra");
        return professor;
    }

    // Create new professor
    @PostMapping
    public Map<String, Object> createProfessor(@RequestBody Map<String, Object> professor) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Professor created successfully");
        response.put("professor", professor);
        response.put("id", new Random().nextInt(1000));
        return response;
    }

    // Update professor
    @PutMapping("/{id}")
    public Map<String, Object> updateProfessor(@PathVariable Long id, @RequestBody Map<String, Object> professor) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Professor updated successfully");
        response.put("id", id);
        response.put("professor", professor);
        return response;
    }

    // Delete professor
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteProfessor(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Professor deleted successfully");
        response.put("id", id);
        return response;
    }
}