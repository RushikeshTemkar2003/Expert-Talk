package com.experttalk.repository;

import com.experttalk.model.User;
import com.experttalk.model.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Long countByUserType(UserType userType);
    Long countByUserTypeAndIsApproved(UserType userType, Boolean isApproved);
    Long countByCategoryIdAndUserType(Long categoryId, UserType userType);
    List<User> findAllByOrderByIdDesc();
    
    List<User> findByUserTypeAndIsApproved(UserType userType, Boolean isApproved);
    
    @Query("SELECT u FROM User u WHERE u.userType = :userType AND u.categoryId = :categoryId AND u.isApproved = true AND u.isAvailable = true")
    List<User> findAvailableExpertsByCategory(@Param("userType") UserType userType, @Param("categoryId") Long categoryId);
    
    @Query("SELECT u FROM User u WHERE u.userType = :userType AND u.isApproved = true AND u.isAvailable = true")
    List<User> findAllAvailableExperts(@Param("userType") UserType userType);
}