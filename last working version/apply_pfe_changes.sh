#!/bin/bash

echo "🚀 Application des mises à jour PFE (Scolarité + IAM)..."

# 1. Création des répertoires
mkdir -p pfe-master/backend/src/main/java/com/example/scolarite/controller
mkdir -p pfe-master/backend/src/main/java/com/example/scolarite/service
mkdir -p pfe-master/frontend/src/app/components/import-data

# 2. Fichiers Backend (Java)
echo "☕ Génération du code Backend..."

cat <<EOF > pfe-master/backend/src/main/java/com/example/scolarite/controller/ImportController.java
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
EOF

cat <<EOF > pfe-master/backend/src/main/java/com/example/scolarite/service/KeycloakImportService.java
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
    @Value("\${keycloak.auth-server-url:http://localhost:8081}")
    private String serverUrl;

    @Value("\${keycloak.realm:scolarite}")
    private String realm;

    @Value("\${keycloak.admin.username:admin}")
    private String adminUser;

    @Value("\${keycloak.admin.password:admin}")
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
            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
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
EOF

# 3. Fichiers Frontend (Angular)
echo "🅰️ Génération du code Frontend..."

cat <<EOF > pfe-master/frontend/src/app/components/import-data/import-data.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  standalone: true
})
export class ImportDataComponent {
  message: string = '';
  constructor(private http: HttpClient) {}

  onFileChange(event: any, role: string) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post(`http://localhost:8082/api/import/\${role}`, formData, { responseType: 'text' })
          .subscribe({ next: (res) => this.message = res, error: (err) => this.message = 'Erreur : ' + err.message });
    }
  }
}
EOF

cat <<EOF > pfe-master/frontend/src/app/components/import-data/import-data.component.html
<div class="p-6 border rounded-lg shadow-md bg-white">
  <h2 class="text-xl font-bold mb-4">Administration - Importation de données</h2>
  <div class="mb-6">
    <label class="block mb-2 font-medium">Importer PROFESSEURS (CSV) :</label>
    <input type="file" (change)="onFileChange(\$event, 'professors')" accept=".csv">
  </div>
  <div class="mb-6">
    <label class="block mb-2 font-medium">Importer ÉTUDIANTS (CSV) :</label>
    <input type="file" (change)="onFileChange(\$event, 'students')" accept=".csv">
  </div>
  <div *ngIf="message" class="p-4 mt-4 bg-blue-100 text-blue-700 rounded">{{ message }}</div>
</div>
EOF

echo "✅ Mise à jour terminée ! N'oubliez pas de redémarrer Keycloak : docker-compose down -v && docker-compose up -d"
