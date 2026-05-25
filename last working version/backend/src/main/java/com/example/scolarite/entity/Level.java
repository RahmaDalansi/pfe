package com.example.scolarite.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "levels", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"specialty_id", "year_number"})
})
public class Level {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "year_number", nullable = false)
    private Integer yearNumber; // 1, 2, 3

    @Column(name = "name", nullable = false)
    private String name; // "1ère Année", "2ème Année", "3ème Année"

    @Column(name = "semester_count")
    private Integer semesterCount = 2;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Group> groups = new ArrayList<>();

    // Constructeurs
    public Level() {}

    public Level(Integer yearNumber, String name, Specialty specialty) {
        this.yearNumber = yearNumber;
        this.name = name;
        this.specialty = specialty;
    }

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

    public Specialty getSpecialty() { return specialty; }
    public void setSpecialty(Specialty specialty) { this.specialty = specialty; }

    public List<Group> getGroups() { return groups; }
    public void setGroups(List<Group> groups) { this.groups = groups; }
}