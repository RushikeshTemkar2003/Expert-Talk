using System.ComponentModel.DataAnnotations;

namespace ExpertTalkAPI.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        public required string Name { get; set; }
        
        public required string Description { get; set; }
        
        public required string Icon { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<User> Experts { get; set; } = new List<User>();
    }
}