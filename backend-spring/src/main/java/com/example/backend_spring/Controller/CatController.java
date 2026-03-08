package com.example.backend_spring.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_spring.model.Cat;
import com.example.backend_spring.repository.CatRepository;

@RestController
@RequestMapping("/api/cats")
@CrossOrigin(origins = "*") 
public class CatController {

    @Autowired
    private CatRepository catRepository;

    @GetMapping
    public List<Cat> getAllCats() {
        return catRepository.findAll();
    }

    @PostMapping
    public Cat addCat(@RequestBody Cat cat) {
        return catRepository.save(cat);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCat(@PathVariable Long id) {
        return catRepository.findById(id)
            .map(cat -> {
                catRepository.delete(cat);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}