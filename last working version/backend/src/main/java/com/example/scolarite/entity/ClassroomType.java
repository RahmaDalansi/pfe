package com.example.scolarite.entity;

public enum ClassroomType {
    COURS("Salle de cours"),
    LABO("Laboratoire"),
    AMPHI("Amphithéatre");

    private final String label;

    ClassroomType(String label) {
        this.label = label;
    }

    public String getLabel() { return label; }
}