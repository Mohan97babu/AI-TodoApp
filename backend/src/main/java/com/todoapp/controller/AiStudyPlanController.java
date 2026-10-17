package com.todoapp.controller;

import com.todoapp.config.UserPrincipal;
import com.todoapp.dto.StudyPlanRequest;
import com.todoapp.dto.StudyPlanResponse;
import com.todoapp.service.AiStudyPlanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiStudyPlanController {

    private final AiStudyPlanService aiStudyPlanService;

    public AiStudyPlanController(AiStudyPlanService aiStudyPlanService) {
        this.aiStudyPlanService = aiStudyPlanService;
    }

    @PostMapping("/study-plan")
    public ResponseEntity<StudyPlanResponse> generateStudyPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StudyPlanRequest request) {
        StudyPlanResponse response = aiStudyPlanService.generatePlan(request, principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatCoach(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> payload) {
        String message = payload.getOrDefault("message", "");
        String reply = "Great initiative! Focus on high-retention active recall. Break '" + 
                message.replaceAll("(?i)<script.*?>.*?</script.*?>", "") + 
                "' down into daily 45-minute sprint sessions with measurable output.";
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
