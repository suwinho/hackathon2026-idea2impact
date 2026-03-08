package com.example.backend_spring.service;

import com.example.backend_spring.model.Admin;
import com.example.backend_spring.model.Cat;
import com.example.backend_spring.repository.CatRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import com.example.backend_spring.repository.AdminRepository;
import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    @Bean
    CommandLineRunner initDatabase(CatRepository repository, AdminRepository adminRepository) {
        return args -> {
            if (repository.count() == 0) {
                
                repository.save(new Cat(
                    null, 
                    "Biszkopt", 
                    2, 
                    List.of("łagodny", "towarzyski", "lubi pieszczoty"),
                    "Biszkopt to kocur, który uwielbia kontakt z człowiekiem. Szuka domu niewychodzącego.",
                    true,
                    "https://trzymajsiekocie.pl/wp-content/uploads/2026/02/image-1.webp"
                ));

                repository.save(new Cat(
                    null, 
                    "Białek", 
                    1, 
                    List.of("delikatny", "nienachalny", "ostrożny"),
                    "Białek to idealny towarzysz dla spokojnych dorosłych kotów. Jest delikatny, nienachalny, ale z radością nawiązuje kocie przyjaźnie.",
                    true,
                    "https://trzymajsiekocie.pl/wp-content/uploads/2025/12/image-29.webp"
                ));

                repository.save(new Cat(
                    null, 
                    "Czesio", 
                    5, 
                    List.of("Towarzyski", "Skory do głaskania", "Skory do zabawy"),
                    "Czesio to ewidentnie kot skory do zabawy z innymi kotami, Uwielbia głaskanie.",
                    true,
                    "https://trzymajsiekocie.pl/wp-content/uploads/2025/12/image-5-6.webp"
                ));

                repository.save(new Cat(
                    null, 
                    "Kiki", 
                    3, 
                    List.of("energiczna", "ciekawa świata", "ruchliwa"),
                    "Kiki to około roczna kotka, pełna energii i ciekawości świata. Bardzo lubi inne koty – świetnie odnajduje się w kocim towarzystwie i chętnie zaprasza do wspólnych zabaw.",
                    true,
                    "https://trzymajsiekocie.pl/wp-content/uploads/2026/01/image-7.webp"
                ));

                System.out.println("✅ Seeding zakończony: Dodano koty do bazy danych.");
            } else {
                System.out.println("ℹ️ Baza danych zawiera już dane, pomijam seeding.");
            }
            if (adminRepository.count() == 0) {
                Admin defaultAdmin = new Admin();
                defaultAdmin.setUsername("admin");
                defaultAdmin.setPassword("admin123"); // Login: admin, Hasło: admin123
                defaultAdmin.setFullName("Administrator Systemu");
                
                adminRepository.save(defaultAdmin);
                System.out.println("🚀 Konto administratora utworzone: admin / admin123");
            }
        };
    }
}