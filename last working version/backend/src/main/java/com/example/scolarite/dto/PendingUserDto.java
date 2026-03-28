package com.example.scolarite.dto;

import java.util.Date;
import java.util.List;

public class PendingUserDto {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String cin;
    private Date createdTimestamp;
    private String requestedRole; // Rôle demandé par l'utilisateur
    private List<String> attributes; // Attributs supplémentaires

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Date getCreatedTimestamp() { return createdTimestamp; }
    public void setCreatedTimestamp(Date createdTimestamp) { this.createdTimestamp = createdTimestamp; }

    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }

    public List<String> getAttributes() { return attributes; }
    public void setAttributes(List<String> attributes) { this.attributes = attributes; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }
}