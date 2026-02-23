package com.example.scolarite.controller.professor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/professor/profile")
public class ProfessorProfileController {

    @GetMapping
    public Map<String, Object> getProfile(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", jwt.getClaim("preferred_username"));
        profile.put("email", jwt.getClaim("email"));
        profile.put("name", jwt.getClaim("name"));
        profile.put("firstName", jwt.getClaim("given_name"));
        profile.put("lastName", jwt.getClaim("family_name"));
        profile.put("department", "Mathematics"); // This would come from DB in real app
        profile.put("specialization", "Algebra");
        profile.put("hireDate", "2020-09-01");
        return profile;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("welcomeMessage", "Teacher Dashboard");
        dashboard.put("teacherName", jwt.getClaim("name"));
        dashboard.put("teacherEmail", jwt.getClaim("email"));
        dashboard.put("stats", Map.of(
                "totalCourses", 3,
                "totalHours", 12,
                "nextClass", "Mathematics 101 - Monday 08:00"
        ));
        return dashboard;
    }
}