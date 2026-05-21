// com.example.scolarite.dto/ExceptionPeriodDto.java
package com.example.scolarite.dto;

import java.time.LocalDateTime;

public class ExceptionPeriodDto {
    private Long id;
    private String professorKeycloakId;
    private String professorName;
    private Long periodId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;

    public ExceptionPeriodDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProfessorKeycloakId() { return professorKeycloakId; }
    public void setProfessorKeycloakId(String professorKeycloakId) { this.professorKeycloakId = professorKeycloakId; }

    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }

    public Long getPeriodId() { return periodId; }
    public void setPeriodId(Long periodId) { this.periodId = periodId; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}