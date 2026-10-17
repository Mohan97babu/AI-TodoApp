package com.todoapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class StudyPlanRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @Min(value = 1, message = "Plan duration must be at least 1 day")
    @Max(value = 60, message = "Plan duration can be at most 60 days")
    private Integer durationDays = 7;

    private BigDecimal dailyHours = new BigDecimal("2.0");

    private String skillLevel = "BEGINNER"; // BEGINNER, INTERMEDIATE, ADVANCED

    public StudyPlanRequest() {}

    public StudyPlanRequest(String topic, Integer durationDays, BigDecimal dailyHours, String skillLevel) {
        this.topic = topic;
        this.durationDays = durationDays;
        this.dailyHours = dailyHours;
        this.skillLevel = skillLevel;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public BigDecimal getDailyHours() {
        return dailyHours;
    }

    public void setDailyHours(BigDecimal dailyHours) {
        this.dailyHours = dailyHours;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }
}
