package com.example.backend_spring.Controller;

import com.example.backend_spring.model.Admin;
import com.example.backend_spring.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        return adminRepository.findByUsername(username)
                .filter(admin -> admin.getPassword().equals(password))
                .map(admin -> ResponseEntity.ok(Map.of(
                        "adminId", admin.getId(),
                        "username", admin.getUsername(),
                        "fullName", admin.getFullName(),
                        "role", "ADMIN"
                )))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Błędny login lub hasło administratora")));
    }
}