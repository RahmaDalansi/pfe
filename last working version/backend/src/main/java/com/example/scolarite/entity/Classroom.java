package com.example.scolarite.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "classrooms")
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;  // Ex: "Salle 1", "Labo Info", "Amphi A"

    @Column(name = "number")
    private String number;  // Ex: "101", "A201", "Labo1"

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ClassroomType type;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Constructeurs
    public Classroom() {}

    public Classroom(String name, String number, ClassroomType type) {
        this.name = name;
        this.number = number;
        this.type = type;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public ClassroomType getType() { return type; }
    public void setType(ClassroomType type) { this.type = type; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}