package com.experttalk.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.experttalk.entity.User;


@Repository
public interface UserRepository extends JpaRepository<User,Long> {
	
	
	// Used during registration to check duplicate email
    boolean existsByEmail(String email);
    
    // Used during login
    Optional<User>findByEmail(String email);

}
