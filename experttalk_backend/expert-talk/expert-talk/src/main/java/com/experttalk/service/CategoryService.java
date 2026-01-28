package com.experttalk.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.experttalk.dto.CategoryRequest;
import com.experttalk.entity.Category;
import com.experttalk.repository.CategoryRepository;

@Service
public class CategoryService {
	
	private final CategoryRepository categoryRepository;
	
	public CategoryService(CategoryRepository categoryRepository) {
		this.categoryRepository = categoryRepository;
	}
	
	
	//admin create category 
	
	public Category createCategory(CategoryRequest request) {
		if(categoryRepository.existsByName(request.getName())) {
			throw new RuntimeException("Category Already Exists");
			
			
		}
		
		Category category = new Category(request.getName(),request.getDescription());
		
		return categoryRepository.save(category);
	}
	
	// ADMIN – get all categories
	
	public List<Category> getAll(){
		return categoryRepository.findAll();
	}
	
	// PUBLIC – active categories
    public List<Category> getActiveCategories() {
        return categoryRepository.findByActiveTrue();
    }

    // ADMIN – update category
    public Category updateCategory(Long id, CategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    // ADMIN – enable / disable
    public void setCategoryStatus(Long id, boolean active) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setActive(active);
        categoryRepository.save(category);
    }

    // ADMIN – soft delete
    public void deleteCategory(Long id) {
        setCategoryStatus(id, false);
    }

}
