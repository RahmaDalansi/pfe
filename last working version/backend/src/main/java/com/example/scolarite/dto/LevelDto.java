// LevelDto.java
package com.example.scolarite.dto;

public class LevelDto {
    private Long id;
    private Integer yearNumber;
    private String name;
    private Integer semesterCount;
    private Boolean isActive;
    private Long specialtyId;
    private String specialtyName;
    private Integer groupCount;

    // Constructeurs
    public LevelDto() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getYearNumber() { return yearNumber; }
    public void setYearNumber(Integer yearNumber) { this.yearNumber = yearNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSemesterCount() { return semesterCount; }
    public void setSemesterCount(Integer semesterCount) { this.semesterCount = semesterCount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getSpecialtyId() { return specialtyId; }
    public void setSpecialtyId(Long specialtyId) { this.specialtyId = specialtyId; }

    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }

    public Integer getGroupCount() { return groupCount; }
    public void setGroupCount(Integer groupCount) { this.groupCount = groupCount; }
}