package com.todoapp.repository;

import com.todoapp.entity.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<StudyPlan> findByIdAndUserId(Long id, Long userId);
}
