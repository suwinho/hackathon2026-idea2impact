package com.example.backend_spring.Controller;

import lombok.*;
import jakarta.persistence.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.backend_spring.model.ChatMessage;
import com.example.backend_spring.repository.ChatMessageRepository;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatRepository;
    
    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/send")
    public ChatMessage saveMessage(@RequestBody ChatMessage message) {
        return chatRepository.save(message);
    }

    @GetMapping("/{userId}/{catId}")
    public List<ChatMessage> getHistory(@PathVariable Long userId, @PathVariable Long catId) {
        return chatRepository.findByUserIdAndCatIdOrderByTimestampAsc(userId, catId);
    }

    @PostMapping("/{userId}/{catId}/analyze")
    public ResponseEntity<?> analyzeChat(@PathVariable Long userId, @PathVariable Long catId) {
        List<ChatMessage> history = chatRepository.findByUserIdAndCatIdOrderByTimestampAsc(userId, catId);

        List<String> userAnswers = history.stream()
            .filter(m -> "user".equals(m.getRole()))
            .map(ChatMessage::getContent)
            .collect(Collectors.toList());

        if (userAnswers.isEmpty()) {
            return ResponseEntity.badRequest().body("Brak odpowiedzi użytkownika do analizy.");
        }

        String aiUrl = "http://ai-service:5000/analyze-chat";

        try {
            var aiResponse = restTemplate.postForEntity(aiUrl, userAnswers, Map.class);

            if (aiResponse.getStatusCode() == HttpStatus.OK) {
                return ResponseEntity.ok(aiResponse.getBody());
            } else {
                return ResponseEntity.status(aiResponse.getStatusCode()).body("AI zwróciło błąd.");
            }
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("match_score", 50);
            fallback.put("summary", "Analiza chwilowo niedostępna. Spróbuj później!");
            fallback.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(fallback);
        }
    }
}
