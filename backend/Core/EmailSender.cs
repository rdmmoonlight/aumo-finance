using AumoBackend.Controllers.Reports;
using AumoBackend.Models;
using AumoBackend.Helpers;
using System.Threading.Tasks;

namespace AumoBackend.Core
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }

    public class ResendEmailSender : IEmailSender
    {
        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            return Task.CompletedTask;
        }
    }
}
