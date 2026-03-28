// com.example.scolarite/dto/PasswordChangeDto.java
package com.example.scolarite.dto;

public class PasswordChangeDto {
    private String currentPassword;
    private String newPassword;

    public PasswordChangeDto() {}

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}