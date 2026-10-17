package com.todoapp.service;

import com.todoapp.entity.Reminder;
import com.todoapp.entity.ReminderStatus;
import com.todoapp.repository.ReminderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);

    private final ReminderRepository reminderRepository;

    public NotificationScheduler(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    /**
     * Runs every 30 seconds to detect due reminders and process notification deliveries.
     */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void processDueReminders() {
        ZonedDateTime now = ZonedDateTime.now();
        List<Reminder> dueReminders = reminderRepository.findDueReminders(ReminderStatus.PENDING, now);

        if (!dueReminders.isEmpty()) {
            log.info("Processing {} due reminder(s)", dueReminders.size());
            for (Reminder reminder : dueReminders) {
                try {
                    // Mark reminder as SENT
                    reminder.setStatus(ReminderStatus.SENT);
                    reminder.setSentAt(now);
                    reminderRepository.save(reminder);

                    log.info("Dispatched notification for Task ID: {}, Title: '{}', User: '{}'",
                            reminder.getTask().getId(),
                            reminder.getTask().getTitle(),
                            reminder.getUser().getUsername());

                    // In a production setup with Web Push / FCM / APNS:
                    // webPushClient.sendNotification(user.getPushSubscription(), payload);

                } catch (Exception e) {
                    log.error("Failed to process reminder ID {}: {}", reminder.getId(), e.getMessage());
                }
            }
        }
    }
}
