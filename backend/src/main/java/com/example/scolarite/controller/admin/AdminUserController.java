package com.example.scolarite.controller.admin;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    // Admin dashboard - main entry point
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("welcomeMessage", "Admin Dashboard");
        response.put("adminName", jwt.getClaim("name"));
        response.put("adminEmail", jwt.getClaim("email"));
        response.put("stats", Map.of(
                "totalTeachers", 15,
                "totalSubjects", 24,
                "totalClasses", 8,
                "pendingRequests", 3
        ));
        return response;
    }

    // Get current admin profile
    @GetMapping("/profile")
    public Map<String, Object> getProfile(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("username", jwt.getClaim("preferred_username"));
        response.put("email", jwt.getClaim("email"));
        response.put("name", jwt.getClaim("name"));
        response.put("roles", jwt.getClaim("realm_access"));
        return response;
    }
}