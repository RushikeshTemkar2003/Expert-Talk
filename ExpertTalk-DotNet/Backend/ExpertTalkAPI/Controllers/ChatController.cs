using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using ExpertTalkAPI.Data;
using ExpertTalkAPI.Models;
using ExpertTalkAPI.Hubs;
using System.Security.Claims;

namespace ExpertTalkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;
        
        public ChatController(ApplicationDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }
        
        [HttpPost("start")]
        public async Task<IActionResult> StartChatSession([FromBody] StartChatDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var expert = await _context.Users.FindAsync(dto.ExpertId);
            if (expert == null || expert.UserType != UserType.Expert || !expert.IsAvailable)
            {
                return BadRequest("Expert not available");
            }
            
            var session = new ChatSession
            {
                UserId = userId,
                ExpertId = dto.ExpertId,
                StartTime = DateTime.UtcNow,
                Status = SessionStatus.Active
            };
            
            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
            
            return Ok(new { SessionId = session.Id });
        }
        
        [HttpGet("sessions")]
        public async Task<IActionResult> GetUserSessions()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var sessions = await _context.ChatSessions
                .Where(s => s.UserId == userId || s.ExpertId == userId)
                .Include(s => s.User)
                .Include(s => s.Expert)
                .Include(s => s.Messages)
                .Select(s => new
                {
                    s.Id,
                    s.StartTime,
                    s.EndTime,
                    s.Status,
                    s.TotalAmount,
                    UserName = s.User.Name,
                    ExpertName = s.Expert.Name,
                    LastMessage = s.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault()!.Content ?? "",
                    UnreadCount = s.Messages.Count(m => !m.IsRead && m.SenderId != userId)
                })
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();
                
            return Ok(sessions);
        }
        
        [HttpGet("expert-earnings")]
        public async Task<IActionResult> GetExpertEarnings()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var expert = await _context.Users.FindAsync(userId);
            if (expert == null || expert.UserType != UserType.Expert)
            {
                return BadRequest("Not an expert");
            }
            
            return Ok(new { TotalEarnings = expert.TotalEarnings });
        }
        
        [HttpGet("sessions/{sessionId}/info")]
        public async Task<IActionResult> GetSessionInfo(int sessionId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var session = await _context.ChatSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && (s.UserId == userId || s.ExpertId == userId));
                
            if (session == null)
            {
                return NotFound();
            }
            
            var elapsedMinutes = (DateTime.UtcNow - session.StartTime).TotalMinutes;
            var remainingMinutes = Math.Max(0, session.PaidDurationMinutes - elapsedMinutes);
            
            return Ok(new 
            {
                session.Id,
                session.StartTime,
                session.PaidDurationMinutes,
                ElapsedMinutes = (int)elapsedMinutes,
                RemainingMinutes = (int)remainingMinutes,
                RemainingSeconds = (int)(remainingMinutes * 60),
                session.Status,
                IsExpired = remainingMinutes <= 0
            });
        }
        
        [HttpGet("sessions/{sessionId}/messages")]
        public async Task<IActionResult> GetSessionMessages(int sessionId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var session = await _context.ChatSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && (s.UserId == userId || s.ExpertId == userId));
                
            if (session == null)
            {
                return NotFound();
            }
            
            var messages = await _context.Messages
                .Where(m => m.ChatSessionId == sessionId)
                .Include(m => m.Sender)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.SentAt,
                    m.IsRead,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.Name
                })
                .OrderBy(m => m.SentAt)
                .ToListAsync();
                
          
            await _context.Messages
                .Where(m => m.ChatSessionId == sessionId && m.SenderId != userId && !m.IsRead)
                .ExecuteUpdateAsync(m => m.SetProperty(x => x.IsRead, true));
                
            return Ok(messages);
        }
        
        [HttpPost("sessions/{sessionId}/end")]
        public async Task<IActionResult> EndChatSession(int sessionId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var session = await _context.ChatSessions
                .Include(s => s.Expert)
                .Include(s => s.Payment)
                .FirstOrDefaultAsync(s => s.Id == sessionId && (s.UserId == userId || s.ExpertId == userId));
                
            if (session == null)
            {
                return NotFound();
            }
            
            session.EndTime = DateTime.UtcNow;
            session.Status = SessionStatus.Completed;
            
            // Calculate actual duration used
            var elapsedMinutes = (DateTime.UtcNow - session.StartTime).TotalMinutes;
            session.DurationMinutes = (int)Math.Ceiling(elapsedMinutes);
            
            // Use the paid amount from payment, not calculated amount
            if (session.Payment != null)
            {
                session.TotalAmount = session.Payment.Amount;
                
                // Add earnings to expert
                var expert = await _context.Users.FindAsync(session.ExpertId);
                if (expert != null)
                {
                    expert.TotalEarnings += session.Payment.Amount;
                }
            }
            
            await _context.SaveChangesAsync();
            
            // Notify all participants that session ended
            await _hubContext.Clients.Group($"ChatSession_{sessionId}").SendAsync("SessionEnded", sessionId);
            
            return Ok(new { TotalAmount = session.TotalAmount, Duration = session.DurationMinutes });
        }
    }
    
    public class StartChatDto
    {
        public int ExpertId { get; set; }
    }
}