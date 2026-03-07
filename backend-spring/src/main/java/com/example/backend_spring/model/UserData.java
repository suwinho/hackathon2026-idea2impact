package com.example.backend_spring.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_data")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imie;
    private String nazwisko;
    private LocalDate dataUrodzenia;
    private String telefon;
    private String miasto;
    private String rodzajLokum;

    private Boolean czyMialKota;
    private Boolean czyMaInneZwierzeta;
    private Boolean czyZgadzaSieNaWizyte;
    private Boolean czyWszyscyDomownicyZgodni;
    private Boolean czyDomBezpieczny;
}