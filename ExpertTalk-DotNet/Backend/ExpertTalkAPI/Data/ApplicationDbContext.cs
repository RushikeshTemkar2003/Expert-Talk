using Microsoft.EntityFrameworkCore;
using ExpertTalkAPI.Models;

namespace ExpertTalkAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ChatSession> ChatSessions { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Inquiry> Inquiries { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Category)
                .WithMany(c => c.Experts)
                .HasForeignKey(u => u.CategoryId);
                
            // ChatSession relationships
            modelBuilder.Entity<ChatSession>()
                .HasOne(cs => cs.User)
                .WithMany(u => u.UserSessions)
                .HasForeignKey(cs => cs.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<ChatSession>()
                .HasOne(cs => cs.Expert)
                .WithMany(u => u.ExpertSessions)
                .HasForeignKey(cs => cs.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Message relationships
            modelBuilder.Entity<Message>()
                .HasOne(m => m.ChatSession)
                .WithMany(cs => cs.Messages)
                .HasForeignKey(m => m.ChatSessionId);
                
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Payment relationships
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId);
                
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.ChatSession)
                .WithOne(cs => cs.Payment)
                .HasForeignKey<Payment>(p => p.ChatSessionId);
                
            // Seed data
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Finance", Description = "Financial advice and planning", Icon = "💰" },
                new Category { Id = 2, Name = "Healthcare", Description = "Medical consultation and health advice", Icon = "🏥" },
                new Category { Id = 3, Name = "Technology", Description = "Tech support and IT consultation", Icon = "💻" },
                new Category { Id = 4, Name = "Education", Description = "Academic guidance and tutoring", Icon = "📚" },
                new Category { Id = 5, Name = "Legal", Description = "Legal advice and consultation", Icon = "⚖️" },
                new Category { Id = 6, Name = "Counselling", Description = "Mental health and life coaching", Icon = "🧠" }
            );
        }
    }
}