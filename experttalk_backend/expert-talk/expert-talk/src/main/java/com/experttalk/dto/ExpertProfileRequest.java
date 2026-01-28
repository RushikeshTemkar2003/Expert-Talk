package com.experttalk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ExpertProfileRequest {

    @NotNull
    private Long categoryId;

    @Positive
    private int experienceYears;

    @NotBlank
    private String skills;

    @NotBlank
    private String languages;

    @NotBlank
    private String bio;

    @Positive
    private double ratePerMinute;

    public Long getCategoryId() {
        return categoryId;
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public String getSkills() {
        return skills;
    }

    public String getLanguages() {
        return languages;
    }

    public String getBio() {
        return bio;
    }

    public double getRatePerMinute() {
        return ratePerMinute;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setRatePerMinute(double ratePerMinute) {
        this.ratePerMinute = ratePerMinute;
    }
}
