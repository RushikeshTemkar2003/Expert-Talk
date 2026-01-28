package com.experttalk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.experttalk.entity.ExpertProfile;

@Repository
public interface ExpertProfileRepository extends JpaRepository<ExpertProfile, Long> {

    List<ExpertProfile> findByVerifiedFalse();

    List<ExpertProfile> findByVerifiedTrueAndActiveTrue();
    
    Optional<ExpertProfile> findByUserId(Long userId);

}
