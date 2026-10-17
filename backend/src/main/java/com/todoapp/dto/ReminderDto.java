package com.todoapp.dto;

import com.todoapp.entity.NotificationChannel;
import com.todoapp.entity.ReminderStatus;

import java.time.ZonedDateTime;

public class ReminderDto {

    private Long id;
    private Long taskId;
    private String taskTitle;
    private ZonedDateTime reminderTime;
    private ReminderStatus status;
    private NotificationChannel channel;
    private Integer minutesBefore;

    public ReminderDto() {}

    public ReminderDto(Long id, Long taskId, String taskTitle, ZonedDateTime reminderTime, ReminderStatus status, NotificationChannel channel, Integer minutesBefore) {
        this.id = id;
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.reminderTime = reminderTime;
        this.status = status;
        this.channel = channel;
        this.minutesBefore = minutesBefore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public ZonedDateTime getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(ZonedDateTime reminderTime) {
        this.reminderTime = reminderTime;
    }

    public ReminderStatus getStatus() {
        return status;
    }

    public void setStatus(ReminderStatus status) {
        this.status = status;
    }

    public NotificationChannel getChannel() {
        return channel;
    }

    public void setChannel(NotificationChannel channel) {
        this.channel = channel;
    }

    public Integer getMinutesBefore() {
        return minutesBefore;
    }

    public void setMinutesBefore(Integer minutesBefore) {
        this.minutesBefore = minutesBefore;
    }
}
