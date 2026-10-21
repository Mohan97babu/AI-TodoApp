package com.todoapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.dto.StudyPlanDayDto;
import com.todoapp.dto.StudyPlanRequest;
import com.todoapp.dto.StudyPlanResponse;
import com.todoapp.dto.StudyPlanTaskItemDto;
import com.todoapp.entity.Priority;
import com.todoapp.entity.StudyPlan;
import com.todoapp.entity.User;
import com.todoapp.repository.StudyPlanRepository;
import com.todoapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class AiStudyPlanService {

    private static final Logger log = LoggerFactory.getLogger(AiStudyPlanService.class);

    private final StudyPlanRepository studyPlanRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${app.openai.api-key:}")
    private String apiKey;

    @Value("${app.openai.api-url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${app.openai.model:gpt-4o-mini}")
    private String model;

    public AiStudyPlanService(StudyPlanRepository studyPlanRepository, UserRepository userRepository) {
        this.studyPlanRepository = studyPlanRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public StudyPlanResponse generatePlan(StudyPlanRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        StudyPlan plan = new StudyPlan();
        plan.setUser(user);
        plan.setTopic(request.getTopic().trim());
        plan.setDurationDays(request.getDurationDays() != null ? request.getDurationDays() : 7);
        plan.setDailyHours(request.getDailyHours() != null ? request.getDailyHours() : new BigDecimal("2.0"));
        plan.setSkillLevel(request.getSkillLevel() != null ? request.getSkillLevel() : "BEGINNER");

        StudyPlanResponse response;

        // If OpenAI API key is provided, attempt OpenAI call first
        if (StringUtils.hasText(apiKey) && !apiKey.equalsIgnoreCase("optional_or_enter_key_here")) {
            try {
                response = callOpenAi(request);
            } catch (Exception e) {
                log.warn("Failed to generate plan via OpenAI API, falling back to built-in curriculum generator: {}", e.getMessage());
                response = generateHeuristicPlan(request);
            }
        } else {
            // Intelligent built-in curriculum generation engine
            response = generateHeuristicPlan(request);
        }

        plan.setSummary(response.getSummary());
        plan = studyPlanRepository.save(plan);

        response.setId(plan.getId());
        response.setTopic(plan.getTopic());
        response.setDurationDays(plan.getDurationDays());
        response.setDailyHours(plan.getDailyHours());
        response.setSkillLevel(plan.getSkillLevel());

        return response;
    }

    private StudyPlanResponse callOpenAi(StudyPlanRequest request) throws Exception {
        String systemPrompt = "You are an expert pedagogical tutor and study planner. " +
                "Given a topic, duration in days, daily study hours, and skill level, " +
                "return a structured JSON response with a summary and a practical day-by-day study schedule. " +
                "Each day must have a 'dayNumber', 'dayTitle', 'focusTheme', and a list of 'tasks'. " +
                "Each task must have: 'title', 'description' (concrete, actionable), 'estimatedMinutes' (integer), 'priority' (LOW, MEDIUM, HIGH, URGENT), and 'category' ('STUDY'). " +
                "Output ONLY valid JSON matching this schema: " +
                "{\"summary\": string, \"days\": [{\"dayNumber\": int, \"dayTitle\": string, \"focusTheme\": string, \"tasks\": [{\"title\": string, \"description\": string, \"estimatedMinutes\": int, \"priority\": string, \"category\": string}]}]}";

        String userPrompt = String.format("Topic: %s\nDuration: %d days\nDaily Hours: %.1f hours\nTarget Skill Level: %s",
                request.getTopic(), request.getDurationDays(), request.getDailyHours().doubleValue(), request.getSkillLevel());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("response_format", Map.of("type", "json_object"));

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));
        body.put("messages", messages);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> apiResponse = restTemplate.postForEntity(apiUrl, entity, String.class);

        if (apiResponse.getStatusCode().is2xxSuccessful() && apiResponse.getBody() != null) {
            JsonNode root = objectMapper.readTree(apiResponse.getBody());
            String content = root.path("choices").get(0).path("message").path("content").asText();
            
            if (content.contains("<think>")) {
                int end = content.indexOf("</think>");
                if (end != -1) {
                    content = content.substring(end + 8).trim();
                }
            }
            if (content.startsWith("```json")) {
                content = content.substring(7);
            } else if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }
            content = content.trim();

            JsonNode planJson = objectMapper.readTree(content);

            StudyPlanResponse planResponse = new StudyPlanResponse();
            planResponse.setSummary(planJson.path("summary").asText());

            List<StudyPlanDayDto> days = new ArrayList<>();
            JsonNode daysNode = planJson.path("days");
            if (daysNode.isArray()) {
                for (JsonNode dayNode : daysNode) {
                    StudyPlanDayDto dayDto = new StudyPlanDayDto();
                    dayDto.setDayNumber(dayNode.path("dayNumber").asInt());
                    dayDto.setDayTitle(dayNode.path("dayTitle").asText());
                    dayDto.setFocusTheme(dayNode.path("focusTheme").asText());

                    List<StudyPlanTaskItemDto> taskList = new ArrayList<>();
                    JsonNode tasksNode = dayNode.path("tasks");
                    if (tasksNode.isArray()) {
                        for (JsonNode tNode : tasksNode) {
                            Priority prio = Priority.MEDIUM;
                            try {
                                prio = Priority.valueOf(tNode.path("priority").asText("MEDIUM").toUpperCase());
                            } catch (Exception ignored) {}

                            taskList.add(new StudyPlanTaskItemDto(
                                    tNode.path("title").asText(),
                                    tNode.path("description").asText(),
                                    tNode.path("estimatedMinutes").asInt(45),
                                    prio,
                                    "STUDY"
                            ));
                        }
                    }
                    dayDto.setTasks(taskList);
                    days.add(dayDto);
                }
            }
            planResponse.setDays(days);
            return planResponse;
        }

        throw new RuntimeException("Empty or non-200 response from OpenAI");
    }

    /**
     * Built-in intelligent curriculum engine providing high-yield, structured day-by-day plans
     */
    public StudyPlanResponse generateHeuristicPlan(StudyPlanRequest request) {
        String topic = request.getTopic().trim();
        int days = request.getDurationDays() != null ? request.getDurationDays() : 7;
        double dailyHours = request.getDailyHours() != null ? request.getDailyHours().doubleValue() : 2.0;
        int dailyMinutes = (int) (dailyHours * 60);

        StudyPlanResponse response = new StudyPlanResponse();
        response.setSummary(String.format("Practical %d-day master plan for '%s' designed for %s level, targeting %.1f hours/day with actionable milestones.",
                days, topic, request.getSkillLevel(), dailyHours));

        List<StudyPlanDayDto> planDays = new ArrayList<>();

        // Generate tailored phases across the days
        for (int i = 1; i <= days; i++) {
            StudyPlanDayDto day = new StudyPlanDayDto();
            day.setDayNumber(i);

            String phaseName;
            String focus;
            List<StudyPlanTaskItemDto> tasks = new ArrayList<>();

            double progressRatio = (double) i / days;

            if (i == 1) {
                phaseName = "Fundamentals & Setup";
                focus = "Environment setup, core concepts, and high-level architecture";
                tasks.add(new StudyPlanTaskItemDto(
                        "Set up learning workspace & tools for " + topic,
                        "Install required SDKs, IDE extensions, or reference books. Verify environment setup.",
                        Math.min(45, dailyMinutes / 2),
                        Priority.HIGH,
                        "STUDY"
                ));
                tasks.add(new StudyPlanTaskItemDto(
                        "Review core terminology and fundamentals of " + topic,
                        "Study the official documentation, cheatsheets, and mental model basics.",
                        Math.min(60, dailyMinutes / 2),
                        Priority.MEDIUM,
                        "STUDY"
                ));
            } else if (progressRatio <= 0.4) {
                phaseName = "Foundational Mastery & Patterns";
                focus = "Hands-on drill of building blocks, syntax, and foundational idioms";
                tasks.add(new StudyPlanTaskItemDto(
                        String.format("Deep dive into core primitives & concepts (Part %d)", i),
                        "Work through code examples or guided problems illustrating key paradigms.",
                        Math.min(50, dailyMinutes / 2),
                        Priority.MEDIUM,
                        "STUDY"
                ));
                tasks.add(new StudyPlanTaskItemDto(
                        "Build mini-exercise applying " + topic + " primitives",
                        "Implement an isolated exercise or test cases to solidify understanding without copy-pasting.",
                        Math.min(60, dailyMinutes / 2),
                        Priority.HIGH,
                        "STUDY"
                ));
            } else if (progressRatio <= 0.75) {
                phaseName = "Intermediate Integration & Real-world Scenarios";
                focus = "Practical projects, error handling, edge cases, and best practices";
                tasks.add(new StudyPlanTaskItemDto(
                        String.format("Build real-world feature utilizing %s (Day %d)", topic, i),
                        "Connect multiple components together. Tackle realistic state, data flow, or system rules.",
                        Math.min(75, (int)(dailyMinutes * 0.6)),
                        Priority.URGENT,
                        "STUDY"
                ));
                tasks.add(new StudyPlanTaskItemDto(
                        "Refactor code & audit common antipatterns",
                        "Review performance caveats, debugging techniques, and standard style guides.",
                        Math.min(45, (int)(dailyMinutes * 0.4)),
                        Priority.MEDIUM,
                        "STUDY"
                ));
            } else if (i < days) {
                phaseName = "Advanced Topics & Capstone Build";
                focus = "Optimization, security, testing, and capstone implementation";
                tasks.add(new StudyPlanTaskItemDto(
                        "Develop capstone project milestone for " + topic,
                        "Implement end-to-end functionality integrating everything learned so far.",
                        Math.min(80, (int)(dailyMinutes * 0.65)),
                        Priority.HIGH,
                        "STUDY"
                ));
                tasks.add(new StudyPlanTaskItemDto(
                        "Unit testing and edge-case validation",
                        "Write automated tests or perform stress verification to validate edge cases.",
                        Math.min(40, (int)(dailyMinutes * 0.35)),
                        Priority.MEDIUM,
                        "STUDY"
                ));
            } else {
                phaseName = "Final Review, Retrospective & Synthesis";
                focus = "Self-assessment, knowledge synthesis, and practical portfolio polish";
                tasks.add(new StudyPlanTaskItemDto(
                        "Complete and document final project / study notes",
                        "Write a 1-page summary of learnings, cheatsheet references, and next steps.",
                        Math.min(60, dailyMinutes / 2),
                        Priority.HIGH,
                        "STUDY"
                ));
                tasks.add(new StudyPlanTaskItemDto(
                        "Spaced repetition quiz & next steps roadmap",
                        "Self-test on challenging concepts and identify follow-up advanced learning paths.",
                        Math.min(45, dailyMinutes / 2),
                        Priority.LOW,
                        "STUDY"
                ));
            }

            day.setDayTitle(String.format("Day %d: %s", i, phaseName));
            day.setFocusTheme(focus);
            day.setTasks(tasks);
            planDays.add(day);
        }

        response.setDays(planDays);
        return response;
    }
}
