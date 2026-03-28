package com.example.scolarite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "teaching_preferences")
public class TeachingPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false, unique = true)
    private Professor professor;

    // Période de saisie
    @Column(name = "submission_period_id")
    private Long submissionPeriodId; // Référence vers la période de saisie

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "is_submitted")
    private Boolean isSubmitted = false;

    // Préférences de jours (stockées comme JSON ou string)
    @Column(name = "preferred_days", columnDefinition = "TEXT")
    private String preferredDays; // JSON: ["MONDAY", "TUESDAY", ...]

    @Column(name = "unavailable_days", columnDefinition = "TEXT")
    private String unavailableDays; // JSON: ["WEDNESDAY", ...]

    // Préférences horaires
    @Column(name = "preferred_time_slots", columnDefinition = "TEXT")
    private String preferredTimeSlots; // JSON: ["MORNING", "AFTERNOON"]

    @Column(name = "max_hours_per_day")
    private Integer maxHoursPerDay = 6;

    @Column(name = "max_hours_per_week")
    private Integer maxHoursPerWeek = 24;

    // Commentaires et raisons
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "constraints", columnDefinition = "TEXT")
    private String constraints; // JSON avec contraintes spécifiques

    // Constructeurs
    public TeachingPreferences() {}

    public TeachingPreferences(Professor professor) {
        this.professor = professor;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Professor getProfessor() { return professor; }
    public void setProfessor(Professor professor) { this.professor = professor; }

    public Long getSubmissionPeriodId() { return submissionPeriodId; }
    public void setSubmissionPeriodId(Long submissionPeriodId) { this.submissionPeriodId = submissionPeriodId; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public Boolean getIsSubmitted() { return isSubmitted; }
    public void setIsSubmitted(Boolean isSubmitted) { this.isSubmitted = isSubmitted; }

    public String getPreferredDays() { return preferredDays; }
    public void setPreferredDays(String preferredDays) { this.preferredDays = preferredDays; }

    public String getUnavailableDays() { return unavailableDays; }
    public void setUnavailableDays(String unavailableDays) { this.unavailableDays = unavailableDays; }

    public String getPreferredTimeSlots() { return preferredTimeSlots; }
    public void setPreferredTimeSlots(String preferredTimeSlots) { this.preferredTimeSlots = preferredTimeSlots; }

    public Integer getMaxHoursPerDay() { return maxHoursPerDay; }
    public void setMaxHoursPerDay(Integer maxHoursPerDay) { this.maxHoursPerDay = maxHoursPerDay; }

    public Integer getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(Integer maxHoursPerWeek) { this.maxHoursPerWeek = maxHoursPerWeek; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
}