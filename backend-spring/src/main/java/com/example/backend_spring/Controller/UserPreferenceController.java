package com.example.backend_spring.Controller;

import com.example.backend_spring.model.User;
import com.example.backend_spring.model.UserData;
import com.example.backend_spring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserPreferenceController {

    @Autowired
    private UserRepository userRepository;

    
    @PostMapping("/{userId}/preferences")
    public ResponseEntity<?> savePreferences(@PathVariable Long userId, @RequestBody Map<String, Boolean> prefs) {
        return userRepository.findById(userId).map(user -> {
            UserData data = user.getUserData();
            
            if (data == null) {
                return ResponseEntity.badRequest().body("Błąd: Użytkownik nie posiada zainicjowanego obiektu UserData.");
            }

            if (prefs.containsKey("energiczny")) {
                data.setEnergiczny(prefs.get("energiczny"));
            }
            if (prefs.containsKey("drapie_meble")) {
                data.setDrapieMeble(prefs.get("drapie_meble"));
            }
            if (prefs.containsKey("towarzyski")) {
                data.setTowarzyski(prefs.get("towarzyski"));
            }
            if (prefs.containsKey("duzo_czasu")) {
                data.setDuzoCzasu(prefs.get("duzo_czasu"));
            }

            userRepository.save(user);

            System.out.println("✅ Zapisano preferencje dla User ID: " + userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Preferencje zostały zapisane w profilu użytkownika."
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}   