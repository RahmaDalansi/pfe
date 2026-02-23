package com.example.scolarite.controller.admin;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin/schedules")
public class AdminScheduleController {

    // Get all schedules
    @GetMapping
    public List<Map<String, Object>> getAllSchedules() {
        List<Map<String, Object>> schedules = new ArrayList<>();

        Map<String, Object> schedule1 = new HashMap<>();
        schedule1.put("id", 1);
        schedule1.put("professorId", 1);
        schedule1.put("professorName", "John Doe");
        schedule1.put("day", "Monday");
        schedule1.put("time", "08:00-10:00");
        schedule1.put("subject", "Mathematics 101");
        schedule1.put("class", "Room A101");
        schedule1.put("group", "Class A");
        schedules.add(schedule1);

        Map<String, Object> schedule2 = new HashMap<>();
        schedule2.put("id", 2);
        schedule2.put("professorId", 1);
        schedule2.put("professorName", "John Doe");
        schedule2.put("day", "Monday");
        schedule2.put("time", "10:00-12:00");
        schedule2.put("subject", "Mathematics 102");
        schedule2.put("class", "Room A102");
        schedule2.put("group", "Class B");
        schedules.add(schedule2);

        return schedules;
    }

    // Get schedule by professor ID
    @GetMapping("/professor/{professorId}")
    public List<Map<String, Object>> getScheduleByProfessor(@PathVariable Long professorId) {
        List<Map<String, Object>> schedules = new ArrayList<>();

        Map<String, Object> schedule = new HashMap<>();
        schedule.put("id", 1);
        schedule.put("professorId", professorId);
        schedule.put("day", "Monday");
        schedule.put("time", "08:00-10:00");
        schedule.put("subject", "Mathematics 101");
        schedule.put("class", "Room A101");
        schedules.add(schedule);

        return schedules;
    }

    // Create new schedule entry
    @PostMapping
    public Map<String, Object> createSchedule(@RequestBody Map<String, Object> schedule) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Schedule created successfully");
        response.put("schedule", schedule);
        response.put("id", new Random().nextInt(1000));
        return response;
    }

    // Update schedule entry
    @PutMapping("/{id}")
    public Map<String, Object> updateSchedule(@PathVariable Long id, @RequestBody Map<String, Object> schedule) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Schedule updated successfully");
        response.put("id", id);
        response.put("schedule", schedule);
        return response;
    }

    // Delete schedule entry
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteSchedule(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Schedule deleted successfully");
        response.put("id", id);
        return response;
    }
}