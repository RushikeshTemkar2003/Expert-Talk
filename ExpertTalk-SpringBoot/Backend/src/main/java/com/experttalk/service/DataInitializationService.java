package com.experttalk.service;

import com.experttalk.model.*;
import com.experttalk.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeCategories();
        // Removed sample data initialization - users and experts will be created through registration
    }

    private void initializeCategories() {
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Finance", "Financial advice and planning", "Finance"));
            categoryRepository.save(new Category("Healthcare", "Medical consultation and health advice", "Health"));
            categoryRepository.save(new Category("Technology", "Tech support and IT consultation", "Tech"));
            categoryRepository.save(new Category("Education", "Academic guidance and tutoring", "Education"));
            categoryRepository.save(new Category("Legal", "Legal advice and consultation", "Legal"));
            categoryRepository.save(new Category("Counselling", "Mental health and life coaching", "Counselling"));
        }
    }

    private void initializeSampleData() {
        if (userRepository.count() < 10) {
            // Create sample users
            for (int i = 1; i <= 5; i++) {
                if (!userRepository.existsByEmail("user" + i + "@example.com")) {
                    User user = new User();
                    user.setName("User " + i);
                    user.setEmail("user" + i + "@example.com");
                    user.setPassword(passwordEncoder.encode("password"));
                    user.setUserType(UserType.USER);
                    user.setIsApproved(true);
                    userRepository.save(user);
                }
            }

            // Create sample experts
            for (int i = 1; i <= 3; i++) {
                if (!userRepository.existsByEmail("expert" + i + "@example.com")) {
                    User expert = new User();
                    expert.setName("Expert " + i);
                    expert.setEmail("expert" + i + "@example.com");
                    expert.setPassword(passwordEncoder.encode("password"));
                    expert.setUserType(UserType.EXPERT);
                    expert.setIsApproved(true);
                    expert.setIsAvailable(true);
                    expert.setHourlyRate(new BigDecimal("50.00"));
                    expert.setCategoryId((long) i);
                    userRepository.save(expert);
                }
            }
        }

        // Create sample sessions
        if (chatSessionRepository.count() < 5) {
            for (int i = 1; i <= 10; i++) {
                ChatSession session = new ChatSession();
                session.setUserId((long) (1 + (i % 5)));
                session.setExpertId((long) (6 + (i % 3)));
                session.setStartTime(LocalDateTime.now().minusDays(i));
                
                if (i % 3 == 0) {
                    session.setStatus(SessionStatus.ACTIVE);
                } else {
                    session.setEndTime(LocalDateTime.now().minusDays(i).plusHours(1));
                    session.setStatus(SessionStatus.COMPLETED);
                    session.setDurationMinutes(60);
                    session.setTotalAmount(new BigDecimal("50.00"));
                }
                
                chatSessionRepository.save(session);
            }
        }
    }
}