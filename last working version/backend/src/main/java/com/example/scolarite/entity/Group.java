package com.example.scolarite.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "groups", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"level_id", "group_number"})
})
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_number", nullable = false)
    private Integer groupNumber; // 1, 2, 3...

    @Column(name = "name", nullable = false)
    private String name; // "Groupe A", "Groupe 1", etc.

    @Column(name = "student_count")
    private Integer studentCount = 0;

    @Column(name = "max_capacity")
    private Integer maxCapacity = 30;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    // Constructeurs
    public Group() {}

    public Group(Integer groupNumber, String name, Level level) {
        this.groupNumber = groupNumber;
        this.name = name;
        this.level = level;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getGroupNumber() { return groupNumber; }
    public void setGroupNumber(Integer groupNumber) { this.groupNumber = groupNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Level getLevel() { return level; }
    public void setLevel(Level level) { this.level = level; }
}