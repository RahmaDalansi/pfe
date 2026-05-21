// com.example.scolarite.dto/ProfessorPreferencesDetailDto.java
package com.example.scolarite.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ProfessorPreferencesDetailDto {
    private String professorKeycloakId;
    private String professorName;
    private String professorFirstName;
    private String professorLastName;
    private String professorEmail;
    private String submissionStatus; // 'SUBMITTED', 'NOT_SUBMITTED', 'EXCEPTION_GRANTED'
    private LocalDateTime submittedAt;
    private Boolean hasExceptionPeriod;

    // Détails des préférences
    private List<DailyPreferencesDetailDto> dailyPreferences;
    private Integer maxHoursPerDay;
    private Integer maxHoursPerWeek;
    private String globalNotes;

    // Getters et Setters
    public String getProfessorKeycloakId() { return professorKeycloakId; }
    public void setProfessorKeycloakId(String professorKeycloakId) { this.professorKeycloakId = professorKeycloakId; }

    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }

    public String getProfessorFirstName() { return professorFirstName; }
    public void setProfessorFirstName(String professorFirstName) { this.professorFirstName = professorFirstName; }

    public String getProfessorLastName() { return professorLastName; }
    public void setProfessorLastName(String professorLastName) { this.professorLastName = professorLastName; }

    public String getProfessorEmail() { return professorEmail; }
    public void setProfessorEmail(String professorEmail) { this.professorEmail = professorEmail; }

    public String getSubmissionStatus() { return submissionStatus; }
    public void setSubmissionStatus(String submissionStatus) { this.submissionStatus = submissionStatus; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public Boolean getHasExceptionPeriod() { return hasExceptionPeriod; }
    public void setHasExceptionPeriod(Boolean hasExceptionPeriod) { this.hasExceptionPeriod = hasExceptionPeriod; }

    public List<DailyPreferencesDetailDto> getDailyPreferences() { return dailyPreferences; }
    public void setDailyPreferences(List<DailyPreferencesDetailDto> dailyPreferences) { this.dailyPreferences = dailyPreferences; }

    public Integer getMaxHoursPerDay() { return maxHoursPerDay; }
    public void setMaxHoursPerDay(Integer maxHoursPerDay) { this.maxHoursPerDay = maxHoursPerDay; }

    public Integer getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(Integer maxHoursPerWeek) { this.maxHoursPerWeek = maxHoursPerWeek; }

    public String getGlobalNotes() { return globalNotes; }
    public void setGlobalNotes(String globalNotes) { this.globalNotes = globalNotes; }
}

// DTO pour les préférences quotidiennes

