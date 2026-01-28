package com.experttalk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.experttalk.entity.Category;

public interface CategoryRepository extends JpaRepository<Category,Long> {
	
	boolean existsByName(String name);
	
	List<Category> findByActiveTrue();
	
	Optional <Category> findByIdAndActiveTrue(Long Id);
	

}
