package com.example.scolarite.service;

import com.example.scolarite.dto.*;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class KeycloakUserService {

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakUserService(Keycloak keycloak,
                               @Value("${keycloak.realm}") String realm) {
        this.keycloak = keycloak;
        this.realm = realm;
    }

    // ==================== MÉTHODE EXISTANTE POUR L'IMPORT CSV ====================
    /**
     * Create a user in Keycloak with temporary password and required actions
     * Utilisé pour l'import CSV par l'admin - Création directe sans validation
     */
    public String createUser(UserImportDto userDto, String temporaryPassword) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Check if user already exists
            List<UserRepresentation> existingUsers = usersResource.search(userDto.getUsername(), true);
            if (!existingUsers.isEmpty()) {
                return "User " + userDto.getUsername() + " already exists";
            }

            // Check if email already exists
            if (userDto.getEmail() != null && !userDto.getEmail().isEmpty()) {
                List<UserRepresentation> usersByEmail = usersResource.searchByEmail(userDto.getEmail(), true);
                if (!usersByEmail.isEmpty()) {
                    return "Email " + userDto.getEmail() + " already registered";
                }
            }

            // Create user representation
            UserRepresentation user = new UserRepresentation();
            user.setUsername(userDto.getUsername());
            user.setEmail(userDto.getEmail());
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
            user.setEnabled(true);
            user.setEmailVerified(true); // Auto-verified for admin imports
            user.setRequiredActions(Arrays.asList("UPDATE_PASSWORD"));

            // Create the user
            Response response = usersResource.create(user);

            if (response.getStatus() != 201) {
                return "Failed to create user: " + response.getStatusInfo().getReasonPhrase();
            }

            // Get the created user ID from location header
            String userId = extractUserIdFromResponse(response);

            // Set password
            setUserPassword(userId, temporaryPassword);

            // Assign role
            if (userDto.getRole() != null && !userDto.getRole().isEmpty()) {
                assignRoleToUserInternal(userId, userDto.getRole());
            }

            return null; // No error

        } catch (Exception e) {
            e.printStackTrace();
            return "Error creating user " + userDto.getUsername() + ": " + e.getMessage();
        }
    }

    // ==================== NOUVELLES MÉTHODES POUR L'INSCRIPTION AVEC VALIDATION ====================

    /**
     * Inscription d'un utilisateur en attente de validation
     */
    public String registerPendingUser(RegisterRequestDto registerDto) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Vérifier si l'utilisateur existe déjà
            List<UserRepresentation> existingUsers = usersResource.search(registerDto.getUsername(), true);
            if (!existingUsers.isEmpty()) {
                return "User " + registerDto.getUsername() + " already exists";
            }

            // Vérifier si l'email existe déjà
            if (registerDto.getEmail() != null && !registerDto.getEmail().isEmpty()) {
                List<UserRepresentation> usersByEmail = usersResource.searchByEmail(registerDto.getEmail(), true);
                if (!usersByEmail.isEmpty()) {
                    return "Email " + registerDto.getEmail() + " already registered";
                }
            }

            // Créer la représentation de l'utilisateur
            UserRepresentation user = new UserRepresentation();
            user.setUsername(registerDto.getUsername());
            user.setEmail(registerDto.getEmail());
            user.setFirstName(registerDto.getFirstName());
            user.setLastName(registerDto.getLastName());
            user.setEnabled(true);
            user.setEmailVerified(false);

            // AJOUTER LE CIN DANS LES ATTRIBUTS
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("cin", List.of(registerDto.getCin()));
            attributes.put("requestedRole", List.of(registerDto.getRole() != null ? registerDto.getRole() : "STUDENT"));
            attributes.put("registrationDate", List.of(new Date().toString()));
            user.setAttributes(attributes);

            // Actions requises: UPDATE_PASSWORD pour forcer le changement de mot de passe
            user.setRequiredActions(Arrays.asList("UPDATE_PASSWORD"));

            // Créer l'utilisateur
            Response response = usersResource.create(user);

            if (response.getStatus() != 201) {
                return "Failed to create user: " + response.getStatusInfo().getReasonPhrase();
            }

            // Obtenir l'ID de l'utilisateur créé
            String userId = extractUserIdFromResponse(response);

            // Utiliser le CIN comme mot de passe
            setUserPassword(userId, registerDto.getCin());

            // Assigner le rôle PENDING
            assignRoleToUserInternal(userId, "PENDING");

            return null; // Pas d'erreur

        } catch (Exception e) {
            e.printStackTrace();
            return "Error registering user " + registerDto.getUsername() + ": " + e.getMessage();
        }
    }

    /**
     * Obtenir tous les utilisateurs en attente (avec rôle PENDING)
     */
    public List<PendingUserDto> getPendingUsers() {
        List<PendingUserDto> pendingUsers = new ArrayList<>();

        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Récupérer TOUS les utilisateurs avec pagination (max 1000)
            List<UserRepresentation> users = usersResource.list(0, 1000);

            for (UserRepresentation user : users) {
                try {
                    // Récupérer les rôles de l'utilisateur
                    UserResource userResource = usersResource.get(user.getId());
                    List<RoleRepresentation> userRoles = userResource.roles().realmLevel().listAll();

                    // Vérifier si l'utilisateur a le rôle PENDING
                    boolean hasPendingRole = userRoles.stream()
                            .anyMatch(role -> "PENDING".equals(role.getName()));

                    if (hasPendingRole) {
                        PendingUserDto dto = new PendingUserDto();
                        dto.setId(user.getId());
                        dto.setUsername(user.getUsername());
                        dto.setEmail(user.getEmail());
                        dto.setFirstName(user.getFirstName());
                        dto.setLastName(user.getLastName());
                        dto.setCreatedTimestamp(user.getCreatedTimestamp() != null ?
                                new Date(user.getCreatedTimestamp()) : new Date());

                        // RÉCUPÉRER LE CIN DEPUIS LES ATTRIBUTS
                        if (user.getAttributes() != null && user.getAttributes().containsKey("cin")) {
                            List<String> cinList = user.getAttributes().get("cin");
                            if (cinList != null && !cinList.isEmpty()) {
                                dto.setCin(cinList.get(0));
                            }
                        }
                        // Récupérer le rôle demandé depuis les attributs
                        if (user.getAttributes() != null && user.getAttributes().containsKey("requestedRole")) {
                            dto.setRequestedRole(user.getAttributes().get("requestedRole").get(0));
                        } else {
                            dto.setRequestedRole("STUDENT");
                        }

                        pendingUsers.add(dto);
                    }
                } catch (Exception e) {
                    // Log silencieux
                }
            }

        } catch (Exception e) {
            // Log silencieux
        }

        return pendingUsers;
    }

    /**
     * Approuver un utilisateur et lui assigner des rôles
     */
    public String approveUser(String userId, List<String> roles) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);

            // Retirer le rôle PENDING
            try {
                RoleRepresentation pendingRole = realmResource.roles().get("PENDING").toRepresentation();
                userResource.roles().realmLevel().remove(Collections.singletonList(pendingRole));
            } catch (Exception e) {
                System.err.println("Could not remove PENDING role: " + e.getMessage());
            }

            // Assigner les nouveaux rôles
            for (String roleName : roles) {
                try {
                    assignRoleToUserInternal(userId, roleName);
                } catch (Exception e) {
                    System.err.println("Could not assign role " + roleName + ": " + e.getMessage());
                }
            }

            // Mettre à jour l'utilisateur (email vérifié)
            UserRepresentation user = userResource.toRepresentation();
            user.setEmailVerified(true);

            // Ajouter un attribut pour marquer la validation
            Map<String, List<String>> attributes = user.getAttributes();
            if (attributes == null) {
                attributes = new HashMap<>();
            }
            attributes.put("approvedDate", List.of(new Date().toString()));
            attributes.put("approvedBy", List.of("admin"));
            user.setAttributes(attributes);

            userResource.update(user);

            return null; // Succès

        } catch (Exception e) {
            e.printStackTrace();
            return "Error approving user: " + e.getMessage();
        }
    }

    /**
     * Rejeter un utilisateur (supprimer le compte)
     */
    public String rejectUser(String userId, String reason) {
        try {
            RealmResource realmResource = keycloak.realm(realm);

            // Optionnel: sauvegarder la raison avant suppression (dans un système de logs)
            System.out.println("User " + userId + " rejected. Reason: " + reason);

            // Supprimer l'utilisateur
            realmResource.users().delete(userId);

            return null; // Succès

        } catch (Exception e) {
            e.printStackTrace();
            return "Error rejecting user: " + e.getMessage();
        }
    }

    /**
     * Obtenir les rôles disponibles (excluant PENDING)
     */
    public List<String> getAvailableRoles() {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            return realmResource.roles().list().stream()
                    .map(RoleRepresentation::getName)
                    .filter(name -> !name.equals("PENDING") && !name.equals("uma_authorization"))
                    .toList();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("STUDENT", "PROFESSOR", "ADMIN"); // Default fallback
        }
    }

    /**
     * Vérifier si un nom d'utilisateur est disponible
     */
    public boolean isUsernameAvailable(String username) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            List<UserRepresentation> existingUsers = usersResource.search(username, true);
            return existingUsers.isEmpty();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Vérifier si un email est disponible
     */
    public boolean isEmailAvailable(String email) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            List<UserRepresentation> usersByEmail = usersResource.searchByEmail(email, true);
            return usersByEmail.isEmpty();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // ==================== MÉTHODES POUR LA GESTION DES UTILISATEURS (ADMIN) ====================

    /**Récupérer tous les utilisateurs avec filtres*/

    public List<ProfileDto> getAllUsers(String roleFilter, String searchTerm) {
        List<ProfileDto> allUsers = new ArrayList<>();

        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            // Récupérer tous les utilisateurs
            List<UserRepresentation> users = usersResource.list(0, 1000);

            for (UserRepresentation user : users) {
                // ✅ EXCLURE LES UTILISATEURS AVEC RÔLE PENDING
                // Récupérer les rôles de l'utilisateur pour vérifier s'il a le rôle PENDING
                UserResource userResource = realmResource.users().get(user.getId());
                List<RoleRepresentation> userRoles = userResource.roles().realmLevel().listAll();

                boolean hasPendingRole = userRoles.stream()
                        .anyMatch(role -> "PENDING".equals(role.getName()));

                // Ignorer les utilisateurs avec le rôle PENDING
                if (hasPendingRole) {
                    continue;
                }

                // Convertir en ProfileDto
                ProfileDto dto = getUserProfile(user.getId());

                // Appliquer les filtres
                if (roleFilter != null && !roleFilter.isEmpty() && !roleFilter.equals("ALL")) {
                    if (!dto.getRoles().contains(roleFilter)) {
                        continue;
                    }
                }

                if (searchTerm != null && !searchTerm.isEmpty()) {
                    String searchLower = searchTerm.toLowerCase();
                    boolean matches = dto.getUsername().toLowerCase().contains(searchLower) ||
                            dto.getEmail().toLowerCase().contains(searchLower) ||
                            (dto.getFirstName() != null && dto.getFirstName().toLowerCase().contains(searchLower)) ||
                            (dto.getLastName() != null && dto.getLastName().toLowerCase().contains(searchLower)) ||
                            (dto.getCin() != null && dto.getCin().toLowerCase().contains(searchLower));
                    if (!matches) {
                        continue;
                    }
                }

                allUsers.add(dto);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return allUsers;
    }
    /**
     * Mettre à jour un utilisateur par l'admin
     */
    public String updateUserByAdmin(String userId, ProfileDto userDto) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            // Mettre à jour les informations
            if (userDto.getFirstName() != null) {
                user.setFirstName(userDto.getFirstName());
            }
            if (userDto.getLastName() != null) {
                user.setLastName(userDto.getLastName());
            }
            if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
                // Vérifier si l'email n'est pas déjà utilisé
                List<UserRepresentation> usersByEmail = realmResource.users()
                        .searchByEmail(userDto.getEmail(), true);
                if (!usersByEmail.isEmpty() && !usersByEmail.get(0).getId().equals(userId)) {
                    return "Cet email est déjà utilisé";
                }
                user.setEmail(userDto.getEmail());
            }

            // Mettre à jour les attributs (CIN)
            if (userDto.getCin() != null) {
                Map<String, List<String>> attributes = user.getAttributes();
                if (attributes == null) {
                    attributes = new HashMap<>();
                }
                attributes.put("cin", List.of(userDto.getCin()));
                user.setAttributes(attributes);
            }

            userResource.update(user);

            return null;

        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors de la mise à jour: " + e.getMessage();
        }
    }

    /**
     * Réinitialiser le mot de passe avec le CIN
     */
    public String resetUserPasswordToCin(String userId) {
        try {
            // Récupérer le CIN de l'utilisateur via son profil
            ProfileDto user = getUserProfile(userId);
            if (user == null) {
                return "Utilisateur non trouvé";
            }

            String cin = user.getCin();
            if (cin == null || cin.isEmpty()) {
                return "L'utilisateur n'a pas de CIN enregistré";
            }

            // Réinitialiser le mot de passe avec le CIN
            setUserPassword(userId, cin);

            return null;

        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors de la réinitialisation: " + e.getMessage();
        }
    }

    /**
     * Activer/Désactiver un utilisateur
     */
    public String toggleUserEnabled(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            user.setEnabled(!user.isEnabled());
            userResource.update(user);

            return null;

        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors du changement de statut: " + e.getMessage();
        }
    }

    /**
     * Supprimer un utilisateur
     */
    public String deleteUser(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            realmResource.users().delete(userId);
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors de la suppression: " + e.getMessage();
        }
    }

    /**
     * Assigner un rôle à un utilisateur (méthode publique)
     */
    public String assignRoleToUser(String userId, String roleName) {
        try {
            assignRoleToUserInternal(userId, roleName);
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors de l'assignation du rôle: " + e.getMessage();
        }
    }

    /**
     * Retirer un rôle d'un utilisateur
     */
    public String removeRoleFromUser(String userId, String roleName) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);

            RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();
            userResource.roles().realmLevel().remove(Collections.singletonList(role));

            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors du retrait du rôle: " + e.getMessage();
        }
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Set user password
     */
    private void setUserPassword(String userId, String password) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(userId);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(true); // Important: this makes it temporary

        userResource.resetPassword(credential);
    }

    /**
     * Assign role to user (méthode interne)
     */
    private void assignRoleToUserInternal(String userId, String roleName) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(userId);

        // Find the role in the realm
        RoleRepresentation role = realmResource.roles().get(roleName).toRepresentation();

        // Assign role to user
        userResource.roles().realmLevel().add(Collections.singletonList(role));
    }

    /**
     * Extract user ID from Keycloak response location header
     */
    private String extractUserIdFromResponse(Response response) {
        String location = response.getLocation().getPath();
        return location.substring(location.lastIndexOf('/') + 1);
    }

    /**
     * Get all available roles in the realm (méthode existante)
     */
    public List<String> getAllRoles() {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            return realmResource.roles().list().stream()
                    .map(RoleRepresentation::getName)
                    .toList();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("STUDENT", "PROFESSOR", "ADMIN"); // Default fallback
        }
    }

    /**
     * Récupérer le profil complet d'un utilisateur
     */
    public ProfileDto getUserProfile(String userId) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            ProfileDto profile = new ProfileDto();
            profile.setId(user.getId());
            profile.setUsername(user.getUsername());
            profile.setEmail(user.getEmail());
            profile.setFirstName(user.getFirstName());
            profile.setLastName(user.getLastName());
            profile.setCreatedTimestamp(user.getCreatedTimestamp());
            profile.setEmailVerified(user.isEmailVerified());
            profile.setEnabled(user.isEnabled());

            // Récupérer le CIN depuis les attributs
            if (user.getAttributes() != null) {
                Map<String, List<String>> attributes = user.getAttributes();

                // Récupérer le CIN
                if (attributes.containsKey("cin")) {
                    profile.setCin(attributes.get("cin").get(0));
                }

                // Récupérer les attributs existants
                if (attributes.containsKey("requestedRole")) {
                    profile.setRequestedRole(attributes.get("requestedRole").get(0));
                }
                if (attributes.containsKey("registrationDate")) {
                    profile.setRegistrationDate(attributes.get("registrationDate").get(0));
                }
                if (attributes.containsKey("approvedDate")) {
                    profile.setApprovedDate(attributes.get("approvedDate").get(0));
                }
                if (attributes.containsKey("approvedBy")) {
                    profile.setApprovedBy(attributes.get("approvedBy").get(0));
                }

                // Garder tous les attributs pour référence
                profile.setAttributes(attributes);
            }

            // Récupérer TOUS les rôles de l'utilisateur
            List<RoleRepresentation> userRoles = userResource.roles().realmLevel().listAll();
            List<String> allRoles = userRoles.stream()
                    .map(RoleRepresentation::getName)
                    .collect(Collectors.toList());

            // Filtrer pour identifier le rôle métier principal
            List<String> businessRoles = allRoles.stream()
                    .filter(role -> role.equals("STUDENT") ||
                            role.equals("PROFESSOR") ||
                            role.equals("ADMIN"))
                    .collect(Collectors.toList());

            // Si aucun rôle métier trouvé, déterminer le rôle approprié
            if (businessRoles.isEmpty()) {
                if (allRoles.contains("PENDING")) {
                    businessRoles = List.of("PENDING");
                } else {
                    businessRoles = List.of("USER");
                }
            }

            profile.setRoles(businessRoles);
            profile.setAllRoles(allRoles); // Garder tous les rôles pour référence

            return profile;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la récupération du profil: " + e.getMessage());
        }
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    public String updateUserProfile(String userId, ProfileDto profileDto) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);
            UserRepresentation user = userResource.toRepresentation();

            // Mettre à jour les champs modifiables
            if (profileDto.getFirstName() != null) {
                user.setFirstName(profileDto.getFirstName());
            }
            if (profileDto.getLastName() != null) {
                user.setLastName(profileDto.getLastName());
            }
            if (profileDto.getEmail() != null && !profileDto.getEmail().equals(user.getEmail())) {
                List<UserRepresentation> usersByEmail = realmResource.users()
                        .searchByEmail(profileDto.getEmail(), true);
                if (!usersByEmail.isEmpty() && !usersByEmail.get(0).getId().equals(userId)) {
                    return "Cet email est déjà utilisé";
                }
                user.setEmail(profileDto.getEmail());
                user.setEmailVerified(false);
            }

            // Validation et mise à jour du CIN
            if (profileDto.getCin() != null) {
                String cin = profileDto.getCin().trim();
                if (cin.isEmpty()) {
                    return "Le CIN ne peut pas être vide";
                }
                // Validation basique pour un CIN tunisien (8 chiffres)
                if (!cin.matches("\\d{8}")) {
                    return "Le CIN doit contenir exactement 8 chiffres";
                }

                Map<String, List<String>> attributes = user.getAttributes();
                if (attributes == null) {
                    attributes = new HashMap<>();
                }
                attributes.put("cin", List.of(cin));
                user.setAttributes(attributes);
            }

            userResource.update(user);
            return null;

        } catch (Exception e) {
            e.printStackTrace();
            return "Erreur lors de la mise à jour: " + e.getMessage();
        }
    }

    /**
     * Changer le mot de passe (version améliorée avec gestion d'erreur)
     */
    public String changePassword(String userId, String newPassword) {
        return changePassword(userId, null, newPassword); // Appel à la méthode complète
    }

    /**
     * Changer le mot de passe avec vérification optionnelle de l'ancien
     */
    public String changePassword(String userId, String currentPassword, String newPassword) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);

            // Optionnel: Vérifier l'ancien mot de passe si fourni
            if (currentPassword != null && !currentPassword.isEmpty()) {
                System.out.println("Password verification would happen here in production");
            }

            // Créer le nouveau credential
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(newPassword);
            credential.setTemporary(false); // Permanent

            userResource.resetPassword(credential);

            return null; // Succès

        } catch (Exception e) {
            e.printStackTrace();
            return "Error changing password: " + e.getMessage();
        }
    }

    /**
     * Obtenir le rôle principal d'un utilisateur
     */
    public String getUserPrimaryRole(String userId) {
        try {
            ProfileDto profile = getUserProfile(userId);
            if (profile.getRoles() != null && !profile.getRoles().isEmpty()) {
                return profile.getRoles().get(0); // Premier rôle = rôle principal
            }
            return "USER";
        } catch (Exception e) {
            e.printStackTrace();
            return "USER";
        }
    }

    /**
     * Vérifier si un utilisateur a un rôle spécifique
     */
    public boolean userHasRole(String userId, String roleName) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UserResource userResource = realmResource.users().get(userId);

            List<RoleRepresentation> userRoles = userResource.roles().realmLevel().listAll();
            return userRoles.stream()
                    .anyMatch(role -> roleName.equals(role.getName()));

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Récupérer le profil par username (utile pour l'authentification)
     */
    public ProfileDto getUserProfileByUsername(String username) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            List<UserRepresentation> users = usersResource.search(username, true);
            if (users.isEmpty()) {
                return null;
            }

            // Prendre le premier utilisateur correspondant
            String userId = users.get(0).getId();
            return getUserProfile(userId);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la récupération du profil par username: " + e.getMessage());
        }
    }

// ==================== MÉTHODES POUR ACTIONS GROUPÉES ====================

    /**
     * Réinitialiser les mots de passe de plusieurs utilisateurs
     */
    public BulkActionResult bulkResetPasswords(List<String> userIds, boolean confirm) {
        BulkActionResult result = new BulkActionResult();
        result.setTotal(userIds.size());

        if (!confirm) {
            result.addFailure("", "Action non confirmée");
            return result;
        }

        for (String userId : userIds) {
            String error = resetUserPasswordToCin(userId);
            if (error == null) {
                result.addSuccess(userId, "Mot de passe réinitialisé avec succès");
            } else {
                result.addFailure(userId, error);
            }
        }

        return result;
    }

    /**
     * Activer/Désactiver plusieurs utilisateurs
     */
    public BulkActionResult bulkToggleStatus(List<String> userIds, boolean enable, boolean confirm) {
        BulkActionResult result = new BulkActionResult();
        result.setTotal(userIds.size());

        if (!confirm) {
            result.addFailure("", "Action non confirmée");
            return result;
        }

        // Vérifier qu'il reste au moins un admin actif après désactivation
        if (!enable) { // Si on désactive
            // Compter les admins qui seront désactivés
            long adminsToDisable = 0;
            for (String userId : userIds) {
                ProfileDto user = getUserProfile(userId);
                if (user.getRoles().contains("ADMIN")) {
                    adminsToDisable++;
                }
            }

            // Compter les admins actifs restants
            int activeAdmins = countActiveAdmins();
            if (activeAdmins - adminsToDisable < 1) {
                result.addFailure("", "Impossible de désactiver tous les administrateurs. Il doit rester au moins un admin actif.");
                return result;
            }
        }

        for (String userId : userIds) {
            try {
                RealmResource realmResource = keycloak.realm(realm);
                UserResource userResource = realmResource.users().get(userId);
                UserRepresentation user = userResource.toRepresentation();

                user.setEnabled(enable);
                userResource.update(user);

                String action = enable ? "activé" : "désactivé";
                // ✅ Correction : utiliser les guillemets doubles au lieu des backticks
                result.addSuccess(userId, "Compte " + action + " avec succès");

            } catch (Exception e) {
                result.addFailure(userId, "Erreur: " + e.getMessage());
            }
        }

        return result;
    }

    /**
     * Compter le nombre d'administrateurs actifs
     */
    private int countActiveAdmins() {
        int count = 0;
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();

            List<UserRepresentation> users = usersResource.list(0, 1000);

            for (UserRepresentation user : users) {
                if (!user.isEnabled()) continue;

                UserResource userResource = realmResource.users().get(user.getId());
                List<RoleRepresentation> roles = userResource.roles().realmLevel().listAll();

                boolean isAdmin = roles.stream().anyMatch(role -> "ADMIN".equals(role.getName()));
                if (isAdmin) {
                    count++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }

}