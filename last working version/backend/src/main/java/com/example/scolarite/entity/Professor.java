package com.example.scolarite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "professors")
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Référence vers l'utilisateur Keycloak
    @Column(name = "keycloak_id", nullable = false, unique = true)
    private String keycloakId;

    // Informations supplémentaires (non stockées dans Keycloak)
    @Column(name = "specialite")
    private String specialite;

    @Column(name = "bureau")
    private String bureau;

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "date_embauche")
    private LocalDateTime dateEmbauche;

    // Préférences pour l'emploi du temps (stockées en JSON)
    @Column(name = "preferences", columnDefinition = "TEXT")
    private String preferences; // JSON string

    // Relations
    @OneToMany(mappedBy = "professor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProfessorSubject> professorSubjects = new ArrayList<>();

    @OneToOne(mappedBy = "professor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TeachingPreferences teachingPreferences;

    // Constructeurs
    public Professor() {}

    public Professor(String keycloakId) {
        this.keycloakId = keycloakId;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getKeycloakId() { return keycloakId; }
    public void setKeycloakId(String keycloakId) { this.keycloakId = keycloakId; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getBureau() { return bureau; }
    public void setBureau(String bureau) { this.bureau = bureau; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public LocalDateTime getDateEmbauche() { return dateEmbauche; }
    public void setDateEmbauche(LocalDateTime dateEmbauche) { this.dateEmbauche = dateEmbauche; }

    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }

    public List<ProfessorSubject> getProfessorSubjects() { return professorSubjects; }
    public void setProfessorSubjects(List<ProfessorSubject> professorSubjects) { this.professorSubjects = professorSubjects; }

    public TeachingPreferences getTeachingPreferences() { return teachingPreferences; }
    public void setTeachingPreferences(TeachingPreferences teachingPreferences) { this.teachingPreferences = teachingPreferences; }
}