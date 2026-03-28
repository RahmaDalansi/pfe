package com.example.scolarite.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class KeycloakInitializer implements CommandLineRunner {

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakInitializer(Keycloak keycloak,
                               @Value("${keycloak.realm}") String realm) {
        this.keycloak = keycloak;
        this.realm = realm;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            RealmResource realmResource = keycloak.realm(realm);


        } catch (Exception e) {
            System.err.println("Erreur lors de l'initialisation Keycloak: " + e.getMessage());
        }
    }
}