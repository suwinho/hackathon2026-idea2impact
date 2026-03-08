package com.example.backend_spring.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_spring.dto.RegistrationDTO;
import com.example.backend_spring.model.AdoptionForm;
import com.example.backend_spring.model.User;
import com.example.backend_spring.model.UserData;
import com.example.backend_spring.repository.AdoptionFormRepository;
import com.example.backend_spring.repository.UserRepository;


@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = "*")
public class FormController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdoptionFormRepository adoptionFormRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationDTO dto) {
        try {
            UserData details = new UserData();
            details.setImie(dto.getImie());
            details.setNazwisko(dto.getNazwisko());
            details.setDataUrodzenia(dto.getDataUrodzenia());
            details.setTelefon(dto.getTelefon());
            details.setMiasto(dto.getMiasto());
            details.setRodzajLokum(dto.getRodzajLokum());

            User user = new User();
            user.setEmail(dto.getEmail());
            user.setPassword(dto.getPassword());
            user.setUserData(details);

            User saved = userRepository.save(user);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Konto z tym adresem email już istnieje lub dane są nieprawidłowe."));
        }
    }

    @PostMapping("/adoption")
    public ResponseEntity<?> submitAdoptionForm(@RequestBody AdoptionForm form) {
        try {
            AdoptionForm saved = adoptionFormRepository.save(form);
            return ResponseEntity.ok(Map.of("success", true, "formId", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/adoption")
    public ResponseEntity<List<AdoptionForm>> getAllAdoptionForms() {
        return ResponseEntity.ok(adoptionFormRepository.findAllByOrderByCreatedAtDesc());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/adoption/{id}")
    public ResponseEntity<?> deleteAdoptionForm(@org.springframework.web.bind.annotation.PathVariable Long id) {
        try {
            adoptionFormRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}