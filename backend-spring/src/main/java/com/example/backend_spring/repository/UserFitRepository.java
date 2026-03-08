package com.example.backend_spring.repository;

import com.example.backend_spring.model.UserFit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserFitRepository extends JpaRepository<UserFit, Long> {
    List<UserFit> findByUserIdOrderByMatchPercentageDesc(Long userId);
}