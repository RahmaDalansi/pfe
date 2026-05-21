package com.example.scolarite.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TeachingPreferencesDto {
    private Long id;
    private Long professorId;
    private Long submissionPeriodId;
    private LocalDateTime submittedAt;
    private Boolean isSubmitted;
    private String submissionStatus;
    // Préférences
    private List<String> preferredDays;
    private List<String> unavailableDays;
    private List<String> preferredTimeSlots;
    private Integer maxHoursPerDay;
    private Integer maxHoursPerWeek;

    // NOUVEAUX CHAMPS
    private List<DailyPreferencesDetailDto> dailyPreferences;  // AJOUTER
    private String globalNotes;  // AJOUTER (alias pour notes)
    private String notes;

    // Commentaires
    private List<ConstraintDto> constraints;

    // Constructeurs
    public TeachingPreferencesDto() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }

    public Long getSubmissionPeriodId() { return submissionPeriodId; }
    public void setSubmissionPeriodId(Long submissionPeriodId) { this.submissionPeriodId = submissionPeriodId; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public Boolean getIsSubmitted() { return isSubmitted; }
    public void setIsSubmitted(Boolean isSubmitted) { this.isSubmitted = isSubmitted; }

    public List<String> getPreferredDays() { return preferredDays; }
    public void setPreferredDays(List<String> preferredDays) { this.preferredDays = preferredDays; }

    public List<String> getUnavailableDays() { return unavailableDays; }
    public void setUnavailableDays(List<String> unavailableDays) { this.unavailableDays = unavailableDays; }

    public List<String> getPreferredTimeSlots() { return preferredTimeSlots; }
    public void setPreferredTimeSlots(List<String> preferredTimeSlots) { this.preferredTimeSlots = preferredTimeSlots; }

    public Integer getMaxHoursPerDay() { return maxHoursPerDay; }
    public void setMaxHoursPerDay(Integer maxHoursPerDay) { this.maxHoursPerDay = maxHoursPerDay; }

    public Integer getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(Integer maxHoursPerWeek) { this.maxHoursPerWeek = maxHoursPerWeek; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // NOUVEAUX GETTERS/SETTERS
    public List<DailyPreferencesDetailDto> getDailyPreferences() { return dailyPreferences; }
    public void setDailyPreferences(List<DailyPreferencesDetailDto> dailyPreferences) { this.dailyPreferences = dailyPreferences; }

    public String getGlobalNotes() { return globalNotes != null ? globalNotes : notes; }
    public void setGlobalNotes(String globalNotes) { this.globalNotes = globalNotes; this.notes = globalNotes; }

    public List<ConstraintDto> getConstraints() { return constraints; }
    public void setConstraints(List<ConstraintDto> constraints) { this.constraints = constraints; }

    public String getSubmissionStatus() { return submissionStatus; }
    public void setSubmissionStatus(String submissionStatus) { this.submissionStatus = submissionStatus; }


    // Classe interne pour les contraintes
    public static class ConstraintDto {
        private String type;
        private String day;
        private String timeSlot;
        private String reason;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}