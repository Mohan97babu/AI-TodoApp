package com.todoapp.controller;

import com.todoapp.config.UserPrincipal;
import com.todoapp.dto.ReminderDto;
import com.todoapp.service.ReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<ReminderDto>> getUpcomingReminders(@AuthenticationPrincipal UserPrincipal principal) {
        List<ReminderDto> reminders = reminderService.getUpcomingReminders(principal.getId());
        return ResponseEntity.ok(reminders);
    }

    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissReminder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        reminderService.dismissReminder(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
