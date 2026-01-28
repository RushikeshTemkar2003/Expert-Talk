package com.experttalk.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.experttalk.entity.ExpertProfile;
import com.experttalk.service.AdminExpertService;

@RestController
@RequestMapping("/admin/experts")
public class AdminExpertController {

    private final AdminExpertService adminExpertService;

    public AdminExpertController(AdminExpertService adminExpertService) {
        this.adminExpertService = adminExpertService;
    }

    // ===================== PENDING EXPERTS =====================

    @GetMapping("/pending")
    public ResponseEntity<List<ExpertProfile>> getPendingExperts() {

        List<ExpertProfile> pendingExperts = adminExpertService.getPendingExperts();
        return ResponseEntity.ok(pendingExperts);
    }

    // ===================== APPROVE =====================

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long id) {

        adminExpertService.approveExpert(id);
        return ResponseEntity.ok().build();
    }

    // ===================== REJECT =====================

    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> reject(
            @PathVariable Long id,
            @RequestParam String reason) {

        adminExpertService.rejectExpert(id, reason);
        return ResponseEntity.ok().build();
    }

    // ===================== SUSPEND =====================

    @PutMapping("/{id}/suspend")
    public ResponseEntity<Void> suspend(@PathVariable Long id) {

        adminExpertService.suspendExpert(id);
        return ResponseEntity.ok().build();
    }

    // ===================== BLOCK =====================

    @PutMapping("/{id}/block")
    public ResponseEntity<Void> block(@PathVariable Long id) {

        adminExpertService.blockExpert(id);
        return ResponseEntity.ok().build();
    }
}
