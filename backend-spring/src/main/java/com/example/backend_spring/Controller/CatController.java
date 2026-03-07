package com.example.backend_spring.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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
}