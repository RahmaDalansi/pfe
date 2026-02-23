package com.example.scolarite.controller.admin;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin/classes")
public class AdminClassController {

    @GetMapping
    public List<Map<String, Object>> getAllClasses() {
        List<Map<String, Object>> classes = new ArrayList<>();

        Map<String, Object> class1 = new HashMap<>();
        class1.put("id", 1);
        class1.put("name", "Class A");
        class1.put("level", "Bachelor 1");
        class1.put("department", "Mathematics");
        class1.put("studentCount", 30);
        classes.add(class1);

        Map<String, Object> class2 = new HashMap<>();
        class2.put("id", 2);
        class2.put("name", "Class B");
        class2.put("level", "Bachelor 1");
        class2.put("department", "Physics");
        class2.put("studentCount", 25);
        classes.add(class2);

        return classes;
    }
}