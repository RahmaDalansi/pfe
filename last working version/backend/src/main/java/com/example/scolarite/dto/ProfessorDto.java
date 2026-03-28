package com.example.scolarite.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ProfessorDto {
    // Informations de base (de Keycloak)
    private String keycloakId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;

    // Informations supplémentaires (de l'application)
    private String specialite;
    private String bureau;
    private String telephone;
    private LocalDateTime dateEmbauche;

    // Matières enseignées
    private List<SubjectDto> subjects;

    // Statut
    private boolean hasSubmittedPreferences;
    private LocalDateTime preferencesSubmittedAt;

    // Constructeurs
    public ProfessorDto() {}

    // Getters et Setters
    public String getKeycloakId() { return keycloakId; }
    public void setKeycloakId(String keycloakId) { this.keycloakId = keycloakId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getBureau() { return bureau; }
    public void setBureau(String bureau) { this.bureau = bureau; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public LocalDateTime getDateEmbauche() { return dateEmbauche; }
    public void setDateEmbauche(LocalDateTime dateEmbauche) { this.dateEmbauche = dateEmbauche; }

    public List<SubjectDto> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectDto> subjects) { this.subjects = subjects; }

    public boolean isHasSubmittedPreferences() { return hasSubmittedPreferences; }
    public void setHasSubmittedPreferences(boolean hasSubmittedPreferences) { this.hasSubmittedPreferences = hasSubmittedPreferences; }

    public LocalDateTime getPreferencesSubmittedAt() { return preferencesSubmittedAt; }
    public void setPreferencesSubmittedAt(LocalDateTime preferencesSubmittedAt) { this.preferencesSubmittedAt = preferencesSubmittedAt; }
}