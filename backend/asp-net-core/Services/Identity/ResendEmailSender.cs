// <copyright file="ResendEmailSender.cs" company="PlaceholderCompany">
// Copyright (c) PlaceholderCompany. All rights reserved.
// </copyright>

namespace AumoBackend.Services.Identity
{
    /// <summary>
    /// Mewakili I Email Sender.
    /// </summary>
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }

    /// <summary>
    /// Mewakili Resend Email Sender.
    /// </summary>
    public class ResendEmailSender : IEmailSender
    {
        /// <summary>
        /// Mewakili Send Email Async.
        /// </summary>
        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            return Task.CompletedTask;
        }
    }
}
