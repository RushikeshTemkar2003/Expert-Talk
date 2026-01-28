package com.experttalk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.experttalk.dto.ExpertProfileRequest;
import com.experttalk.entity.ExpertProfile;
import com.experttalk.entity.User;
import com.experttalk.service.ExpertProfileService;
import com.experttalk.service.UserService;

@RestController
@RequestMapping("/expert/profile")
public class ExpertProfileController {

    private final ExpertProfileService expertProfileService;
    private final UserService userService;

    public ExpertProfileController(
            ExpertProfileService expertProfileService,
            UserService userService) {
        this.expertProfileService = expertProfileService;
        this.userService = userService;
    }

    // ===================== CREATE =====================

    @PostMapping("/create")
    public ResponseEntity<ExpertProfile> createProfile(
            Authentication authentication,
            @Validated @RequestBody ExpertProfileRequest request) {

        String email = authentication.getName(); // ✔ SAFE
        User user = userService.getByEmail(email);

        ExpertProfile createdProfile =
                expertProfileService.createProfile(user.getId(), request);

        return ResponseEntity.ok(createdProfile);
    }

    // ===================== GET MY PROFILE =====================

    @GetMapping("/get")
    public ResponseEntity<ExpertProfile> getMyProfile(Authentication authentication) {

        String email = authentication.getName();
        User user = userService.getByEmail(email);

        ExpertProfile profile =
                expertProfileService.getMyProfile(user.getId());

        return ResponseEntity.ok(profile);
    }

    // ===================== UPDATE =====================

    @PutMapping("/update")
    public ResponseEntity<ExpertProfile> updateProfile(
            Authentication authentication,
            @Validated @RequestBody ExpertProfileRequest request) {

        String email = authentication.getName();
        User user = userService.getByEmail(email);

        ExpertProfile updatedProfile =
                expertProfileService.updateProfile(user.getId(), request);

        return ResponseEntity.ok(updatedProfile);
    }
}
