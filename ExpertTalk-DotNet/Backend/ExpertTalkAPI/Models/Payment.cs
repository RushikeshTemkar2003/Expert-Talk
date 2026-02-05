using System.ComponentModel.DataAnnotations;

namespace ExpertTalkAPI.Models
{
    public class Payment
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int? ChatSessionId { get; set; }
        public ChatSession? ChatSession { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        public required string RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
        
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
    
    public enum PaymentStatus
    {
        Pending = 1,
        Completed = 2,
        Failed = 3,
        Refunded = 4
    }
}