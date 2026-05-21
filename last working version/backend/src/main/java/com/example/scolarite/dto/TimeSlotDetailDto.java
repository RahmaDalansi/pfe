package com.example.scolarite.dto;

public class TimeSlotDetailDto {
    private String status; // 'PREFERRED', 'AVAILABLE', 'UNAVAILABLE'
    private String reason;
    private String reasonType;

    // Constructeurs
    public TimeSlotDetailDto() {}

    public TimeSlotDetailDto(String status, String reason, String reasonType) {
        this.status = status;
        this.reason = reason;
        this.reasonType = reasonType;
    }

    // Getters et Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReasonType() { return reasonType; }
    public void setReasonType(String reasonType) { this.reasonType = reasonType; }
}