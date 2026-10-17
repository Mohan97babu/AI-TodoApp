package com.todoapp.dto;

import java.util.ArrayList;
import java.util.List;

public class StudyPlanDayDto {

    private Integer dayNumber;
    private String dayTitle;
    private String focusTheme;
    private List<StudyPlanTaskItemDto> tasks = new ArrayList<>();

    public StudyPlanDayDto() {}

    public StudyPlanDayDto(Integer dayNumber, String dayTitle, String focusTheme, List<StudyPlanTaskItemDto> tasks) {
        this.dayNumber = dayNumber;
        this.dayTitle = dayTitle;
        this.focusTheme = focusTheme;
        this.tasks = tasks != null ? tasks : new ArrayList<>();
    }

    public Integer getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(Integer dayNumber) {
        this.dayNumber = dayNumber;
    }

    public String getDayTitle() {
        return dayTitle;
    }

    public void setDayTitle(String dayTitle) {
        this.dayTitle = dayTitle;
    }

    public String getFocusTheme() {
        return focusTheme;
    }

    public void setFocusTheme(String focusTheme) {
        this.focusTheme = focusTheme;
    }

    public List<StudyPlanTaskItemDto> getTasks() {
        return tasks;
    }

    public void setTasks(List<StudyPlanTaskItemDto> tasks) {
        this.tasks = tasks;
    }
}
