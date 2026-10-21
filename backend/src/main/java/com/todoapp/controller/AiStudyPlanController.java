package com.todoapp.controller;

import com.todoapp.config.UserPrincipal;
import com.todoapp.dto.ChatbotRequest;
import com.todoapp.dto.ChatbotResponse;
import com.todoapp.dto.StudyPlanRequest;
import com.todoapp.dto.StudyPlanResponse;
import com.todoapp.service.AiChatbotService;
import com.todoapp.service.AiStudyPlanService;
import com.todoapp.service.WebKnowledgeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiStudyPlanController {

    private final AiStudyPlanService aiStudyPlanService;
    private final AiChatbotService aiChatbotService;
    private final WebKnowledgeService webKnowledgeService;

    public AiStudyPlanController(AiStudyPlanService aiStudyPlanService,
                                 AiChatbotService aiChatbotService,
                                 WebKnowledgeService webKnowledgeService) {
        this.aiStudyPlanService = aiStudyPlanService;
        this.aiChatbotService = aiChatbotService;
        this.webKnowledgeService = webKnowledgeService;
    }

    @PostMapping("/study-plan")
    public ResponseEntity<StudyPlanResponse> generateStudyPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StudyPlanRequest request) {
        Long userId = principal != null ? principal.getId() : null;
        StudyPlanResponse response = aiStudyPlanService.generatePlan(request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatbotResponse> chatCoach(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ChatbotRequest request) {
        ChatbotResponse response = aiChatbotService.processChat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/model-status")
    public ResponseEntity<Map<String, Object>> getModelStatus() {
        return ResponseEntity.ok(aiChatbotService.getModelStatus());
    }

    @GetMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(@RequestParam(value = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(webKnowledgeService.retrieveKnowledge(query, null));
    }
}
