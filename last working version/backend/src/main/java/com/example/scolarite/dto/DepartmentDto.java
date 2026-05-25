// DepartmentDto.java
package com.example.scolarite.dto;

public class DepartmentDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String headOfDepartment;
    private Boolean isActive;
    private Integer specialtyCount;

    // Constructeurs
    public DepartmentDto() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHeadOfDepartment() { return headOfDepartment; }
    public void setHeadOfDepartment(String headOfDepartment) { this.headOfDepartment = headOfDepartment; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getSpecialtyCount() { return specialtyCount; }
    public void setSpecialtyCount(Integer specialtyCount) { this.specialtyCount = specialtyCount; }
}