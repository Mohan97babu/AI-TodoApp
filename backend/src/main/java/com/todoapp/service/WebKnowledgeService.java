package com.todoapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class WebKnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(WebKnowledgeService.class);

    public static class KnowledgeTopic {
        private final String id;
        private final String title;
        private final String summary;
        private final String codeSnippet;
        private final String gfgUrl;
        private final String w3sUrl;
        private final String tpointUrl;
        private final List<String> keywords;

        public KnowledgeTopic(String id, String title, String summary, String codeSnippet,
                              String gfgUrl, String w3sUrl, String tpointUrl, List<String> keywords) {
            this.id = id;
            this.title = title;
            this.summary = summary;
            this.codeSnippet = codeSnippet;
            this.gfgUrl = gfgUrl;
            this.w3sUrl = w3sUrl;
            this.tpointUrl = tpointUrl;
            this.keywords = keywords;
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getSummary() { return summary; }
        public String getCodeSnippet() { return codeSnippet; }
        public String getGfgUrl() { return gfgUrl; }
        public String getW3sUrl() { return w3sUrl; }
        public String getTpointUrl() { return tpointUrl; }
        public List<String> getKeywords() { return keywords; }
    }

    private final List<KnowledgeTopic> topics = new ArrayList<>();

    public WebKnowledgeService() {
        initializeKnowledgeBase();
    }

    private void initializeKnowledgeBase() {
        // 1. Data Structures & Algorithms
        topics.add(new KnowledgeTopic(
                "binary-search",
                "Binary Search Algorithm",
                "Binary search is an efficient divide-and-conquer search algorithm that runs in O(log n) time on sorted collections by repeatedly dividing the search interval in half.",
                "int binarySearch(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}",
                "https://www.geeksforgeeks.org/binary-search/",
                "https://www.w3schools.com/dsa/dsa_algo_binarysearch.php",
                "https://www.tpointtech.com/binary-search",
                List.of("binary search", "binarysearch", "search algorithm", "divide and conquer", "o(log n)")
        ));

        topics.add(new KnowledgeTopic(
                "linked-list",
                "Linked List Data Structure",
                "A linear data structure where elements (nodes) are stored sequentially via pointers rather than contiguous memory locations, allowing O(1) insertions/deletions at known positions.",
                "class Node {\n    int data;\n    Node next;\n    Node(int val) { this.data = val; }\n}",
                "https://www.geeksforgeeks.org/data-structures/linked-list/",
                "https://www.w3schools.com/dsa/dsa_theory_linkedlists.php",
                "https://www.tpointtech.com/linked-list",
                List.of("linked list", "linkedlist", "singly linked", "doubly linked", "nodes", "pointers")
        ));

        topics.add(new KnowledgeTopic(
                "binary-tree",
                "Binary Tree & BST (Binary Search Tree)",
                "A hierarchical tree structure where each node has at most two children. In a BST, the left subtree contains values smaller than the root, and the right subtree contains values greater.",
                "void inorder(Node root) {\n    if (root == null) return;\n    inorder(root.left);\n    System.out.print(root.val + \" \");\n    inorder(root.right);\n}",
                "https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
                "https://www.w3schools.com/dsa/dsa_theory_binarytrees.php",
                "https://www.tpointtech.com/binary-search-tree",
                List.of("binary tree", "bst", "tree traversal", "inorder", "preorder", "postorder", "binary search tree")
        ));

        topics.add(new KnowledgeTopic(
                "dynamic-programming",
                "Dynamic Programming (DP)",
                "An optimization method that solves complex problems by breaking them down into simpler overlapping subproblems with optimal substructure, caching results via memoization or tabulation.",
                "int fib(int n) {\n    int[] dp = new int[n + 1];\n    dp[0] = 0; dp[1] = 1;\n    for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];\n    return dp[n];\n}",
                "https://www.geeksforgeeks.org/dynamic-programming/",
                "https://www.w3schools.com/dsa/dsa_algo_dynamicprogramming.php",
                "https://www.tpointtech.com/dynamic-programming",
                List.of("dynamic programming", "dp", "memoization", "tabulation", "knapsack", "subproblems", "fibonacci")
        ));

        // 2. Web & Frontend
        topics.add(new KnowledgeTopic(
                "css-flexbox",
                "CSS Flexbox Layout Guide",
                "CSS Flexible Box Layout provides a 1-dimensional layout model for arranging items in rows or columns with dynamic space distribution, alignment, and ordering.",
                ".container {\n  display: flex;\n  justify-content: center; /* main axis */\n  align-items: center;     /* cross axis */\n  gap: 1rem;\n  flex-wrap: wrap;\n}",
                "https://www.geeksforgeeks.org/css-flexbox/",
                "https://www.w3schools.com/css/css3_flexbox.asp",
                "https://www.tpointtech.com/css-flexbox",
                List.of("flexbox", "css flex", "display flex", "justify-content", "align-items", "flex-direction", "flex")
        ));

        topics.add(new KnowledgeTopic(
                "css-grid",
                "CSS Grid Layout Architecture",
                "A powerful 2-dimensional grid-based layout system for web design, allowing simultaneous control over rows and columns without floats or positioning hacks.",
                ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}",
                "https://www.geeksforgeeks.org/css-grid/",
                "https://www.w3schools.com/css/css_grid.asp",
                "https://www.tpointtech.com/css-grid",
                List.of("css grid", "grid layout", "grid-template-columns", "grid-template-rows", "css layout")
        ));

        topics.add(new KnowledgeTopic(
                "react-hooks",
                "React Hooks (useState, useEffect, useMemo, useCallback)",
                "Functions that let functional components tap into React state, lifecycle management, context, and performance memoization without writing class components.",
                "import { useState, useEffect } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    document.title = `Count: ${count}`;\n  }, [count]);\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}",
                "https://www.geeksforgeeks.org/reactjs-hooks/",
                "https://www.w3schools.com/react/react_hooks.asp",
                "https://www.tpointtech.com/react-hooks",
                List.of("react hooks", "usestate", "useeffect", "usecallback", "usememo", "useref", "react state")
        ));

        topics.add(new KnowledgeTopic(
                "javascript-promises",
                "JavaScript Promises & Async/Await",
                "Objects representing the eventual completion or failure of asynchronous operations, providing clean chaining (.then/.catch) and synchronous-like syntax via async/await.",
                "async function fetchUserData(userId) {\n  try {\n    const response = await fetch(`/api/users/${userId}`);\n    if (!response.ok) throw new Error('Network error');\n    return await response.json();\n  } catch (err) {\n    console.error('Fetch failed:', err);\n  }\n}",
                "https://www.geeksforgeeks.org/javascript-promises/",
                "https://www.w3schools.com/js/js_promise.asp",
                "https://www.tpointtech.com/javascript-promises",
                List.of("promises", "async await", "javascript async", "fetch api", "event loop", "asynchronous")
        ));

        // 3. Backend & Java / Spring Boot
        topics.add(new KnowledgeTopic(
                "spring-boot-rest",
                "Spring Boot RESTful API Architecture",
                "Building robust REST web services with Spring Boot using @RestController, @RequestMapping, @Autowired, ResponseEntity, DTO validation, and service layers.",
                "@RestController\n@RequestMapping(\"/api/tasks\")\npublic class TaskController {\n    private final TaskService taskService;\n    \n    public TaskController(TaskService taskService) {\n        this.taskService = taskService;\n    }\n    \n    @GetMapping\n    public ResponseEntity<List<TaskDto>> getAll() {\n        return ResponseEntity.ok(taskService.findAll());\n    }\n}",
                "https://www.geeksforgeeks.org/spring-boot-rest-api/",
                "https://www.w3schools.com/java/java_classes.asp",
                "https://www.tpointtech.com/spring-boot-rest-example",
                List.of("spring boot", "rest controller", "rest api", "spring framework", "spring security", "dependency injection", "@restcontroller")
        ));

        topics.add(new KnowledgeTopic(
                "java-collections",
                "Java Collections Framework (List, Set, Map)",
                "A unified architecture for representing and manipulating collections of objects in Java, featuring ArrayList, LinkedList, HashSet, TreeSet, HashMap, and ConcurrentHashMap.",
                "Map<String, Integer> wordCount = new HashMap<>();\nwordCount.put(\"java\", 10);\nwordCount.compute(\"java\", (k, v) -> v == null ? 1 : v + 1);\nwordCount.forEach((k, v) -> System.out.println(k + \": \" + v));",
                "https://www.geeksforgeeks.org/collections-in-java-2/",
                "https://www.w3schools.com/java/java_hashmap.asp",
                "https://www.tpointtech.com/collections-in-java",
                List.of("collections", "hashmap", "arraylist", "hashset", "java map", "java list", "collections framework")
        ));

        topics.add(new KnowledgeTopic(
                "sql-joins",
                "SQL Joins (INNER, LEFT, RIGHT, FULL OUTER)",
                "Relational database operations used to combine columns from one or more tables based on related columns between them.",
                "SELECT u.name, t.title, t.status\nFROM users u\nLEFT JOIN tasks t ON u.id = t.user_id\nWHERE t.status = 'PENDING'\nORDER BY t.due_date ASC;",
                "https://www.geeksforgeeks.org/sql-join-set-1-inner-left-right-and-full-joins/",
                "https://www.w3schools.com/sql/sql_join.asp",
                "https://www.tpointtech.com/sql-join",
                List.of("sql joins", "inner join", "left join", "right join", "sql query", "database join", "foreign key")
        ));

        topics.add(new KnowledgeTopic(
                "jwt-authentication",
                "JWT (JSON Web Token) Security & Stateless Auth",
                "An open standard (RFC 7519) for securely transmitting information between parties as a digitally signed JSON object, commonly used for stateless bearer authorization.",
                "String token = Jwts.builder()\n    .subject(username)\n    .claim(\"userId\", userId)\n    .issuedAt(new Date())\n    .expiration(new Date(System.currentTimeMillis() + 86400000))\n    .signWith(signingKey)\n    .compact();",
                "https://www.geeksforgeeks.org/json-web-token-jwt/",
                "https://www.w3schools.com/cybersecurity/",
                "https://www.tpointtech.com/jwt-tutorial",
                List.of("jwt", "json web token", "bearer token", "stateless auth", "spring security jwt", "token authentication")
        ));

        topics.add(new KnowledgeTopic(
                "docker-containers",
                "Docker Containers & Docker Compose",
                "A platform for containerizing applications, packaging code, runtime, system tools, and libraries to ensure consistent environments across local development and production cloud.",
                "# docker-compose.yml example\nversion: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - \"8080:8080\"\n    environment:\n      - SPRING_PROFILES_ACTIVE=prod",
                "https://www.geeksforgeeks.org/docker-tutorial/",
                "https://www.w3schools.com/git/",
                "https://www.tpointtech.com/docker-tutorial",
                List.of("docker", "docker compose", "container", "dockerfile", "devops", "containerization")
        ));
    }

    /**
     * Resolves relevant documentation and tutorials from GeeksforGeeks, W3Schools, and TPointTech
     * based on user question and enabled sources.
     */
    public Map<String, Object> retrieveKnowledge(String query, Map<String, Boolean> sourcesEnabled) {
        if (query == null) query = "";
        String cleanQuery = query.toLowerCase(Locale.ROOT).trim();
        if (cleanQuery.length() > 200) cleanQuery = cleanQuery.substring(0, 200);
        if (cleanQuery.isEmpty()) {
            return Map.of(
                    "contextSnippet", "",
                    "sources", List.of(),
                    "matchedTopicCount", 0,
                    "knowledgeOrigin", "curated-local",
                    "liveContentFetched", false
            );
        }

        boolean enableGfg = sourcesEnabled == null || sourcesEnabled.getOrDefault("geeksforgeeks", true);
        boolean enableW3s = sourcesEnabled == null || sourcesEnabled.getOrDefault("w3schools", true);
        boolean enableTpoint = sourcesEnabled == null || sourcesEnabled.getOrDefault("tpointtech", true);

        List<KnowledgeTopic> matchedTopics = new ArrayList<>();
        for (KnowledgeTopic t : topics) {
            boolean matched = false;
            for (String kw : t.getKeywords()) {
                if (!cleanQuery.isEmpty() && (cleanQuery.contains(kw) || (cleanQuery.length() >= 5 && kw.contains(cleanQuery)))) {
                    matched = true;
                    break;
                }
            }
            if (matched) {
                matchedTopics.add(t);
                if (matchedTopics.size() >= 3) break;
            }
        }

        // Suggested reference links from a curated local topic catalog; not live-fetched pages.
        List<Map<String, String>> sources = new ArrayList<>();

        StringBuilder contextBuilder = new StringBuilder();

        if (!matchedTopics.isEmpty()) {
            for (KnowledgeTopic mt : matchedTopics) {
                contextBuilder.append("### Concept: ").append(mt.getTitle()).append("\n");
                contextBuilder.append("Summary: ").append(mt.getSummary()).append("\n");
                if (mt.getCodeSnippet() != null) {
                    contextBuilder.append("Example Pattern:\n```\n").append(mt.getCodeSnippet()).append("\n```\n");
                }
                contextBuilder.append("\n");

                if (enableGfg && mt.getGfgUrl() != null) {
                    sources.add(Map.of("site", "GeeksforGeeks", "title", mt.getTitle() + " - GeeksforGeeks", "url", mt.getGfgUrl()));
                }
                if (enableW3s && mt.getW3sUrl() != null) {
                    sources.add(Map.of("site", "W3Schools", "title", mt.getTitle() + " - W3Schools", "url", mt.getW3sUrl()));
                }
                if (enableTpoint && mt.getTpointUrl() != null) {
                    sources.add(Map.of("site", "TPointTech", "title", mt.getTitle() + " - TPointTech", "url", mt.getTpointUrl()));
                }
            }
        } else {
            // General query fallback: construct search links for the user
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            if (enableGfg) {
                sources.add(Map.of("site", "GeeksforGeeks", "title", "Search '" + query + "' on GeeksforGeeks", "url", "https://www.geeksforgeeks.org/search/?q=" + encodedQuery));
            }
            if (enableW3s) {
                sources.add(Map.of("site", "W3Schools", "title", "Search '" + query + "' on W3Schools", "url", "https://www.w3schools.com/search/search.asp?q=" + encodedQuery));
            }
            if (enableTpoint) {
                sources.add(Map.of("site", "TPointTech", "title", "Search '" + query + "' on TPointTech", "url", "https://www.tpointtech.com/search?q=" + encodedQuery));
            }
            // No fabricated summary when the local catalog has no matching topic.
        }

        Map<String, Object> result = new HashMap<>();
        result.put("contextSnippet", contextBuilder.toString());
        result.put("sources", sources);
        result.put("matchedTopicCount", matchedTopics.size());
        result.put("knowledgeOrigin", "curated-local");
        result.put("liveContentFetched", false);
        return result;
    }

    public List<KnowledgeTopic> getAllTopics() {
        return Collections.unmodifiableList(topics);
    }
}
