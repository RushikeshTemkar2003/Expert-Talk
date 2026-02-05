using System.ComponentModel.DataAnnotations;

namespace ExpertTalkAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public required string Name { get; set; }
        
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        public required string Password { get; set; }
        
        public required string Phone { get; set; }
        
        [Required]
        public UserType UserType { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Expert specific properties
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        public decimal? HourlyRate { get; set; }
        public required string Bio { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsLoggedIn { get; set; } = false;
        public bool IsApproved { get; set; } = false;
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovalNotes { get; set; }
        public decimal TotalEarnings { get; set; } = 0;
        
        // Navigation properties
        public ICollection<ChatSession> ExpertSessions { get; set; } = new List<ChatSession>();
        public ICollection<ChatSession> UserSessions { get; set; } = new List<ChatSession>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
    
    public enum UserType
    {
        User = 1,
        Expert = 2,
        Admin = 3
    }
}