using ExpertTalkAPI.Data;
using ExpertTalkAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpertTalkAPI.Services
{
    public static class DataSeedService
    {
        public static async Task SeedDemoAccounts(ApplicationDbContext context)
        {
            // Always update existing demo accounts with new passwords
            var existingUsers = await context.Users.Where(u => u.Email.Contains("experttalk")).ToListAsync();
            
            if (existingUsers.Any())
            {
                // Update existing accounts with new strong passwords
                foreach (var user in existingUsers)
                {
                    switch (user.Email)
                    {
                        case "admin@experttalk.com":
                            user.Password = BCrypt.Net.BCrypt.HashPassword("Admin@123");
                            break;
                        case "rahul.sharma@experttalk.com":
                            user.Password = BCrypt.Net.BCrypt.HashPassword("User@123");
                            break;
                        case "arjun.gupta@experttalk.com":
                        case "kavya.reddy@experttalk.com":
                        case "vikram.singh@experttalk.com":
                        case "meera.joshi@experttalk.com":
                        case "rajesh.kumar@experttalk.com":
                        case "anjali.nair@experttalk.com":
                            user.Password = BCrypt.Net.BCrypt.HashPassword("Expert@123");
                            break;
                    }
                }
                await context.SaveChangesAsync();
                return;
            }

            var initialUsers = new List<User>
            {
                // Regular User Account
                new User
                {
                    Name = "Rahul Sharma",
                    Email = "rahul.sharma@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("User@123"),
                    Phone = "+91 9876543210",
                    UserType = UserType.User,
                    Bio = "Regular platform user from Mumbai"
                },

                // Admin Account
                new User
                {
                    Name = "Priya Patel",
                    Email = "admin@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Phone = "+91 9876543211",
                    UserType = UserType.Admin,
                    Bio = "Platform administrator from Delhi"
                },

                // Expert Accounts for each category
                new User
                {
                    Name = "Dr. Arjun Gupta",
                    Email = "arjun.gupta@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Expert@123"),
                    Phone = "+91 9876543212",
                    UserType = UserType.Expert,
                    CategoryId = 1, // Finance
                    HourlyRate = 2500.00m,
                    Bio = "Certified Financial Planner with 12+ years experience. MBA from IIM Ahmedabad. Specializes in mutual funds, tax planning, and retirement planning.",
                    IsAvailable = true,
                    IsApproved = true,
                    ApprovedAt = DateTime.UtcNow
                },

                new User
                {
                    Name = "Dr. Kavya Reddy",
                    Email = "kavya.reddy@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Expert@123"),
                    Phone = "+91 9876543213",
                    UserType = UserType.Expert,
                    CategoryId = 2, // Healthcare
                    HourlyRate = 3000.00m,
                    Bio = "MBBS, MD Internal Medicine from AIIMS Delhi. 15+ years experience in preventive healthcare and lifestyle diseases management.",
                    IsAvailable = true,
                    IsApproved = true,
                    ApprovedAt = DateTime.UtcNow
                },

                new User
                {
                    Name = "Vikram Singh",
                    Email = "vikram.singh@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Expert@123"),
                    Phone = "+91 9876543214",
                    UserType = UserType.Expert,
                    CategoryId = 3, // Technology
                    HourlyRate = 2000.00m,
                    Bio = "Senior Software Architect at top MNC. B.Tech from IIT Bombay. Expert in cloud computing, AI/ML, and full-stack development.",
                    IsAvailable = true,
                    IsApproved = true,
                    ApprovedAt = DateTime.UtcNow
                },

                new User
                {
                    Name = "Prof. Meera Joshi",
                    Email = "meera.joshi@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Expert@123"),
                    Phone = "+91 9876543215",
                    UserType = UserType.Expert,
                    CategoryId = 4, // Education
                    HourlyRate = 1500.00m,
                    Bio = "PhD in Education from JNU. 20+ years teaching experience. Specializes in career counseling and competitive exam preparation.",
                    IsAvailable = true,
                    IsApproved = true,
                    ApprovedAt = DateTime.UtcNow
                },

                new User
                {
                    Name = "Adv. Rajesh Kumar",
                    Email = "rajesh.kumar@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Expert@123"),
                    Phone = "+91 9876543216",
                    UserType = UserType.Expert,
                    CategoryId = 5, // Legal
                    HourlyRate = 4000.00m,
                    Bio = "Senior Advocate at Delhi High Court. LLM from National Law School. 18+ years experience in corporate law and civil litigation.",
                    IsAvailable = true,
                    IsApproved = true,
                    ApprovedAt = DateTime.UtcNow
                },

                new User
                {
                    Name = "Dr. Anjali Nair",
                    Email = "anjali.nair@experttalk.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Expert@123"),
                    Phone = "+91 9876543217",
                    UserType = UserType.Expert,
                    CategoryId = 6, // Counselling
                    HourlyRate = 1800.00m,
                    Bio = "Clinical Psychologist with M.Phil from NIMHANS Bangalore. 10+ years experience in cognitive behavioral therapy and relationship counseling.",
                    IsAvailable = true,
                    IsApproved = true,
                    ApprovedAt = DateTime.UtcNow
                }
            };

            context.Users.AddRange(initialUsers);
            await context.SaveChangesAsync();
        }
    }
}