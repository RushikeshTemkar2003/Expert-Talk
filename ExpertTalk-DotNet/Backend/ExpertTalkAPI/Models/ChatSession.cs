using System.ComponentModel.DataAnnotations;

namespace ExpertTalkAPI.Models
{
    public class ChatSession
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }
        
        [Required]
        public int ExpertId { get; set; }
        public User? Expert { get; set; }
        
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }
        public int PaidDurationMinutes { get; set; } = 15; // Default 15 minutes
        
        public SessionStatus Status { get; set; } = SessionStatus.Active;
        
        public decimal TotalAmount { get; set; }
        public int DurationMinutes { get; set; }
        
        // Navigation properties
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public Payment? Payment { get; set; }
    }
    
    public enum SessionStatus
    {
        Active = 1,
        Completed = 2,
        Cancelled = 3
    }
}