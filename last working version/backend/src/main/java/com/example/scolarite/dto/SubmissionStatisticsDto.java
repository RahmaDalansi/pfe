// com.example.scolarite.dto/SubmissionStatisticsDto.java
package com.example.scolarite.dto;

import java.util.List;

public class SubmissionStatisticsDto {
    private Long periodId;
    private String periodName;
    private int totalProfessors;
    private int submittedCount;
    private int notSubmittedCount;
    private int exceptionGrantedCount;
    private List<ProfessorSubmissionStatusDto> submittedProfessors;
    private List<ProfessorSubmissionStatusDto> notSubmittedProfessors;
    private List<ProfessorSubmissionStatusDto> exceptionProfessors;

    // Constructeurs
    public SubmissionStatisticsDto() {}

    // Getters et Setters
    public Long getPeriodId() { return periodId; }
    public void setPeriodId(Long periodId) { this.periodId = periodId; }

    public String getPeriodName() { return periodName; }
    public void setPeriodName(String periodName) { this.periodName = periodName; }

    public int getTotalProfessors() { return totalProfessors; }
    public void setTotalProfessors(int totalProfessors) { this.totalProfessors = totalProfessors; }

    public int getSubmittedCount() { return submittedCount; }
    public void setSubmittedCount(int submittedCount) { this.submittedCount = submittedCount; }

    public int getNotSubmittedCount() { return notSubmittedCount; }
    public void setNotSubmittedCount(int notSubmittedCount) { this.notSubmittedCount = notSubmittedCount; }

    public int getExceptionGrantedCount() { return exceptionGrantedCount; }
    public void setExceptionGrantedCount(int exceptionGrantedCount) { this.exceptionGrantedCount = exceptionGrantedCount; }

    public List<ProfessorSubmissionStatusDto> getSubmittedProfessors() { return submittedProfessors; }
    public void setSubmittedProfessors(List<ProfessorSubmissionStatusDto> submittedProfessors) { this.submittedProfessors = submittedProfessors; }

    public List<ProfessorSubmissionStatusDto> getNotSubmittedProfessors() { return notSubmittedProfessors; }
    public void setNotSubmittedProfessors(List<ProfessorSubmissionStatusDto> notSubmittedProfessors) { this.notSubmittedProfessors = notSubmittedProfessors; }

    public List<ProfessorSubmissionStatusDto> getExceptionProfessors() { return exceptionProfessors; }
    public void setExceptionProfessors(List<ProfessorSubmissionStatusDto> exceptionProfessors) { this.exceptionProfessors = exceptionProfessors; }
}