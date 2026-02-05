package com.experttalk.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class AuthDTOs {

    public static class RegisterDto {
        @NotBlank(message = "Name is required")
        private String name;

        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String phone;

        @NotNull(message = "User type is required")
        private Integer userType;

        private Long categoryId;
        private BigDecimal hourlyRate;
        private String bio;

        // Constructors
        public RegisterDto() {}

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public Integer getUserType() { return userType; }
        public void setUserType(Integer userType) { this.userType = userType; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public BigDecimal getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
    }

    public static class LoginDto {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        // Constructors
        public LoginDto() {}

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private Integer userType;
        private Long categoryId;
        private String categoryName;
        private BigDecimal hourlyRate;
        private String bio;
        private Boolean isAvailable;
        private Boolean isOnline;
        private Boolean isApproved;

        // Constructors
        public UserDto() {}

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public Integer getUserType() { return userType; }
        public void setUserType(Integer userType) { this.userType = userType; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public BigDecimal getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }

        public Boolean getIsAvailable() { return isAvailable; }
        public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

        public Boolean getIsOnline() { return isOnline; }
        public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }

        public Boolean getIsApproved() { return isApproved; }
        public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
    }

    public static class AuthResponseDto {
        private String token;
        private UserDto user;

        // Constructors
        public AuthResponseDto() {}

        public AuthResponseDto(String token, UserDto user) {
            this.token = token;
            this.user = user;
        }

        // Getters and Setters
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }

    public static class RegisterResponseDto {
        private Boolean success;
        private String message;
        private Boolean requiresApproval;

        // Constructors
        public RegisterResponseDto() {}

        public RegisterResponseDto(Boolean success, String message, Boolean requiresApproval) {
            this.success = success;
            this.message = message;
            this.requiresApproval = requiresApproval;
        }

        // Getters and Setters
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Boolean getRequiresApproval() { return requiresApproval; }
        public void setRequiresApproval(Boolean requiresApproval) { this.requiresApproval = requiresApproval; }
    }
}