package com.todoapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.todoapp.dto.ChatbotRequest;
import com.todoapp.dto.ChatbotResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.*;

@Service
public class AiChatbotService {

    private static final Logger log = LoggerFactory.getLogger(AiChatbotService.class);

    private final WebKnowledgeService webKnowledgeService;
    private final RestTemplate restTemplate;
    private final RestTemplate statusRestTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.openai.api-key:}")
    private String apiKey;

    @Value("${app.openai.api-url:http://localhost:8000/v1/chat/completions}")
    private String apiUrl;

    @Value("${app.openai.model:qwen3-1.7b}")
    private String modelName;

    public AiChatbotService(WebKnowledgeService webKnowledgeService) {
        this.webKnowledgeService = webKnowledgeService;
        SimpleClientHttpRequestFactory modelFactory = new SimpleClientHttpRequestFactory();
        modelFactory.setConnectTimeout(4000);
        modelFactory.setReadTimeout(120000);
        this.restTemplate = new RestTemplate(modelFactory);
        SimpleClientHttpRequestFactory statusFactory = new SimpleClientHttpRequestFactory();
        statusFactory.setConnectTimeout(2000);
        statusFactory.setReadTimeout(3000);
        this.statusRestTemplate = new RestTemplate(statusFactory);
        this.objectMapper = new ObjectMapper();
    }

    public ChatbotResponse processChat(ChatbotRequest request) {
        long startTime = System.currentTimeMillis();
        String userQuery = request.getMessage() != null ? request.getMessage().trim() : "";
        if (userQuery.isEmpty() || userQuery.length() > 2000) {
            throw new IllegalArgumentException("Please enter a question between 1 and 2000 characters.");
        }

        // 1. Retrieve web knowledge context from GeeksforGeeks, W3Schools, and TPointTech
        Map<String, Object> knowledgeResult = webKnowledgeService.retrieveKnowledge(
                userQuery,
                request.getSourcesEnabled()
        );

        String contextSnippet = (String) knowledgeResult.get("contextSnippet");
        @SuppressWarnings("unchecked")
        List<Map<String, String>> sources = (List<Map<String, String>>) knowledgeResult.get("sources");

        ChatbotResponse response = new ChatbotResponse();
        response.setModel(modelName);
        response.setSources(sources != null ? sources : Collections.emptyList());

        // 2. Attempt call to local Qwen 3 (1.7B) model server
        boolean callSucceeded = false;
        if (StringUtils.hasText(apiUrl) && !apiUrl.contains("optional_or_enter_key_here")) {
            try {
                ChatbotResponse modelRes = callQwenModel(userQuery, request.getHistory(), contextSnippet, sources);
                response.setReply(modelRes.getReply());
                response.setReasoning(modelRes.getReasoning());
                response.setSuggestedTasks(modelRes.getSuggestedTasks());
                callSucceeded = true;
            } catch (Exception e) {
                log.warn("Direct call to local Qwen model at {} failed: {}. Utilizing intelligent knowledge engine fallback.", apiUrl, e.getMessage());
            }
        }

        // 3. Fallback synthesis if local model server is paused
        if (!callSucceeded || !StringUtils.hasText(response.getReply())) {
            response = generateKnowledgeFallbackReply(userQuery, contextSnippet, sources);
        }

        response.setResponseTimeMs(System.currentTimeMillis() - startTime);
        return response;
    }

    private ChatbotResponse callQwenModel(String query, List<Map<String, String>> history,
                                          String contextSnippet, List<Map<String, String>> sources) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (StringUtils.hasText(apiKey)) {
            headers.setBearerAuth(apiKey);
        }

        StringBuilder systemPrompt = new StringBuilder();
        systemPrompt.append("You are Planify Dev & Study Assistant, an expert AI coding tutor and daily study architect.\n");
        systemPrompt.append("You use locally curated programming topic notes plus suggested links to GeeksforGeeks, W3Schools, and TPointTech. These sites are not fetched live.\n\n");
        systemPrompt.append("Guidelines:\n");
        systemPrompt.append("1. Answer concisely with clear technical explanations and modern syntax.\n");
        systemPrompt.append("2. Include practical code snippets with clean syntax highlighting.\n");
        systemPrompt.append("3. Only mention suggested reference links if relevant; never claim to have browsed a site, verified an article, or read its live content.\n");
        systemPrompt.append("4. At the end of your answer, provide 1 to 3 short, actionable practice tasks the user can schedule into their daily planner.\n");
        systemPrompt.append("Format them under a header: '### Recommended Action Items:' with bullet points like '- [ ] Task Name (XX mins): Description'.\n\n");

        if (StringUtils.hasText(contextSnippet)) {
            systemPrompt.append("Local curated topic notes (not fetched from websites):\n").append(contextSnippet).append("\n");
        }

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt.toString()));

        // Add history (up to last 6 turns)
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                Map<String, String> h = history.get(i);
                if (h.containsKey("role") && h.containsKey("content")) {
                    String role = h.get("role");
                    String content = h.get("content");
                    if (("user".equals(role) || "assistant".equals(role)) && content != null && content.length() <= 4000) {
                        messages.add(Map.of("role", role, "content", content));
                    }
                }
            }
        }

        // Add current user query
        messages.add(Map.of("role", "user", "content", query));

        Map<String, Object> body = new HashMap<>();
        body.put("model", modelName);
        body.put("messages", messages);
        body.put("temperature", 0.7);
        body.put("max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> apiRes = restTemplate.postForEntity(apiUrl, entity, String.class);

        if (!apiRes.getStatusCode().is2xxSuccessful() || apiRes.getBody() == null) {
            throw new RuntimeException("Model server returned status: " + apiRes.getStatusCode());
        }

        JsonNode root = objectMapper.readTree(apiRes.getBody());
        JsonNode choice = root.path("choices").get(0);
        JsonNode messageNode = choice.path("message");

        String replyContent = messageNode.path("content").asText("");
        String reasoning = messageNode.path("reasoning_content").asText("");

        // Handle case where Qwen 3 puts response into reasoning or thinking tags
        if (!StringUtils.hasText(replyContent) && StringUtils.hasText(reasoning)) {
            replyContent = reasoning;
            reasoning = "";
        } else if (replyContent.contains("<think>")) {
            int endThink = replyContent.indexOf("</think>");
            if (endThink != -1) {
                reasoning = replyContent.substring(7, endThink).trim();
                replyContent = replyContent.substring(endThink + 8).trim();
            }
        }

        ChatbotResponse res = new ChatbotResponse();
        res.setReply(replyContent);
        res.setReasoning(reasoning);
        res.setSources(sources);
        res.setSuggestedTasks(extractSuggestedTasks(replyContent));
        return res;
    }

    private ChatbotResponse generateKnowledgeFallbackReply(String query, String contextSnippet, List<Map<String, String>> sources) {
        StringBuilder reply = new StringBuilder();
        reply.append("### Key Concepts & Technical Overview\n\n");
        reply.append("The local AI model is currently unavailable. These are Planify's built-in learning notes, not verified live website content. Related tutorial links are suggestions for further reading.\n\n");

        if (StringUtils.hasText(contextSnippet)) {
            reply.append(contextSnippet).append("\n");
        } else {
            reply.append("No local topic notes matched this question. Please try a more specific programming topic or explore the suggested links.\n\n");
        }

        reply.append("\n### Recommended Action Items:\n");
        reply.append("- [ ] Review Core Concepts (30 mins): Study syntax and edge-cases on GeeksforGeeks / W3Schools.\n");
        reply.append("- [ ] Hands-on Implementation (45 mins): Write and execute a working code example in your local workspace.\n");
        reply.append("- [ ] Code Review & Testing (20 mins): Test boundary inputs and verify time/space complexities.\n");

        ChatbotResponse res = new ChatbotResponse();
        res.setReply(reply.toString());
        res.setSources(sources);
        res.setSuggestedTasks(extractSuggestedTasks(reply.toString()));
        return res;
    }

    private List<Map<String, Object>> extractSuggestedTasks(String content) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        if (!StringUtils.hasText(content)) return tasks;

        String[] lines = content.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("- [ ]") || trimmed.startsWith("* [ ]") || trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.")) {
                String taskText = trimmed.replaceFirst("^[\\-*\\d\\.\\[\\]\\s]+", "").trim();
                if (taskText.length() > 5) {
                    Map<String, Object> task = new HashMap<>();
                    task.put("title", taskText.length() > 80 ? taskText.substring(0, 77) + "..." : taskText);
                    task.put("description", "Suggested by AI Dev & Study Assistant (" + modelName + ")");
                    task.put("priority", "HIGH");
                    task.put("category", "STUDY");
                    task.put("estimatedMinutes", 45);
                    tasks.add(task);
                }
            }
        }

        if (tasks.isEmpty()) {
            tasks.add(Map.of(
                    "title", "Practice & Implement: " + (content.length() > 40 ? content.substring(0, 37) + "..." : "Study Topic"),
                    "description", "Hands-on coding drill based on AI Assistant guidance",
                    "priority", "MEDIUM",
                    "category", "STUDY",
                    "estimatedMinutes", 30
            ));
        }

        return tasks.size() > 4 ? tasks.subList(0, 4) : tasks;
    }

    public Map<String, Object> getModelStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configuredModel", modelName);

        // Derive base URL to ping /v1/models
        String baseModelsUrl = apiUrl.replace("/chat/completions", "/models");
        long start = System.currentTimeMillis();

        try {
            HttpHeaders headers = new HttpHeaders();
            if (StringUtils.hasText(apiKey)) {
                headers.setBearerAuth(apiKey);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> res = statusRestTemplate.exchange(baseModelsUrl, HttpMethod.GET, entity, String.class);
            long latency = System.currentTimeMillis() - start;

            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                status.put("connected", true);
                status.put("latencyMs", latency);
                status.put("status", "ONLINE");
            } else {
                status.put("connected", false);
                status.put("status", "UNAVAILABLE");
            }
        } catch (Exception e) {
            status.put("connected", false);
            status.put("latencyMs", -1);
            status.put("status", "OFFLINE");
        }

        return status;
    }
}
