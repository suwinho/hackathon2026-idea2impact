package com.example.backend_spring.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;
    private String password;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_data_id", referencedColumnName = "id")
    private UserData userData;

    @ElementCollection
    @CollectionTable(name = "user_matched_cats", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "cat_id")
    private Set<Long> matchedCatIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_rejected_cats", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "cat_id")
    private Set<Long> rejectedCatIds = new HashSet<>();
}