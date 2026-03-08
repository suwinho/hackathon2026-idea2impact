package com.example.backend_spring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_fits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserFit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long catId;
    
    private Integer matchPercentage; 
   
}