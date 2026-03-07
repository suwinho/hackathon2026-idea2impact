package com.example.backend_spring.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend_spring.model.User;

public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
}
