package com.example.backend_spring.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_forms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AdoptionForm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long catId;
    private String catName;
    private String adoptionType; // "Adopcja stała" or "Dom tymczasowy"

    // User info
    private String imie;
    private String nazwisko;
    private String email;
    private String telefon;
    private String miasto;
    private String rodzajLokum;

    // Survey answers as text
    @Column(length = 1000)
    private String odpowiedzi;

    private Integer matchPercentage;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
