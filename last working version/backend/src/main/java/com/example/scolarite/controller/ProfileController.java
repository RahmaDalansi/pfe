package com.example.scolarite.controller;

import com.example.scolarite.dto.ProfileDto;
import com.example.scolarite.dto.PasswordChangeDto;
import com.example.scolarite.service.KeycloakUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final KeycloakUserService keycloakUserService;

    public ProfileController(KeycloakUserService keycloakUserService) {
        this.keycloakUserService = keycloakUserService;
    }

    /**
     * Récupérer le profil complet de l'utilisateur connecté
     */
    @GetMapping
    public ResponseEntity<ProfileDto> getProfile(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        ProfileDto profile = keycloakUserService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Mettre à jour les informations du profil (nom, prénom, email)
     */
    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProfileDto profileDto) {

        String userId = jwt.getSubject();
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.updateUserProfile(userId, profileDto);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Profil mis à jour avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Changer le mot de passe
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody PasswordChangeDto passwordChangeDto) {

        String userId = jwt.getSubject();
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.changePassword(
                userId,
                passwordChangeDto.getCurrentPassword(),
                passwordChangeDto.getNewPassword()
        );

        if (error == null) {
            response.put("success", true);
            response.put("message", "Mot de passe modifié avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }
}