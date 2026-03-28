package com.example.scolarite.controller;

import com.example.scolarite.service.KeycloakImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@RestController
@RequestMapping("/api/import")
@PreAuthorize("hasRole('ADMIN')")
public class ImportController {
    @Autowired
    private KeycloakImportService keycloakService;

    @PostMapping("/students")
    public ResponseEntity<String> importStudents(@RequestParam("file") MultipartFile file) {
        return importUsers(file, "STUDENT");
    }

    @PostMapping("/professors")
    public ResponseEntity<String> importProfessors(@RequestParam("file") MultipartFile file) {
        return importUsers(file, "PROFESSOR");
    }

    private ResponseEntity<String> importUsers(MultipartFile file, String role) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            int count = 0;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; }
                String[] data = line.split(",");
                if (data.length >= 4) {
                    keycloakService.createUser(data[0], data[1], data[2], data[3], role);
                    count++;
                }
            }
            return ResponseEntity.ok("Importation réussie de " + count + " " + role + "(s).");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur : " + e.getMessage());
        }
    }
}
