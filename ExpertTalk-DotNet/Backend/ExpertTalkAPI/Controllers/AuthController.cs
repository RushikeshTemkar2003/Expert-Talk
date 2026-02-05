using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpertTalkAPI.Data;
using ExpertTalkAPI.Models;
using ExpertTalkAPI.DTOs;
using ExpertTalkAPI.Services;
using BCrypt.Net;

namespace ExpertTalkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;
        
        public AuthController(ApplicationDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest("Email already exists");
            }
            
            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                UserType = (UserType)dto.UserType,
                CategoryId = dto.CategoryId,
                HourlyRate = dto.HourlyRate,
                Bio = dto.Bio ?? "",
                IsApproved = dto.UserType == 2 
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            var token = _jwtService.GenerateToken(user);
            var userDto = await GetUserDto(user);
            
            return Ok(new AuthResponseDto { Token = token, User = userDto });
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Category)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);
                
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            {
                return BadRequest("Invalid credentials");
            }
            
            // Set user as logged in
            user.IsLoggedIn = true;
            await _context.SaveChangesAsync();
            
            var token = _jwtService.GenerateToken(user);
            var userDto = await GetUserDto(user);
            
            return Ok(new AuthResponseDto { Token = token, User = userDto });
        }
        
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user != null)
            {
                user.IsLoggedIn = false;
                await _context.SaveChangesAsync();
            }
            
            return Ok(new { message = "Logged out successfully" });
        }
        
        private async Task<UserDto> GetUserDto(User user)
        {
            if (user.Category == null && user.CategoryId.HasValue)
            {
                user.Category = await _context.Categories.FindAsync(user.CategoryId.Value);
            }
            
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                UserType = (int)user.UserType,
                CategoryId = user.CategoryId,
                CategoryName = user.Category?.Name,
                HourlyRate = user.HourlyRate,
                Bio = user.Bio,
                IsAvailable = user.IsAvailable,
                IsLoggedIn = user.IsLoggedIn
            };
        }
    }
}