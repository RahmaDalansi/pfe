package com.example.scolarite.dto;

import java.util.ArrayList;
import java.util.List;

public class BulkActionResult {
    private int total;
    private int successCount;
    private int failureCount;
    private List<BulkActionItemResult> results = new ArrayList<>();

    // Constructeurs
    public BulkActionResult() {}

    // Getters et Setters
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }

    public List<BulkActionItemResult> getResults() { return results; }
    public void setResults(List<BulkActionItemResult> results) { this.results = results; }

    // Méthodes utilitaires
    public void addSuccess(String userId, String message) {
        results.add(new BulkActionItemResult(userId, true, message));
        successCount++;
    }

    public void addFailure(String userId, String error) {
        results.add(new BulkActionItemResult(userId, false, error));
        failureCount++;
    }

    public static class BulkActionItemResult {
        private String userId;
        private boolean success;
        private String message;

        public BulkActionItemResult(String userId, boolean success, String message) {
            this.userId = userId;
            this.success = success;
            this.message = message;
        }

        public String getUserId() { return userId; }
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
}