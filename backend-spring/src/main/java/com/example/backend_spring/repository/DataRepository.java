package com.example.backend_spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend_spring.model.UserData;

public interface DataRepository extends JpaRepository<UserData,Long>{

}
