using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpertTalkAPI.Data;

namespace ExpertTalkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.Icon,
                    ExpertCount = c.Experts.Count(e => e.UserType == Models.UserType.Expert && e.IsApproved)
                })
                .ToListAsync();
                
            return Ok(categories);
        }
        
        [HttpGet("{id}/experts")]
        public async Task<IActionResult> GetExpertsByCategory(int id)
        {
            
            var allUsersInCategory = await _context.Users
                .Include(u => u.Category)
                .Where(u => u.CategoryId == id)
                .ToListAsync();
            
            Console.WriteLine($"Debug: Found {allUsersInCategory.Count} total users in category {id}");
            foreach (var user in allUsersInCategory)
            {
                Console.WriteLine($"User: {user.Name}, Type: {user.UserType}, Approved: {user.IsApproved}, LoggedIn: {user.IsLoggedIn}");
            }
            
            var experts = await _context.Users
                .Include(u => u.Category)
                .Where(u => u.CategoryId == id && u.UserType == Models.UserType.Expert && u.IsApproved)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Bio,
                    u.HourlyRate,
                    IsAvailable = u.IsLoggedIn && u.IsAvailable,
                    CategoryName = u.Category.Name,
                    IsOnline = u.IsLoggedIn
                })
                .ToListAsync();
                
            Console.WriteLine($"Debug: Returning {experts.Count} approved experts");
            return Ok(experts);
        }
        
        [HttpPost("inquiry")]
        public async Task<IActionResult> SubmitInquiry([FromBody] InquiryData data)
        {
            try
            {
                var inquiry = new Models.Inquiry
                {
                    Name = data.Name,
                    Email = data.Email,
                    Phone = data.Phone ?? "",
                    Subject = data.Subject,
                    Message = data.Message,
                    Category = data.Category,
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
    }
    
    public class InquiryData
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string Subject { get; set; } = "";
        public string Message { get; set; } = "";
        public string Category { get; set; } = "";
    }
}