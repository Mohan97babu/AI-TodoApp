package com.todoapp.service;

import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class WebKnowledgeServiceTest {

    private final WebKnowledgeService service = new WebKnowledgeService();

    @Test
    void emptySearchReturnsNoFalseMatches() {
        Map<String, Object> result = service.retrieveKnowledge("  ", null);
        assertEquals(0, result.get("matchedTopicCount"));
        assertTrue(((List<?>) result.get("sources")).isEmpty());
        assertEquals(Boolean.FALSE, result.get("liveContentFetched"));
    }

    @Test
    void relevantTopicProvidesCuratedNotesAndReferenceLinks() {
        Map<String, Object> result = service.retrieveKnowledge("Explain binary search", null);
        assertTrue((int) result.get("matchedTopicCount") > 0);
        assertTrue(((String) result.get("contextSnippet")).contains("Binary Search"));
        assertEquals("curated-local", result.get("knowledgeOrigin"));
        assertEquals(Boolean.FALSE, result.get("liveContentFetched"));
        assertFalse(((List<?>) result.get("sources")).isEmpty());
    }

    @Test
    void disablingAllSitesReturnsNoSourceLinks() {
        Map<String, Object> flags = Map.of(); // typed separately below
        Map<String, Boolean> disabled = Map.of(
                "geeksforgeeks", false,
                "w3schools", false,
                "tpointtech", false
        );
        Map<String, Object> result = service.retrieveKnowledge("binary search", disabled);
        assertTrue(((List<?>) result.get("sources")).isEmpty());
    }

    @Test
    void irrelevantQueryHasNoInventedMatches() {
        Map<String, Object> result = service.retrieveKnowledge("zzzxqv241", null);
        assertEquals(0, result.get("matchedTopicCount"));
    }

    @Test
    void sourceLimitKeepsResponseCompact() {
        Map<String, Object> result = service.retrieveKnowledge("binary search and spring boot and java collections", null);
        assertTrue((int) result.get("matchedTopicCount") <= 3);
    }
}
