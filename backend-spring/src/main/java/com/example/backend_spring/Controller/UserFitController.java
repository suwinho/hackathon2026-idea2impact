package com.example.backend_spring.Controller;

import com.example.backend_spring.model.UserFit;
import com.example.backend_spring.repository.UserFitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/fit")
@CrossOrigin(origins = "*")
public class UserFitController {

    @Autowired
    private UserFitRepository fitRepository;

    @PostMapping
    public ResponseEntity<?> saveFit(@RequestBody UserFit fit) {
        try {
            UserFit saved = fitRepository.save(fit);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "fitId", saved.getId(),
                "message", "Wynik dopasowania został trwale zapisany w bazie."
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Błąd podczas zapisu dopasowania: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<UserFit>> getUserFits(@PathVariable Long userId) {
        List<UserFit> fits = fitRepository.findByUserIdOrderByMatchPercentageDesc(userId);
        return ResponseEntity.ok(fits);
    }
}