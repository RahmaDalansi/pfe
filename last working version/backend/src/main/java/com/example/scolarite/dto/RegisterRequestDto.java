package com.example.scolarite.dto;

public class RegisterRequestDto {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String cin;
    private String password;
    private String role;

    // Constructeurs
    public RegisterRequestDto() {}

    // Getters et Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}