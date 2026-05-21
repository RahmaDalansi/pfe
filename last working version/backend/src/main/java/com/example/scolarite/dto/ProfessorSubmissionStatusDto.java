package com.example.scolarite.dto;

import java.time.LocalDateTime;

public class ProfessorSubmissionStatusDto {
    private String keycloakId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String submissionStatus; // 'SUBMITTED', 'NOT_SUBMITTED', 'EXCEPTION_GRANTED'
    private LocalDateTime submittedAt;
    private Boolean hasExceptionPeriod;

    // Constructeurs
    public ProfessorSubmissionStatusDto() {}

    // Getters et Setters
    public String getKeycloakId() { return keycloakId; }
    public void setKeycloakId(String keycloakId) { this.keycloakId = keycloakId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSubmissionStatus() { return submissionStatus; }
    public void setSubmissionStatus(String submissionStatus) { this.submissionStatus = submissionStatus; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public Boolean getHasExceptionPeriod() { return hasExceptionPeriod; }
    public void setHasExceptionPeriod(Boolean hasExceptionPeriod) { this.hasExceptionPeriod = hasExceptionPeriod; }
}