package com.example.scolarite.dto;

import java.util.List;
import java.util.Map;

public class ProfileDto {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String cin;
    private Long createdTimestamp;
    private boolean emailVerified;
    private boolean enabled;
    private List<String> roles;
    private List<String> allRoles;
    private String requestedRole;
    private String registrationDate;
    private String approvedDate;
    private String approvedBy;
    private Map<String, List<String>> attributes;

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getEmail() {
        return email;
    }

    public String getLastName() {
        return lastName;
    }

    public Long getCreatedTimestamp() {
        return createdTimestamp;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public List<String> getRoles() {
        return roles;
    }

    public List<String> getAllRoles() {
        return allRoles;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public String getRegistrationDate() {
        return registrationDate;
    }

    public String getApprovedDate() {
        return approvedDate;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public Map<String, List<String>> getAttributes() {
        return attributes;
    }


    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setCreatedTimestamp(Long createdTimestamp) {
        this.createdTimestamp = createdTimestamp;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public void setAllRoles(List<String> allRoles) {
        this.allRoles = allRoles;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }

    public void setRegistrationDate(String registrationDate) {
        this.registrationDate = registrationDate;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public void setApprovedDate(String approvedDate) {
        this.approvedDate = approvedDate;
    }

    public void setAttributes(Map<String, List<String>> attributes) {
        this.attributes = attributes;
    }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }
}