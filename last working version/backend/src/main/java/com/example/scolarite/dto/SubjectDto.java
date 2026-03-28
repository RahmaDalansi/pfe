package com.example.scolarite.dto;

public class SubjectDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer weeklyHours;
    private Integer semester;
    private Integer credits;
    private Boolean isActive;
    private Boolean isAssignedToCurrentProfessor; // Pour le frontend

    // Constructeurs
    public SubjectDto() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getWeeklyHours() { return weeklyHours; }
    public void setWeeklyHours(Integer weeklyHours) { this.weeklyHours = weeklyHours; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsAssignedToCurrentProfessor() { return isAssignedToCurrentProfessor; }
    public void setIsAssignedToCurrentProfessor(Boolean isAssignedToCurrentProfessor) { this.isAssignedToCurrentProfessor = isAssignedToCurrentProfessor; }
}