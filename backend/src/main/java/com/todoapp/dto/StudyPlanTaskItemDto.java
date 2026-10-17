package com.todoapp.dto;

import com.todoapp.entity.Priority;

public class StudyPlanTaskItemDto {

    private String title;
    private String description;
    private Integer estimatedMinutes = 45;
    private Priority priority = Priority.MEDIUM;
    private String category = "STUDY";

    public StudyPlanTaskItemDto() {}

    public StudyPlanTaskItemDto(String title, String description, Integer estimatedMinutes, Priority priority, String category) {
        this.title = title;
        this.description = description;
        this.estimatedMinutes = estimatedMinutes;
        this.priority = priority;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
