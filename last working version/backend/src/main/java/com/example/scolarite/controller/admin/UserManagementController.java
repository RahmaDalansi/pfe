package com.example.scolarite.controller.admin;

import com.example.scolarite.dto.BulkActionResult;
import com.example.scolarite.dto.BulkActionDto;
import com.example.scolarite.dto.ProfileDto;
import com.example.scolarite.service.KeycloakUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final KeycloakUserService keycloakUserService;

    public UserManagementController(KeycloakUserService keycloakUserService) {
        this.keycloakUserService = keycloakUserService;
    }

    /**
     * Récupérer tous les utilisateurs
     */
    @GetMapping
    public ResponseEntity<List<ProfileDto>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        List<ProfileDto> users = keycloakUserService.getAllUsers(role, search);
        return ResponseEntity.ok(users);
    }

    /**
     * Récupérer les détails d'un utilisateur spécifique
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ProfileDto> getUserById(@PathVariable String userId) {
        ProfileDto user = keycloakUserService.getUserProfile(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    /**
     * Mettre à jour un utilisateur (admin seulement)
     */
    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable String userId,
            @RequestBody ProfileDto userDto) {
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.updateUserByAdmin(userId, userDto);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Utilisateur mis à jour avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Réinitialiser le mot de passe d'un utilisateur (avec son CIN)
     */
    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.resetUserPasswordToCin(userId);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Mot de passe réinitialisé avec le CIN de l'utilisateur");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Activer/Désactiver un utilisateur
     */
    @PostMapping("/{userId}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.toggleUserEnabled(userId);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Statut utilisateur modifié");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Supprimer un utilisateur
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.deleteUser(userId);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Utilisateur supprimé avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Assigner un rôle à un utilisateur
     */
    @PostMapping("/{userId}/roles/{roleName}")
    public ResponseEntity<Map<String, Object>> assignRole(
            @PathVariable String userId,
            @PathVariable String roleName) {
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.assignRoleToUser(userId, roleName);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Rôle assigné avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /** Retirer un rôle à un utilisateur */

    @DeleteMapping("/{userId}/roles/{roleName}")
    public ResponseEntity<Map<String, Object>> removeRole(
            @PathVariable String userId,
            @PathVariable String roleName) {
        Map<String, Object> response = new HashMap<>();

        String error = keycloakUserService.removeRoleFromUser(userId, roleName);

        if (error == null) {
            response.put("success", true);
            response.put("message", "Rôle retiré avec succès");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Action groupée : Réinitialiser les mots de passe de plusieurs utilisateurs
     */
    @PostMapping("/bulk/reset-passwords")
    public ResponseEntity<Map<String, Object>> bulkResetPasswords(
            @RequestBody BulkActionDto bulkAction,
            @AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();

        String currentUserId = jwt.getSubject();

        // Vérifier qu'on ne réinitialise pas son propre mot de passe
        if (bulkAction.getUserIds().contains(currentUserId)) {
            response.put("success", false);
            response.put("message", "Vous ne pouvez pas réinitialiser votre propre mot de passe via cette action");
            return ResponseEntity.badRequest().body(response);
        }

        BulkActionResult result = keycloakUserService.bulkResetPasswords(
                bulkAction.getUserIds(),
                bulkAction.isConfirmAction()
        );

        response.put("success", true);
        response.put("total", result.getTotal());
        response.put("successCount", result.getSuccessCount());
        response.put("failureCount", result.getFailureCount());
        response.put("results", result.getResults());
        // ✅ Correction : utiliser les guillemets doubles au lieu des backticks
        response.put("message", result.getSuccessCount() + " utilisateur(s) réinitialisé(s) avec succès, " + result.getFailureCount() + " échec(s)");

        return ResponseEntity.ok(response);
    }

    /**
     * Action groupée : Désactiver/Activer plusieurs utilisateurs
     */
    @PostMapping("/bulk/toggle-status")
    public ResponseEntity<Map<String, Object>> bulkToggleStatus(
            @RequestBody BulkActionDto bulkAction,
            @AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();

        String currentUserId = jwt.getSubject();

        // Vérifier qu'on ne désactive pas son propre compte
        if (bulkAction.getUserIds().contains(currentUserId)) {
            response.put("success", false);
            response.put("message", "Vous ne pouvez pas désactiver votre propre compte via cette action");
            return ResponseEntity.badRequest().body(response);
        }

        BulkActionResult result = keycloakUserService.bulkToggleStatus(
                bulkAction.getUserIds(),
                bulkAction.isEnable(),
                bulkAction.isConfirmAction()
        );

        response.put("success", true);
        response.put("total", result.getTotal());
        response.put("successCount", result.getSuccessCount());
        response.put("failureCount", result.getFailureCount());
        response.put("results", result.getResults());

        String action = bulkAction.isEnable() ? "activé(s)" : "désactivé(s)";
        // ✅ Correction : utiliser les guillemets doubles au lieu des backticks
        response.put("message", result.getSuccessCount() + " utilisateur(s) " + action + " avec succès, " + result.getFailureCount() + " échec(s)");

        return ResponseEntity.ok(response);
    }

}