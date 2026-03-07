package com.example.backend_spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend_spring.model.Cat;

public interface CatRepository extends JpaRepository<Cat,Long>{

}

