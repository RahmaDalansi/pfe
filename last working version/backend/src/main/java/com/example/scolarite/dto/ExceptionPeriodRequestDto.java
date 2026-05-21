package com.example.scolarite.dto;

import java.time.LocalDateTime;

public class ExceptionPeriodRequestDto {
    private String professorKeycloakId;
    private Long periodId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;

    // Constructeurs
    public ExceptionPeriodRequestDto() {}

    // Getters et Setters
    public String getProfessorKeycloakId() { return professorKeycloakId; }
    public void setProfessorKeycloakId(String professorKeycloakId) { this.professorKeycloakId = professorKeycloakId; }

    public Long getPeriodId() { return periodId; }
    public void setPeriodId(Long periodId) { this.periodId = periodId; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}