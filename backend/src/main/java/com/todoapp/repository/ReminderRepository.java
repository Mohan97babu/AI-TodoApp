package com.todoapp.repository;

import com.todoapp.entity.Reminder;
import com.todoapp.entity.ReminderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findAllByUserIdAndStatusOrderByReminderTimeAsc(Long userId, ReminderStatus status);

    Optional<Reminder> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT r FROM Reminder r JOIN FETCH r.task t JOIN FETCH r.user u " +
           "WHERE r.status = :status AND r.reminderTime <= :cutoff")
    List<Reminder> findDueReminders(
            @Param("status") ReminderStatus status,
            @Param("cutoff") ZonedDateTime cutoff
    );

    void deleteAllByTaskId(Long taskId);
}
