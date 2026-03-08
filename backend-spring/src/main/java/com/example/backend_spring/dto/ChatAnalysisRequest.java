package com.example.backend_spring.dto;

import java.util.List;

import lombok.Data;

@Data
public class ChatAnalysisRequest {
    private String catName;
    private List<String> catCharacter;
    private List<String> chatHistory; 
}