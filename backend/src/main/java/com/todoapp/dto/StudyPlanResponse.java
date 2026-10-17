package com.todoapp.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class StudyPlanResponse {

    private Long id;
    private String topic;
    private Integer durationDays;
    private BigDecimal dailyHours;
    private String skillLevel;
    private String summary;
    private List<StudyPlanDayDto> days = new ArrayList<>();

    public StudyPlanResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<StudyPlanDayDto> getDays() {
        return days;
    }

    public void setDays(List<StudyPlanDayDto> days) {
        this.days = days;
    }
}
