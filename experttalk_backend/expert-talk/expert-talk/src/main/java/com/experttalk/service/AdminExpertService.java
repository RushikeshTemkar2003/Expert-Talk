package com.experttalk.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.experttalk.entity.ExpertProfile;
import com.experttalk.repository.ExpertProfileRepository;

@Service
public class AdminExpertService {

    private final ExpertProfileRepository expertProfileRepository;

    public AdminExpertService(ExpertProfileRepository expertProfileRepository) {
        this.expertProfileRepository = expertProfileRepository;
    }

    // ===================== PENDING EXPERTS =====================

    public List<ExpertProfile> getPendingExperts() {
        return expertProfileRepository.findByVerifiedFalse();
    }

    // ===================== APPROVE =====================

    public void approveExpert(Long expertProfileId) {

        ExpertProfile profile = expertProfileRepository.findById(expertProfileId)
                .orElseThrow(() -> new RuntimeException("Expert profile not found"));

        profile.setVerified(true);
        profile.setRejectionReason(null);

        expertProfileRepository.save(profile);
    }

    // ===================== REJECT =====================

    public void rejectExpert(Long expertProfileId, String reason) {

        ExpertProfile profile = expertProfileRepository.findById(expertProfileId)
                .orElseThrow(() -> new RuntimeException("Expert profile not found"));

        profile.setVerified(false);
        profile.setActive(false);
        profile.setRejectionReason(reason);

        expertProfileRepository.save(profile);
    }

    // ===================== SUSPEND =====================

    public void suspendExpert(Long expertProfileId) {

        ExpertProfile profile = expertProfileRepository.findById(expertProfileId)
                .orElseThrow(() -> new RuntimeException("Expert profile not found"));

        profile.setActive(false);
        expertProfileRepository.save(profile);
    }

    // ===================== BLOCK =====================

    public void blockExpert(Long expertProfileId) {

        ExpertProfile profile = expertProfileRepository.findById(expertProfileId)
                .orElseThrow(() -> new RuntimeException("Expert profile not found"));

        profile.setActive(false);
        profile.setVerified(false);

        expertProfileRepository.save(profile);
    }
}
