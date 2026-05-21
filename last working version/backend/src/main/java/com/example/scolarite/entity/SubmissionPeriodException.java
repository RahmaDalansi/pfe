package com.example.scolarite.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submission_period_exceptions")
public class SubmissionPeriodException extends BasePeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private SubmissionPeriod period;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    public SubmissionPeriodException() {}

    public SubmissionPeriodException(Professor professor, SubmissionPeriod period,
                                     LocalDateTime startDate, LocalDateTime endDate, String reason) {
        super(startDate, endDate);
        this.professor = professor;
        this.period = period;
        this.reason = reason;
    }

    // Getters et Setters spécifiques
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Professor getProfessor() { return professor; }
    public void setProfessor(Professor professor) { this.professor = professor; }

    public SubmissionPeriod getPeriod() { return period; }
    public void setPeriod(SubmissionPeriod period) { this.period = period; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}