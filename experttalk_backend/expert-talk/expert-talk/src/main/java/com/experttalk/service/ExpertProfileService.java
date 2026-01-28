package com.experttalk.service;

import org.springframework.stereotype.Service;

import com.experttalk.dto.ExpertProfileRequest;
import com.experttalk.entity.Category;
import com.experttalk.entity.ExpertProfile;
import com.experttalk.entity.User;
import com.experttalk.repository.CategoryRepository;
import com.experttalk.repository.ExpertProfileRepository;
import com.experttalk.repository.UserRepository;

@Service
public class ExpertProfileService {

    private final ExpertProfileRepository expertProfileRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ExpertProfileService(
            ExpertProfileRepository expertProfileRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {

        this.expertProfileRepository = expertProfileRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    // ===================== CREATE PROFILE =====================

    public ExpertProfile createProfile(Long userId, ExpertProfileRequest request) {

        // Prevent duplicate profile
        expertProfileRepository.findByUserId(userId)
                .ifPresent(p -> {
                    throw new RuntimeException("Expert profile already exists");
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findByIdAndActiveTrue(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Invalid category"));

        ExpertProfile profile = new ExpertProfile();

        profile.setUser(user);
        profile.setCategory(category);
        profile.setExperienceYears(request.getExperienceYears());
        profile.setSkills(request.getSkills());
        profile.setLanguages(request.getLanguages());
        profile.setBio(request.getBio());
        profile.setRatePerMinute(request.getRatePerMinute());

        // IMPORTANT: ADMIN-CONTROLLED FIELDS
        profile.setVerified(false);  // ALWAYS
        profile.setActive(true);     // DEFAULT

        return expertProfileRepository.save(profile);
    }

    // ===================== GET OWN PROFILE =====================

    public ExpertProfile getMyProfile(Long userId) {

        return expertProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Expert profile not found"));
    }

    // ===================== UPDATE PROFILE =====================

    public ExpertProfile updateProfile(Long userId, ExpertProfileRequest request) {

        ExpertProfile profile = getMyProfile(userId);

        Category category = categoryRepository.findByIdAndActiveTrue(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Invalid category"));

        profile.setCategory(category);
        profile.setExperienceYears(request.getExperienceYears());
        profile.setSkills(request.getSkills());
        profile.setLanguages(request.getLanguages());
        profile.setBio(request.getBio());
        profile.setRatePerMinute(request.getRatePerMinute());

        // Do NOT touch verified / active

        return expertProfileRepository.save(profile);
    }
}
