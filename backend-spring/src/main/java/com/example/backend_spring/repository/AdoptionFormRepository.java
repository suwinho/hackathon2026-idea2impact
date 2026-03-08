package com.example.backend_spring.repository;

import com.example.backend_spring.model.AdoptionForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionFormRepository extends JpaRepository<AdoptionForm, Long> {
    List<AdoptionForm> findAllByOrderByCreatedAtDesc();
}
