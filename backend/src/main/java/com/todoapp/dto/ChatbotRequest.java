package com.todoapp.dto;

import java.util.List;
import java.util.Map;

public class ChatbotRequest {
    private String message;
    private List<Map<String, String>> history;
    private Map<String, Boolean> sourcesEnabled;
    private String mode; // "dev", "study", "qa"

    public ChatbotRequest() {}

    public ChatbotRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<Map<String, String>> getHistory() {
        return history;
    }

    public void setHistory(List<Map<String, String>> history) {
        this.history = history;
    }

    public Map<String, Boolean> getSourcesEnabled() {
        return sourcesEnabled;
    }

    public void setSourcesEnabled(Map<String, Boolean> sourcesEnabled) {
        this.sourcesEnabled = sourcesEnabled;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
