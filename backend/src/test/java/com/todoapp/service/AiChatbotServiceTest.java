package com.todoapp.service;

import com.todoapp.dto.ChatbotRequest;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class AiChatbotServiceTest {
    @Test
    void rejectsEmptyAndOverlongQuestions() {
        AiChatbotService service = new AiChatbotService(new WebKnowledgeService());
        assertThrows(IllegalArgumentException.class, () -> service.processChat(new ChatbotRequest("  ")));
        assertThrows(IllegalArgumentException.class, () -> service.processChat(new ChatbotRequest("a".repeat(2001))));
    }

    @Test
    void publicModelStatusDoesNotExposeInternalUrlsOrExceptions() {
        AiChatbotService service = new AiChatbotService(new WebKnowledgeService());
        ReflectionTestUtils.setField(service, "apiUrl", "http://127.0.0.1:1/v1/chat/completions");
        ReflectionTestUtils.setField(service, "modelName", "qwen3-1.7b");
        Map<String, Object> status = service.getModelStatus();
        assertEquals(Boolean.FALSE, status.get("connected"));
        assertEquals("OFFLINE", status.get("status"));
        assertFalse(status.containsKey("endpoint"));
        assertFalse(status.containsKey("error"));
    }

    @Test
    void offlineResponseIdentifiesCuratedNotesAsNonLive() {
        AiChatbotService service = new AiChatbotService(new WebKnowledgeService());
        ReflectionTestUtils.setField(service, "apiUrl", "");
        ReflectionTestUtils.setField(service, "modelName", "qwen3-1.7b");
        var response = service.processChat(new ChatbotRequest("Explain binary search"));
        assertTrue(response.getReply().contains("not verified live website content"));
    }
}
