package com.example.scolarite.controller.professor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/professor/schedule")
public class ProfessorScheduleController {

    // Get professor's own schedule
    @GetMapping
    public List<Map<String, Object>> getMySchedule(@AuthenticationPrincipal Jwt jwt) {
        String professorName = jwt.getClaim("name");
        String email = jwt.getClaim("email");

        List<Map<String, Object>> schedule = new ArrayList<>();

        // Monday schedule
        Map<String, Object> monday = new HashMap<>();
        monday.put("day", "Monday");
        monday.put("courses", Arrays.asList(
                Map.of(
                        "time", "08:00-10:00",
                        "subject", "Mathematics 101",
                        "class", "Room A101",
                        "group", "Class A"
                ),
                Map.of(
                        "time", "10:00-12:00",
                        "subject", "Mathematics 102",
                        "class", "Room A102",
                        "group", "Class B"
                )
        ));
        schedule.add(monday);

        // Tuesday schedule
        Map<String, Object> tuesday = new HashMap<>();
        tuesday.put("day", "Tuesday");
        tuesday.put("courses", Arrays.asList(
                Map.of(
                        "time", "08:00-10:00",
                        "subject", "Algebra",
                        "class", "Room B201",
                        "group", "Class C"
                )
        ));
        schedule.add(tuesday);

        // Wednesday schedule
        Map<String, Object> wednesday = new HashMap<>();
        wednesday.put("day", "Wednesday");
        wednesday.put("courses", Arrays.asList(
                Map.of(
                        "time", "14:00-16:00",
                        "subject", "Geometry",
                        "class", "Room A103",
                        "group", "Class A"
                )
        ));
        schedule.add(wednesday);

        return schedule;
    }

    // Request schedule change
    @PostMapping("/requests")
    public Map<String, Object> requestScheduleChange(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Schedule change request submitted successfully");
        response.put("requestId", new Random().nextInt(1000));
        response.put("status", "pending");
        response.put("request", request);
        response.put("submittedAt", new Date());
        return response;
    }

    // Get professor's schedule requests status
    @GetMapping("/requests")
    public List<Map<String, Object>> getMyRequests() {
        List<Map<String, Object>> requests = new ArrayList<>();

        Map<String, Object> req1 = new HashMap<>();
        req1.put("id", 1);
        req1.put("reason", "Need to change Monday morning class");
        req1.put("status", "pending");
        req1.put("submittedAt", "2026-02-15");
        requests.add(req1);

        return requests;
    }
}