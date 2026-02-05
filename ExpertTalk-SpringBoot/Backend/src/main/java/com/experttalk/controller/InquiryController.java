package com.experttalk.controller;

import com.experttalk.model.Inquiry;
import com.experttalk.repository.InquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inquiry")
@CrossOrigin(origins = "http://localhost:3000")
public class InquiryController {

    @Autowired
    private InquiryRepository inquiryRepository;

    @PostMapping("/submit")
    public ResponseEntity<Inquiry> submitInquiry(@RequestBody Inquiry inquiry) {
        try {
            System.out.println("[DEBUG] Received inquiry: " + inquiry.getName() + ", " + inquiry.getEmail());
            Inquiry savedInquiry = inquiryRepository.save(inquiry);
            System.out.println("[DEBUG] Saved inquiry with ID: " + savedInquiry.getId());
            return ResponseEntity.ok(savedInquiry);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to save inquiry: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}