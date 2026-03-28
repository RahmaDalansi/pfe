package com.example.scolarite.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportResponseDto {
    private int totalProcessed;
    private int successCount;
    private int failureCount;
    private List<String> errors = new ArrayList<>();
    private List<String> successUsers = new ArrayList<>();

    // Constructors
    public ImportResponseDto() {}

    // Getters and Setters
    public int getTotalProcessed() { return totalProcessed; }
    public void setTotalProcessed(int totalProcessed) { this.totalProcessed = totalProcessed; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }

    public List<String> getSuccessUsers() { return successUsers; }
    public void setSuccessUsers(List<String> successUsers) { this.successUsers = successUsers; }

    // Helper methods
    public void addError(String error) {
        this.errors.add(error);
        this.failureCount++;
    }

    public void addSuccess(String username) {
        this.successUsers.add(username);
        this.successCount++;
    }
}