using System.ComponentModel.DataAnnotations;

namespace ExpertTalkAPI.Models
{
    public class Message
    {
        public int Id { get; set; }
        
        [Required]
        public int ChatSessionId { get; set; }
        public ChatSession? ChatSession { get; set; }
        
        [Required]
        public int SenderId { get; set; }
        public User? Sender { get; set; }
        
        [Required]
        public required string Content { get; set; }
        
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
    }
}