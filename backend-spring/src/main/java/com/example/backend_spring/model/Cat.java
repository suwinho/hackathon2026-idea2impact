package com.example.backend_spring.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Cat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("imie")
    private String name;

    @JsonProperty("wiek")
    private int age;

    @JsonProperty("charakter")
    @ElementCollection
    private List<String> character;

    @JsonProperty("opis")
    private String description;

    @JsonProperty("inne_koty") 
    private boolean otherCats;

    @JsonProperty("zdjecie_url")
    private String imageUrl;
}