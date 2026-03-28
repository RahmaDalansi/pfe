package com.example.scolarite.controller.publics;

import com.example.scolarite.dto.RegisterRequestDto;
import com.example.scolarite.service.KeycloakUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/auth")
public class RegistrationController {

    private final KeycloakUserService keycloakUserService;

    public RegistrationController(KeycloakUserService keycloakUserService) {
        this.keycloakUserService = keycloakUserService;
    }

    /**
     * Inscription d'un nouvel utilisateur (étudiant ou professeur)
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequestDto registerDto) {
        Map<String, Object> response = new HashMap<>();

        // Validation basique
        if (registerDto.getUsername() == null || registerDto.getUsername().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Le nom d'utilisateur est requis");
            return ResponseEntity.badRequest().body(response);
        }

        if (registerDto.getEmail() == null || registerDto.getEmail().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "L'email est requis");
            return ResponseEntity.badRequest().body(response);
        }

        // VALIDATION POUR LE CIN
        if (registerDto.getCin() == null || registerDto.getCin().trim().length() < 6) {
            response.put("success", false);
            response.put("message", "Le CIN doit contenir au moins 6 caractères");
            return ResponseEntity.badRequest().body(response);
        }

        // Vérifier si le username est disponible
        if (!keycloakUserService.isUsernameAvailable(registerDto.getUsername())) {
            response.put("success", false);
            response.put("message", "Ce nom d'utilisateur est déjà pris");
            return ResponseEntity.badRequest().body(response);
        }

        // Vérifier si l'email est disponible
        if (!keycloakUserService.isEmailAvailable(registerDto.getEmail())) {
            response.put("success", false);
            response.put("message", "Cet email est déjà utilisé");
            return ResponseEntity.badRequest().body(response);
        }

        // Inscription
        String error = keycloakUserService.registerPendingUser(registerDto);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Inscription réussie ! Votre compte est en attente de validation par un administrateur.");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Erreur lors de l'inscription: " + error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Vérifier si un nom d'utilisateur est disponible
     */
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Object>> checkUsername(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        boolean available = keycloakUserService.isUsernameAvailable(username);
        response.put("available", available);
        response.put("username", username);
        return ResponseEntity.ok(response);
    }

    /**
     * Vérifier si un email est disponible
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        boolean available = keycloakUserService.isEmailAvailable(email);
        response.put("available", available);
        response.put("email", email);
        return ResponseEntity.ok(response);
    }
}