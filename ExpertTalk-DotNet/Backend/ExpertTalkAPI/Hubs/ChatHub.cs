using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using ExpertTalkAPI.Data;
using ExpertTalkAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ExpertTalkAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        
        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task JoinChatSession(int sessionId)
        {
            var userId = int.Parse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var session = await _context.ChatSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && (s.UserId == userId || s.ExpertId == userId));
                
            if (session != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"ChatSession_{sessionId}");
            }
        }
        
        public async Task SendMessage(int sessionId, string message)
        {
            var userId = int.Parse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var session = await _context.ChatSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && (s.UserId == userId || s.ExpertId == userId));
                
            if (session != null && session.Status == SessionStatus.Active)
            {
                // Get sender info
                var sender = await _context.Users.FindAsync(userId);
                
                var newMessage = new Message
                {
                    ChatSessionId = sessionId,
                    SenderId = userId,
                    Content = message,
                    SentAt = DateTime.UtcNow
                };
                
                _context.Messages.Add(newMessage);
                await _context.SaveChangesAsync();
                
                await Clients.Group($"ChatSession_{sessionId}").SendAsync("ReceiveMessage", new
                {
                    Id = newMessage.Id,
                    SenderId = userId,
                    SenderName = sender?.Name ?? "Unknown",
                    Content = message,
                    SentAt = newMessage.SentAt
                });
            }
        }
        
        public async Task LeaveChatSession(int sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ChatSession_{sessionId}");
        }
        
        public async Task NotifySessionEnded(int sessionId)
        {
            await Clients.Group($"ChatSession_{sessionId}").SendAsync("SessionEnded", sessionId);
        }
    }
}