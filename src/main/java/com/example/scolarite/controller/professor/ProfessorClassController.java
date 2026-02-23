package com.example.scolarite.controller.professor;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/professor/classes")
public class ProfessorClassController {

    @GetMapping
    public List<Map<String, Object>> getMyClasses() {
        List<Map<String, Object>> classes = new ArrayList<>();

        Map<String, Object> class1 = new HashMap<>();
        class1.put("id", 1);
        class1.put("name", "Class A");
        class1.put("subject", "Mathematics 101");
        class1.put("schedule", "Monday 08:00-10:00");
        class1.put("room", "A101");
        class1.put("studentCount", 30);
        classes.add(class1);

        Map<String, Object> class2 = new HashMap<>();
        class2.put("id", 2);
        class2.put("name", "Class B");
        class2.put("subject", "Mathematics 102");
        class2.put("schedule", "Monday 10:00-12:00");
        class2.put("room", "A102");
        class2.put("studentCount", 28);
        classes.add(class2);

        return classes;
    }

    @GetMapping("/{classId}/students")
    public List<Map<String, Object>> getClassStudents(@PathVariable Long classId) {
        List<Map<String, Object>> students = new ArrayList<>();

        Map<String, Object> student1 = new HashMap<>();
        student1.put("id", 101);
        student1.put("name", "Alice Johnson");
        student1.put("email", "alice@student.com");
        students.add(student1);

        Map<String, Object> student2 = new HashMap<>();
        student2.put("id", 102);
        student2.put("name", "Bob Smith");
        student2.put("email", "bob@student.com");
        students.add(student2);

        return students;
    }
}