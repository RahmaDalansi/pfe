package com.example.scolarite.dto;

import java.util.List;

public class BulkActionDto {
    private List<String> userIds;
    private boolean confirmAction;
    private boolean enable; // Pour l'activation/désactivation

    // Constructeurs
    public BulkActionDto() {}

    // Getters et Setters
    public List<String> getUserIds() { return userIds; }
    public void setUserIds(List<String> userIds) { this.userIds = userIds; }

    public boolean isConfirmAction() { return confirmAction; }
    public void setConfirmAction(boolean confirmAction) { this.confirmAction = confirmAction; }

    public boolean isEnable() { return enable; }
    public void setEnable(boolean enable) { this.enable = enable; }
}