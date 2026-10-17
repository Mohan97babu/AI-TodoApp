package com.todoapp.repository;

import com.todoapp.entity.Task;
import com.todoapp.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByUserIdOrderByDueDateAsc(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:category IS NULL OR LOWER(t.category) = LOWER(:category)) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY " +
           "CASE WHEN t.dueDate IS NULL THEN 1 ELSE 0 END, t.dueDate ASC, t.createdAt DESC")
    List<Task> searchTasks(
            @Param("userId") Long userId,
            @Param("status") TaskStatus status,
            @Param("category") String category,
            @Param("search") String search
    );

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.dueDate BETWEEN :start AND :end ORDER BY t.dueDate ASC")
    List<Task> findDueBetween(
            @Param("userId") Long userId,
            @Param("start") ZonedDateTime start,
            @Param("end") ZonedDateTime end
    );

    List<Task> findAllByUserIdAndIsRecurringTrue(Long userId);
}
