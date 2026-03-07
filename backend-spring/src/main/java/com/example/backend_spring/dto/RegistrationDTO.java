package com.example.backend_spring.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistrationDTO {
    private String email;
    private String password;

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