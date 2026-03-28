package com.example.scolarite.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.ws.rs.core.Response;
import java.util.Collections;

@Service
public class KeycloakImportService {
    @Value("\")
    private String serverUrl;

    @Value("\")
    private String realm;

    @Value("\")
    private String adminUser;

    @Value("\")
    private String adminPass;

    private Keycloak getKeycloakInstance() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")
                .username(adminUser)
                .password(adminPass)
                .clientId("admin-cli")
                .build();
    }

    public void createUser(String username, String firstName, String lastName, String email, String roleName) {
        Keycloak keycloak = getKeycloakInstance();
        UsersResource usersResource = keycloak.realm(realm).users();

        UserRepresentation user = new UserRepresentation();
        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setEnabled(true);
        user.setRequiredActions(Collections.singletonList("UPDATE_PASSWORD"));

        Response response = usersResource.create(user);
        if (response.getStatus() == 201) {
            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "");
            CredentialRepresentation passwordCred = new CredentialRepresentation();
            passwordCred.setTemporary(true);
            passwordCred.setType(CredentialRepresentation.PASSWORD);
            passwordCred.setValue("password123");
            usersResource.get(userId).resetPassword(passwordCred);

            RoleRepresentation role = keycloak.realm(realm).roles().get(roleName).toRepresentation();
            usersResource.get(userId).roles().realmLevel().add(Collections.singletonList(role));
        }
    }
}
