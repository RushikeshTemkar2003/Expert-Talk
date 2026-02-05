using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ExpertTalkAPI.Data;
using ExpertTalkAPI.Models;
using BCrypt.Net;

namespace ExpertTalkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet("pending-experts")]
        public async Task<IActionResult> GetPendingExperts()
        {
            var pendingExperts = await _context.Users
                .Where(u => u.UserType == UserType.Expert && !u.IsApproved)
                .Include(u => u.Category)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Phone,
                    u.Bio,
                    u.HourlyRate,
                    CategoryName = u.Category.Name,
                    u.CreatedAt
                })
                .ToListAsync();
                
            return Ok(pendingExperts);
        }
        
        [HttpPost("approve-expert/{expertId}")]
        public async Task<IActionResult> ApproveExpert(int expertId, [FromBody] string notes = "")
        {
            var expert = await _context.Users.FindAsync(expertId);
            if (expert == null || expert.UserType != UserType.Expert)
            {
                return NotFound("Expert not found");
            }
            
            expert.IsApproved = true;
            expert.ApprovedAt = DateTime.UtcNow;
            expert.ApprovalNotes = notes;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Expert approved successfully" });
        }
        
        [HttpPost("reject-expert/{expertId}")]
        public async Task<IActionResult> RejectExpert(int expertId, [FromBody] string notes = "")
        {
            var expert = await _context.Users.FindAsync(expertId);
            if (expert == null || expert.UserType != UserType.Expert)
            {
                return NotFound("Expert not found");
            }
            
            expert.ApprovalNotes = notes;
           
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Expert rejected" });
        }
        
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalRevenue = await _context.ChatSessions
                .Where(s => s.Status == SessionStatus.Completed)
                .SumAsync(s => s.TotalAmount);
                
            var stats = new
            {
                TotalUsers = await _context.Users.CountAsync(u => u.UserType == UserType.User),
                TotalExperts = await _context.Users.CountAsync(u => u.UserType == UserType.Expert && u.IsApproved),
                PendingExperts = await _context.Users.CountAsync(u => u.UserType == UserType.Expert && !u.IsApproved),
                TotalSessions = await _context.ChatSessions.CountAsync(),
                ActiveSessions = await _context.ChatSessions.CountAsync(s => s.Status == SessionStatus.Active),
                CompletedSessions = await _context.ChatSessions.CountAsync(s => s.Status == SessionStatus.Completed),
                TotalRevenue = totalRevenue,
                TotalCategories = await _context.Categories.CountAsync()
            };
            
            return Ok(stats);
        }
        
        // User Management
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Category)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Phone,
                    UserType = u.UserType.ToString(),
                    CategoryName = u.Category != null ? u.Category.Name : null,
                    u.HourlyRate,
                    u.IsAvailable,
                    u.IsApproved,
                    u.CreatedAt
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
                
            return Ok(users);
        }
        
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email already exists");
            }
            
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Phone = request.Phone ?? "",
                UserType = (UserType)request.UserType,
                CategoryId = request.CategoryId,
                HourlyRate = request.HourlyRate,
                Bio = request.Bio ?? "",
                IsApproved = request.UserType == 2 ? request.IsApproved : true
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User created successfully", userId = user.Id });
        }
        
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }
            
            user.Name = request.Name;
            user.Phone = request.Phone ?? "";
            user.CategoryId = request.CategoryId;
            user.HourlyRate = request.HourlyRate;
            user.Bio = request.Bio ?? "";
            user.IsAvailable = request.IsAvailable;
            user.IsApproved = request.IsApproved;
            
            if (!string.IsNullOrEmpty(request.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User updated successfully" });
        }
        
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }
            
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User deleted successfully" });
        }
        
        // Category Management
        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.Icon,
                    ExpertCount = c.Experts.Count(e => e.IsApproved)
                })
                .ToListAsync();
                
            return Ok(categories);
        }
        
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            var category = new Category
            {
                Name = request.Name,
                Description = request.Description,
                Icon = request.Icon
            };
            
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Category created successfully", categoryId = category.Id });
        }
        
        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound("Category not found");
            }
            
            category.Name = request.Name;
            category.Description = request.Description;
            category.Icon = request.Icon;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Category updated successfully" });
        }
        
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound("Category not found");
            }
            
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Category deleted successfully" });
        }
        
        // Session Monitoring
        [HttpGet("sessions")]
        public async Task<IActionResult> GetAllSessions()
        {
            var sessions = await _context.ChatSessions
                .Include(s => s.User)
                .Include(s => s.Expert)
                .Select(s => new
                {
                    s.Id,
                    UserName = s.User.Name,
                    ExpertName = s.Expert.Name,
                    ExpertEarnings = s.Expert.TotalEarnings,
                    s.StartTime,
                    s.EndTime,
                    s.Status,
                    s.DurationMinutes,
                    s.TotalAmount,
                    MessageCount = s.Messages.Count()
                })
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();
                
            return Ok(sessions);
        }
        
        [HttpPost("inquiry/submit")]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitInquiry([FromBody] InquiryRequest request)
        {
            try
            {
                var inquiry = new Inquiry
                {
                    Name = request.Name,
                    Email = request.Email,
                    Phone = request.Phone,
                    Subject = request.Subject,
                    Message = request.Message,
                    Category = request.Category,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                
                _context.Inquiries.Add(inquiry);
                await _context.SaveChangesAsync();
                
                return Ok(new { success = true, message = "Inquiry submitted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        
        [HttpGet("inquiries")]
        public async Task<IActionResult> GetAllInquiries()
        {
            try
            {
                var inquiries = await _context.Inquiries
                    .OrderByDescending(i => i.CreatedAt)
                    .Select(i => new
                    {
                        i.Id,
                        i.Name,
                        i.Email,
                        i.Phone,
                        i.Subject,
                        i.Message,
                        i.Category,
                        i.CreatedAt,
                        i.IsRead
                    })
                    .ToListAsync();
                    
                return Ok(inquiries);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        
        [HttpPut("inquiry/mark-read/{id}")]
        public async Task<IActionResult> MarkInquiryAsRead(int id)
        {
            try
            {
                var inquiry = await _context.Inquiries.FindAsync(id);
                if (inquiry == null)
                {
                    return NotFound("Inquiry not found");
                }
                
                inquiry.IsRead = true;
                await _context.SaveChangesAsync();
                
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
    
    public class InquiryRequest
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Subject { get; set; } = "";
        public string Message { get; set; } = "";
        public string Category { get; set; } = "";
    }
    
    public class CreateUserRequest
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string? Phone { get; set; }
        public int UserType { get; set; }
        public int? CategoryId { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Bio { get; set; }
        public bool IsApproved { get; set; } = true;
    }
    
    public class UpdateUserRequest
    {
        public string Name { get; set; } = "";
        public string? Phone { get; set; }
        public string? Password { get; set; }
        public int? CategoryId { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Bio { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsApproved { get; set; }
    }
    
    public class CreateCategoryRequest
    {
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Icon { get; set; } = "";
    }
    
    public class UpdateCategoryRequest
    {
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Icon { get; set; } = "";
    }
}