package com.todoapp.service;

import com.todoapp.dto.*;
import com.todoapp.entity.*;
import com.todoapp.exception.ResourceNotFoundException;
import com.todoapp.repository.ReminderRepository;
import com.todoapp.repository.StudyPlanRepository;
import com.todoapp.repository.TaskRepository;
import com.todoapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.time.DayOfWeek;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final StudyPlanRepository studyPlanRepository;
    private final ReminderService reminderService;
    private final ReminderRepository reminderRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            StudyPlanRepository studyPlanRepository,
            ReminderService reminderService,
            ReminderRepository reminderRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.studyPlanRepository = studyPlanRepository;
        this.reminderService = reminderService;
        this.reminderRepository = reminderRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasks(Long userId, TaskStatus status, String category, String search) {
        // Build predicates only for supplied filters: nullable :param IS NULL predicates
        // can fail on PostgreSQL with "could not determine data type of parameter".
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Task> query = cb.createQuery(Task.class);
        Root<Task> task = query.from(Task.class);
        List<Predicate> filters = new ArrayList<>();
        filters.add(cb.equal(task.get("user").get("id"), userId));

        if (status != null) {
            filters.add(cb.equal(task.get("status"), status));
        }
        if (category != null && !category.isBlank()) {
            filters.add(cb.equal(cb.lower(task.get("category")), category.trim().toLowerCase(Locale.ROOT)));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            filters.add(cb.or(
                    cb.like(cb.lower(task.get("title")), pattern),
                    cb.like(cb.lower(task.get("description")), pattern)
            ));
        }
        query.where(filters.toArray(Predicate[]::new));
        query.orderBy(
                cb.asc(cb.selectCase().when(cb.isNull(task.get("dueDate")), 1).otherwise(0)),
                cb.asc(task.get("dueDate")),
                cb.desc(task.get("createdAt"))
        );
        return entityManager.createQuery(query).getResultList()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return toDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Task task = new Task();
        task.setUser(user);
        applyCreateRequestToEntity(request, task);

        if (request.getStudyPlanId() != null) {
            task.setStudyPlan(studyPlanRepository.findByIdAndUserId(request.getStudyPlanId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Study plan not found")));
        }

        task = taskRepository.save(task);

        if (request.getReminderMinutesBefore() != null && request.getReminderMinutesBefore() > 0) {
            reminderService.createOrUpdateTaskReminder(task, request.getReminderMinutesBefore());
        }

        return toDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long taskId, TaskUpdateRequest request, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getCategory() != null) {
            task.setCategory(request.getCategory().trim().toUpperCase());
        }
        task.setDueDate(request.getDueDate());
        if (request.getEstimatedMinutes() != null) {
            task.setEstimatedMinutes(request.getEstimatedMinutes());
        }
        if (request.getIsRecurring() != null) {
            task.setIsRecurring(request.getIsRecurring());
        }
        if (request.getRecurrenceInterval() != null) {
            task.setRecurrenceInterval(request.getRecurrenceInterval());
        }

        task = taskRepository.save(task);

        if (request.getReminderMinutesBefore() != null) {
            reminderService.createOrUpdateTaskReminder(task, request.getReminderMinutesBefore());
        }

        return toDto(task);
    }

    @Transactional
    public TaskDto updateStatus(Long taskId, TaskStatus newStatus, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(newStatus);
        task = taskRepository.save(task);

        // Handle recurring task completion
        if (newStatus == TaskStatus.COMPLETED && oldStatus != TaskStatus.COMPLETED
                && Boolean.TRUE.equals(task.getIsRecurring())
                && task.getRecurrenceInterval() != RecurrenceInterval.NONE
                && task.getDueDate() != null) {

            spawnNextRecurrence(task);
        }

        return toDto(task);
    }

    private void spawnNextRecurrence(Task completedTask) {
        ZonedDateTime nextDueDate = calculateNextDate(completedTask.getDueDate(), completedTask.getRecurrenceInterval());

        Task nextTask = new Task();
        nextTask.setUser(completedTask.getUser());
        nextTask.setTitle(completedTask.getTitle());
        nextTask.setDescription(completedTask.getDescription());
        nextTask.setCategory(completedTask.getCategory());
        nextTask.setPriority(completedTask.getPriority());
        nextTask.setEstimatedMinutes(completedTask.getEstimatedMinutes());
        nextTask.setIsRecurring(true);
        nextTask.setRecurrenceInterval(completedTask.getRecurrenceInterval());
        nextTask.setStatus(TaskStatus.PENDING);
        nextTask.setDueDate(nextDueDate);

        nextTask = taskRepository.save(nextTask);

        // Also schedule reminder for next recurring task if original had one
        if (!completedTask.getReminders().isEmpty()) {
            Integer minutesBefore = completedTask.getReminders().get(0).getMinutesBefore();
            reminderService.createOrUpdateTaskReminder(nextTask, minutesBefore);
        }
    }

    private ZonedDateTime calculateNextDate(ZonedDateTime date, RecurrenceInterval interval) {
        if (date == null) return ZonedDateTime.now().plusDays(1);
        switch (interval) {
            case DAILY:
                return date.plusDays(1);
            case WEEKDAYS:
                ZonedDateTime next = date.plusDays(1);
                while (next.getDayOfWeek() == DayOfWeek.SATURDAY || next.getDayOfWeek() == DayOfWeek.SUNDAY) {
                    next = next.plusDays(1);
                }
                return next;
            case WEEKLY:
                return date.plusWeeks(1);
            case MONTHLY:
                return date.plusMonths(1);
            default:
                return date.plusDays(1);
        }
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        taskRepository.delete(task);
    }

    @Transactional
    public List<TaskDto> batchCreateTasks(BatchTaskCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StudyPlan plan = null;
        if (request.getStudyPlanId() != null) {
            plan = studyPlanRepository.findByIdAndUserId(request.getStudyPlanId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Study plan not found"));
        }

        List<Task> createdTasks = new ArrayList<>();
        for (TaskCreateRequest taskReq : request.getTasks()) {
            Task task = new Task();
            task.setUser(user);
            task.setStudyPlan(plan);
            applyCreateRequestToEntity(taskReq, task);
            createdTasks.add(task);
        }

        createdTasks = taskRepository.saveAll(createdTasks);
        return createdTasks.stream().map(this::toDto).collect(Collectors.toList());
    }

    private void applyCreateRequestToEntity(TaskCreateRequest request, Task task) {
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING);
        task.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        task.setCategory(request.getCategory() != null ? request.getCategory().trim().toUpperCase() : "GENERAL");
        task.setDueDate(request.getDueDate());
        task.setEstimatedMinutes(request.getEstimatedMinutes() != null ? request.getEstimatedMinutes() : 30);
        task.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        task.setRecurrenceInterval(request.getRecurrenceInterval() != null ? request.getRecurrenceInterval() : RecurrenceInterval.NONE);
    }

    public TaskDto toDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setUserId(task.getUser().getId());
        dto.setStudyPlanId(task.getStudyPlan() != null ? task.getStudyPlan().getId() : null);
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setCategory(task.getCategory());
        dto.setDueDate(task.getDueDate());
        dto.setEstimatedMinutes(task.getEstimatedMinutes());
        dto.setIsRecurring(task.getIsRecurring());
        dto.setRecurrenceInterval(task.getRecurrenceInterval());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        if (task.getReminders() != null) {
            dto.setReminders(task.getReminders().stream()
                    .map(reminderService::toDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
