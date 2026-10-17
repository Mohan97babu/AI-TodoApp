package com.todoapp.entity;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reminder_time", nullable = false)
    private ZonedDateTime reminderTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReminderStatus status = ReminderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationChannel channel = NotificationChannel.WEB_PUSH;

    @Column(name = "minutes_before", nullable = false)
    private Integer minutesBefore = 15;

    @Column(name = "sent_at")
    private ZonedDateTime sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    public Reminder() {}

    public Reminder(Task task, User user, ZonedDateTime reminderTime, Integer minutesBefore) {
        this.task = task;
        this.user = user;
        this.reminderTime = reminderTime;
        this.minutesBefore = minutesBefore;
        this.status = ReminderStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = ZonedDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public ZonedDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(ZonedDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
