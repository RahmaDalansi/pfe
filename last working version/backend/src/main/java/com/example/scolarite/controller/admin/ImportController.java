package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.ImportResponseDto;
import com.example.scolarite.service.CsvImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/import")
@PreAuthorize("hasRole('ADMIN')")
public class ImportController {

    private final CsvImportService csvImportService;

    public ImportController(CsvImportService csvImportService) {
        this.csvImportService = csvImportService;
    }

    /**
     * Import students from CSV file
     */
    @PostMapping("/students")
    public ResponseEntity<ImportResponseDto> importStudents(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        ImportResponseDto response = csvImportService.importUsersFromCsv(file);
        return ResponseEntity.ok(response);
    }

    /**
     * Import professors from CSV file
     */
    @PostMapping("/professors")
    public ResponseEntity<ImportResponseDto> importProfessors(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        ImportResponseDto response = csvImportService.importUsersFromCsv(file);
        return ResponseEntity.ok(response);
    }

    /**
     * Generic import endpoint
     */
    @PostMapping("/users")
    public ResponseEntity<ImportResponseDto> importUsers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        ImportResponseDto response = csvImportService.importUsersFromCsv(file);
        return ResponseEntity.ok(response);
    }
}