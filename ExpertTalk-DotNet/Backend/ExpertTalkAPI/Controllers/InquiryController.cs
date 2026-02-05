using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpertTalkAPI.Data;
using ExpertTalkAPI.Models;

namespace ExpertTalkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InquiryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public InquiryController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitInquiry([FromBody] InquiryData request)
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
        
        [HttpGet("all")]
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
        
        [HttpPut("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
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
}