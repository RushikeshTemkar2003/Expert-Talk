package com.experttalk.controller;

import com.experttalk.dto.AuthDTOs.*;
import com.experttalk.model.User;
import com.experttalk.model.UserType;
import com.experttalk.repository.CategoryRepository;
import com.experttalk.repository.UserRepository;
import com.experttalk.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto registerDto) {
        try {
            // Validation
            List<String> errors = new ArrayList<>();
            
            if (registerDto.getName() == null || registerDto.getName().trim().isEmpty()) {
                errors.add("Name is required");
            }
            
            if (registerDto.getEmail() == null || registerDto.getEmail().trim().isEmpty()) {
                errors.add("Email is required");
            } else if (!isValidEmail(registerDto.getEmail())) {
                errors.add("Invalid email format");
            }
            
            if (registerDto.getPassword() == null || registerDto.getPassword().length() < 8) {
                errors.add("Password must be at least 8 characters");
            } else if (!isValidPassword(registerDto.getPassword())) {
                errors.add("Password must contain uppercase, lowercase, number and special character");
            }
            
            if (registerDto.getUserType() == 2) { // Expert
                if (registerDto.getCategoryId() == null || registerDto.getCategoryId() <= 0) {
                    errors.add("Category is required for experts");
                }
                if (registerDto.getHourlyRate() == null || registerDto.getHourlyRate().doubleValue() <= 0) {
                    errors.add("Hourly rate is required for experts");
                }
                if (registerDto.getBio() == null || registerDto.getBio().trim().isEmpty()) {
                    errors.add("Bio is required for experts");
                }
            }
            
            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse(errors));
            }

            if (userRepository.existsByEmail(registerDto.getEmail())) {
                return ResponseEntity.status(409).body(new MessageResponse("Email already exists. Please use a different email address."));
            }

            User user = new User();
            user.setName(registerDto.getName());
            user.setEmail(registerDto.getEmail());
            user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
            user.setPhone(registerDto.getPhone() != null ? registerDto.getPhone() : "");
            user.setUserType(UserType.fromValue(registerDto.getUserType()));
            user.setCategoryId(registerDto.getCategoryId());
            user.setHourlyRate(registerDto.getHourlyRate());
            user.setBio(registerDto.getBio() != null ? registerDto.getBio() : "");
            user.setIsApproved(true); // Auto-approve for demo
        user.setIsOnline(false); // User is not online until they login

            userRepository.save(user);

            return ResponseEntity.ok(new RegisterResponseDto(true, "Registration successful. Please login to continue.", false));
        } catch (Exception ex) {
            List<String> errors = new ArrayList<>();
            errors.add("Registration failed: " + ex.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(errors));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        try {
            List<String> errors = new ArrayList<>();
            
            if (loginDto.getEmail() == null || loginDto.getEmail().trim().isEmpty()) {
                errors.add("Email is required");
            } else if (!isValidEmail(loginDto.getEmail())) {
                errors.add("Invalid email format");
            }
            
            if (loginDto.getPassword() == null || loginDto.getPassword().trim().isEmpty()) {
                errors.add("Password is required");
            }
            
            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse(errors));
            }

            Optional<User> userOpt = userRepository.findByEmail(loginDto.getEmail());
            
            if (userOpt.isEmpty() || !passwordEncoder.matches(loginDto.getPassword(), userOpt.get().getPassword())) {
                return ResponseEntity.status(401).body(new MessageResponse("Invalid email or password. Please check your credentials."));
            }

            User user = userOpt.get();
            
            if (user.getUserType() == UserType.EXPERT && !user.getIsApproved()) {
                return ResponseEntity.status(403).body(new MessageResponse("Your expert account is pending approval. Please wait for admin approval."));
            }

            // Update last login and online status
            user.setIsOnline(true);
            userRepository.save(user);

            String role = getRoleName(user.getUserType());
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getName(), role);
            UserDto userDto = convertToUserDto(user);

            return ResponseEntity.ok(new AuthResponseDto(token, userDto));
        } catch (Exception ex) {
            List<String> errors = new ArrayList<>();
            errors.add("Login failed: " + ex.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(errors));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Long userId = jwtUtil.extractUserId(token);
                
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    user.setIsOnline(false);
                    userRepository.save(user);
                }
            }
            
            return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(new MessageResponse("Logout failed: " + ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Long userId = jwtUtil.extractUserId(token);
                
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    UserDto userDto = convertToUserDto(userOpt.get());
                    return ResponseEntity.ok(userDto);
                }
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to get user: " + ex.getMessage()));
        }
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> updates, @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Long userId = jwtUtil.extractUserId(token);
                
                Optional<User> userOpt = userRepository.findById(userId);
                if (!userOpt.isPresent()) {
                    return ResponseEntity.notFound().build();
                }
                
                User user = userOpt.get();
                
                // Validate email uniqueness if email is being updated
                if (updates.containsKey("email")) {
                    String newEmail = (String) updates.get("email");
                    if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                        return ResponseEntity.status(409).body(new MessageResponse("Email already exists. Please use a different email address."));
                    }
                    if (!isValidEmail(newEmail)) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Invalid email format"));
                    }
                    user.setEmail(newEmail);
                }
                
                if (updates.containsKey("name")) {
                    String name = (String) updates.get("name");
                    if (name == null || name.trim().isEmpty()) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Name is required"));
                    }
                    user.setName(name.trim());
                }
                
                if (updates.containsKey("phone")) {
                    String phone = (String) updates.get("phone");
                    user.setPhone(phone != null ? phone.trim() : "");
                }
                
                if (updates.containsKey("hourlyRate")) {
                    Object hourlyRateObj = updates.get("hourlyRate");
                    if (hourlyRateObj != null && !hourlyRateObj.toString().trim().isEmpty()) {
                        try {
                            BigDecimal hourlyRate = new BigDecimal(hourlyRateObj.toString());
                            if (hourlyRate.compareTo(BigDecimal.ZERO) < 0) {
                                return ResponseEntity.badRequest().body(new MessageResponse("Hourly rate cannot be negative"));
                            }
                            user.setHourlyRate(hourlyRate);
                        } catch (NumberFormatException e) {
                            return ResponseEntity.badRequest().body(new MessageResponse("Invalid hourly rate format"));
                        }
                    }
                }
                
                if (updates.containsKey("bio")) {
                    String bio = (String) updates.get("bio");
                    user.setBio(bio != null ? bio.trim() : "");
                }
                
                userRepository.save(user);
                return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
            }
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData, @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Long userId = jwtUtil.extractUserId(token);
                
                Optional<User> userOpt = userRepository.findById(userId);
                if (!userOpt.isPresent()) {
                    return ResponseEntity.notFound().build();
                }
                
                User user = userOpt.get();
                
                String currentPassword = passwordData.get("currentPassword");
                String newPassword = passwordData.get("newPassword");
                
                // Validate input
                if (currentPassword == null || currentPassword.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Current password is required"));
                }
                
                if (newPassword == null || newPassword.trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(new MessageResponse("New password is required"));
                }
                
                // Validate new password strength
                if (!isValidPassword(newPassword)) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Password must be 8+ chars with uppercase, lowercase, number & special character"));
                }
                
                // Check current password
                if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                    return ResponseEntity.status(400).body(new MessageResponse("Current password is incorrect"));
                }
                
                // Check if new password is same as current
                if (passwordEncoder.matches(newPassword, user.getPassword())) {
                    return ResponseEntity.badRequest().body(new MessageResponse("New password must be different from current password"));
                }
                
                // Encrypt and save new password
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                
                return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
            }
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to change password: " + e.getMessage()));
        }
    }

    private UserDto convertToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setUserType(user.getUserType().getValue());
        dto.setCategoryId(user.getCategoryId());
        dto.setCategoryName(user.getCategory() != null ? user.getCategory().getName() : null);
        dto.setHourlyRate(user.getHourlyRate());
        dto.setBio(user.getBio());
        dto.setIsAvailable(user.getIsAvailable());
        dto.setIsOnline(user.getIsOnline());
        dto.setIsApproved(user.getIsApproved());
        return dto;
    }

    private String getRoleName(UserType userType) {
        switch (userType) {
            case USER: return "User";
            case EXPERT: return "Expert";
            case ADMIN: return "Admin";
            default: return "User";
        }
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    
    private boolean isValidPassword(String password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
        return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    }

    // Helper classes for responses
    public static class ErrorResponse {
        private List<String> errors;

        public ErrorResponse(List<String> errors) {
            this.errors = errors;
        }

        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}