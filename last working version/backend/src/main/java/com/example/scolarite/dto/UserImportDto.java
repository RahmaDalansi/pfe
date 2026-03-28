package com.example.scolarite.dto;

public class UserImportDto {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role; // STUDENT, PROFESSOR, etc.
    private String cin;
    private String group; // Optional: group assignment

    // Constructors
    public UserImportDto() {}

    public UserImportDto(String username, String email, String firstName, String lastName, String cin, String role) {
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.cin= cin;
        this.role = role;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getGroup() { return group; }
    public void setGroup(String group) { this.group = group; }

    public String getCin() {return cin;}
    public void setCin(String cin) { this.cin = cin;}
}