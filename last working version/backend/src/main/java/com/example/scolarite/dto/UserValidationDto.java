package com.example.scolarite.dto;

import java.util.List;

public class UserValidationDto {
    private String userId;
    private String username;
    private String action; // APPROVE ou REJECT
    private List<String> roles; // Rôles à attribuer (si APPROVE)
    private String rejectionReason; // Raison (si REJECT)

    // Getters et Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}