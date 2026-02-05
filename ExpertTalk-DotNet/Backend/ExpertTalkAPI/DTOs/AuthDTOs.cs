using System.ComponentModel.DataAnnotations;

namespace ExpertTalkAPI.DTOs
{
    public class RegisterDto
    {
        [Required]
        public required string Name { get; set; }
        
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        [MinLength(6)]
        public required string Password { get; set; }
        
        public string? Phone { get; set; }
        
        [Required]
        public int UserType { get; set; }
        
        // Expert specific fields
        public int? CategoryId { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Bio { get; set; }
    }
    
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        public required string Password { get; set; }
    }
    
    public class UserDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public string? Phone { get; set; }
        public int UserType { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Bio { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsLoggedIn { get; set; }
    }
    
    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public required UserDto User { get; set; }
    }
    
    public class LogoutDto
    {
        [Required]
        public int UserId { get; set; }
    }
}