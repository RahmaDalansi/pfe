package com.example.scolarite.controller.admin;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin/subjects")
public class AdminSubjectController {

    @GetMapping
    public List<Map<String, Object>> getAllSubjects() {
        List<Map<String, Object>> subjects = new ArrayList<>();

        Map<String, Object> subj1 = new HashMap<>();
        subj1.put("id", 1);
        subj1.put("code", "MATH101");
        subj1.put("name", "Calculus I");
        subj1.put("credits", 3);
        subj1.put("department", "Mathematics");
        subj1.put("semester", "S1");
        subjects.add(subj1);

        Map<String, Object> subj2 = new HashMap<>();
        subj2.put("id", 2);
        subj2.put("code", "PHY201");
        subj2.put("name", "Quantum Physics");
        subj2.put("credits", 4);
        subj2.put("department", "Physics");
        subj2.put("semester", "S3");
        subjects.add(subj2);

        return subjects;
    }

    @PostMapping
    public Map<String, Object> createSubject(@RequestBody Map<String, Object> subject) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Subject created successfully");
        response.put("subject", subject);
        response.put("id", new Random().nextInt(1000));
        return response;
    }
}