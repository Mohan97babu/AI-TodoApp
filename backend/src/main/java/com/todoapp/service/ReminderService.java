package com.todoapp.service;

import com.todoapp.dto.ReminderDto;
import com.todoapp.entity.NotificationChannel;
import com.todoapp.entity.Reminder;
import com.todoapp.entity.ReminderStatus;
import com.todoapp.entity.Task;
import com.todoapp.exception.ResourceNotFoundException;
import com.todoapp.repository.ReminderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;

    public ReminderService(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    @Transactional(readOnly = true)
    public List<ReminderDto> getUpcomingReminders(Long userId) {
        return reminderRepository.findAllByUserIdAndStatusOrderByReminderTimeAsc(userId, ReminderStatus.PENDING)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void createOrUpdateTaskReminder(Task task, Integer minutesBefore) {
        reminderRepository.deleteAllByTaskId(task.getId());

        if (minutesBefore == null || minutesBefore <= 0 || task.getDueDate() == null) {
            return;
        }

        ZonedDateTime reminderTime = task.getDueDate().minusMinutes(minutesBefore);
        if (reminderTime.isBefore(ZonedDateTime.now())) {
            // If already passed, set for 1 minute from now so user gets an immediate alert
            reminderTime = ZonedDateTime.now().plusSeconds(10);
        }

        Reminder reminder = new Reminder();
        reminder.setTask(task);
        reminder.setUser(task.getUser());
        reminder.setMinutesBefore(minutesBefore);
        reminder.setReminderTime(reminderTime);
        reminder.setStatus(ReminderStatus.PENDING);
        reminder.setChannel(NotificationChannel.WEB_PUSH);

        reminderRepository.save(reminder);
    }

    @Transactional
    public void dismissReminder(Long reminderId, Long userId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));
        reminder.setStatus(ReminderStatus.DISMISSED);
        reminderRepository.save(reminder);
    }

    public ReminderDto toDto(Reminder reminder) {
        return new ReminderDto(
                reminder.getId(),
                reminder.getTask().getId(),
                reminder.getTask().getTitle(),
                reminder.getReminderTime(),
                reminder.getStatus(),
                reminder.getChannel(),
                reminder.getMinutesBefore()
        );
    }
}
