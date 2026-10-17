package com.todoapp.dto;

import java.util.ArrayList;
import java.util.List;

public class BatchTaskCreateRequest {

    private Long studyPlanId;
    private List<TaskCreateRequest> tasks = new ArrayList<>();

    public BatchTaskCreateRequest() {}

    public BatchTaskCreateRequest(Long studyPlanId, List<TaskCreateRequest> tasks) {
        this.studyPlanId = studyPlanId;
        this.tasks = tasks;
    }

    public Long getStudyPlanId() {
        return studyPlanId;
    }

    public void setStudyPlanId(Long studyPlanId) {
        this.studyPlanId = studyPlanId;
    }

    public List<TaskCreateRequest> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskCreateRequest> tasks) {
        this.tasks = tasks;
    }
}
