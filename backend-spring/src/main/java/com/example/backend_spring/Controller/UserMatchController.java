package com.example.backend_spring.Controller;

import com.example.backend_spring.model.Cat;
import com.example.backend_spring.model.User;
import com.example.backend_spring.repository.CatRepository;
import com.example.backend_spring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserMatchController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CatRepository catRepository;

    @PostMapping("/{userId}/match/{catId}")
    public ResponseEntity<?> matchCat(@PathVariable Long userId, @PathVariable Long catId) {
        return userRepository.findById(userId).map(user -> {
            user.getMatchedCatIds().add(catId);
            user.getRejectedCatIds().remove(catId); 
            userRepository.save(user);
            return ResponseEntity.ok("Zmatchowano kota o ID: " + catId);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}/reject/{catId}")
    public ResponseEntity<?> rejectCat(@PathVariable Long userId, @PathVariable Long catId) {
        return userRepository.findById(userId).map(user -> {
            user.getRejectedCatIds().add(catId);
            user.getMatchedCatIds().remove(catId); 
            userRepository.save(user);
            return ResponseEntity.ok("Odrzucono kota o ID: " + catId);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/discover")
    public ResponseEntity<List<Cat>> getDiscoverableCats(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            Set<Long> seenIds = user.getMatchedCatIds();
            seenIds.addAll(user.getRejectedCatIds());

            List<Cat> discoveryList = catRepository.findAll().stream()
                    .filter(cat -> !seenIds.contains(cat.getId()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(discoveryList);
        }).orElse(ResponseEntity.notFound().build());
    }
}