package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.PendingUserDto;
import com.example.scolarite.dto.UserValidationDto;
import com.example.scolarite.service.KeycloakUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/validation")
@PreAuthorize("hasRole('ADMIN')")
public class UserValidationController {

    private final KeycloakUserService keycloakUserService;

    // Injection du service seulement - c'est le service qui a accès à keycloak
    public UserValidationController(KeycloakUserService keycloakUserService) {
        this.keycloakUserService = keycloakUserService;
    }

    /**
     * Récupérer tous les utilisateurs en attente de validation
     */
    @GetMapping("/pending")
    public ResponseEntity<List<PendingUserDto>> getPendingUsers() {
        List<PendingUserDto> pendingUsers = keycloakUserService.getPendingUsers();
        System.out.println("🔍 Nombre d'utilisateurs PENDING trouvés: " + pendingUsers.size());
        return ResponseEntity.ok(pendingUsers);
    }

    /**
     * Récupérer les rôles disponibles
     */
    @GetMapping("/roles")
    public ResponseEntity<Map<String, Object>> getAvailableRoles() {
        List<String> roles = keycloakUserService.getAvailableRoles();
        Map<String, Object> response = new HashMap<>();
        response.put("roles", roles);
        return ResponseEntity.ok(response);
    }

    /**
     * Approuver un utilisateur
     */
    @PostMapping("/approve")
    public ResponseEntity<Map<String, Object>> approveUser(@RequestBody UserValidationDto validationDto) {
        Map<String, Object> response = new HashMap<>();

        if (validationDto.getUserId() == null) {
            response.put("success", false);
            response.put("message", "ID utilisateur requis");
            return ResponseEntity.badRequest().body(response);
        }

        if (validationDto.getRoles() == null || validationDto.getRoles().isEmpty()) {
            response.put("success", false);
            response.put("message", "Au moins un rôle doit être attribué");
            return ResponseEntity.badRequest().body(response);
        }

        String error = keycloakUserService.approveUser(validationDto.getUserId(), validationDto.getRoles());

        if (error == null) {
            response.put("success", true);
            response.put("message", "Utilisateur approuvé avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Erreur: " + error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Rejeter un utilisateur
     */
    @PostMapping("/reject")
    public ResponseEntity<Map<String, Object>> rejectUser(@RequestBody UserValidationDto validationDto) {
        Map<String, Object> response = new HashMap<>();

        if (validationDto.getUserId() == null) {
            response.put("success", false);
            response.put("message", "ID utilisateur requis");
            return ResponseEntity.badRequest().body(response);
        }

        String reason = validationDto.getRejectionReason() != null ?
                validationDto.getRejectionReason() : "Rejeté par l'administrateur";

        String error = keycloakUserService.rejectUser(validationDto.getUserId(), reason);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Utilisateur rejeté et supprimé");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Erreur: " + error);
            return ResponseEntity.badRequest().body(response);
        }
    }
}