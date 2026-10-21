package com.todoapp.dto;

import java.util.List;
import java.util.Map;

public class ChatbotResponse {
    private String reply;
    private String reasoning;
    private String model;
    private List<Map<String, String>> sources;
    private List<Map<String, Object>> suggestedTasks;
    private long responseTimeMs;

    public ChatbotResponse() {}

    public ChatbotResponse(String reply, List<Map<String, String>> sources) {
        this.reply = reply;
        this.sources = sources;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<Map<String, String>> getSources() {
        return sources;
    }

    public void setSources(List<Map<String, String>> sources) {
        this.sources = sources;
    }

    public List<Map<String, Object>> getSuggestedTasks() {
        return suggestedTasks;
    }

    public void setSuggestedTasks(List<Map<String, Object>> suggestedTasks) {
        this.suggestedTasks = suggestedTasks;
    }

    public long getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }
}
