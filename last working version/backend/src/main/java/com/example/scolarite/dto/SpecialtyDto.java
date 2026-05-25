// SpecialtyDto.java
package com.example.scolarite.dto;

public class SpecialtyDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer durationYears;
    private Boolean isActive;
    private Long departmentId;
    private String departmentName;
    private Integer levelCount;

    // Constructeurs
    public SpecialtyDto() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDurationYears() { return durationYears; }
    public void setDurationYears(Integer durationYears) { this.durationYears = durationYears; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Integer getLevelCount() { return levelCount; }
    public void setLevelCount(Integer levelCount) { this.levelCount = levelCount; }
}