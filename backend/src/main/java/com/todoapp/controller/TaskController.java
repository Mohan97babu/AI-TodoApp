package com.todoapp.controller;

import com.todoapp.config.UserPrincipal;
import com.todoapp.dto.*;
import com.todoapp.entity.TaskStatus;
import com.todoapp.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<TaskDto> tasks = taskService.getTasks(principal.getId(), status, category, search);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        TaskDto task = taskService.getTaskById(id, principal.getId());
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskCreateRequest request) {
        TaskDto created = taskService.createTask(request, principal.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TaskUpdateRequest request) {
        TaskDto updated = taskService.updateTask(id, request, principal.getId());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        TaskDto updated = taskService.updateStatus(id, request.getStatus(), principal.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        taskService.deleteTask(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch")
    public ResponseEntity<List<TaskDto>> batchCreateTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody BatchTaskCreateRequest request) {
        List<TaskDto> created = taskService.batchCreateTasks(request, principal.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
