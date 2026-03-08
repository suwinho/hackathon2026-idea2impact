package com.example.backend_spring.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admins")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // Admin loguje się loginem/nickiem

    @Column(nullable = false)
    private String password;

    private String fullName; // Np. Imię i Nazwisko pracownika schroniska
}