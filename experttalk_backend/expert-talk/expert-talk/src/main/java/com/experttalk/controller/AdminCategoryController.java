package com.experttalk.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.experttalk.dto.CategoryRequest;
import com.experttalk.entity.Category;
import com.experttalk.service.CategoryService;



@RestController
@RequestMapping("/admin/categories")
public class AdminCategoryController {
	
	
	private final CategoryService categoryService;
	
	public AdminCategoryController(CategoryService categoryService) {
		
		this.categoryService = categoryService;
	}
	
	//create category by admin
	@PostMapping("/create")
	public ResponseEntity<Category> create(@Validated @RequestBody CategoryRequest request){
		
		Category created = categoryService.createCategory(request);
		
		return ResponseEntity.ok(created);
		
	}
	
	//get all cetegory 
	@GetMapping("/allCategories")
	public ResponseEntity<List<Category>> getAllCategories(){
		
		List<Category> all = categoryService.getAll();
		
		return ResponseEntity.ok(all);
	}
	

    // ===================== UPDATE =====================

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(
            @PathVariable Long id,
            @Validated @RequestBody CategoryRequest request) {

        Category updatedCategory = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(updatedCategory);
    }

    // ===================== ENABLE =====================

    @PutMapping("/{id}/enable")
    public ResponseEntity<Void> enable(@PathVariable Long id) {

        categoryService.setCategoryStatus(id, true);
        return ResponseEntity.ok().build();
    }

    // ===================== DISABLE =====================

    @PutMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {

        categoryService.setCategoryStatus(id, false);
        return ResponseEntity.ok().build();
    }

    // ===================== DELETE =====================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
	
	

}





