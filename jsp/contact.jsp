<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us — Grievance System</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📞</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="http://localhost:3000/css/style.css">
  <style>
    :root {
      --bg-dark: #0b0f19;
      --bg-card: rgba(17, 25, 40, 0.75);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #7c3aed;
      --primary-hover: #6d28d9;
    }
    
    body {
      background-color: var(--bg-dark);
      font-family: 'Inter', sans-serif;
      color: var(--text-main);
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
      box-sizing: border-box;
    }

    .glass-card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 650px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 580px) {
      .contact-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .contact-info-block {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .contact-info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .contact-info-item:last-child {
      margin-bottom: 0;
    }

    .contact-icon {
      font-size: 1.25rem;
      background: rgba(124, 58, 237, 0.15);
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      color: var(--primary);
    }

    .back-link {
      display: block;
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: var(--primary);
    }
  </style>
</head>
<body>
  <!-- Animated Background -->
  <div class="auth-bg"></div>

  <div class="glass-card">
    <div class="auth-header" style="text-align: center; margin-bottom: 2rem;">
      <div class="auth-logo" style="margin: 0 auto 1rem;">📞</div>
      <h1 style="font-family: 'Outfit', sans-serif; font-size: 2rem; margin: 0 0 0.5rem;">Contact Support</h1>
      <p style="color: var(--text-muted); margin: 0;">Get in touch with the grievance committee</p>
    </div>

    <%
      String message = null;
      if ("POST".equalsIgnoreCase(request.getMethod())) {
        String senderName = request.getParameter("name");
        String senderEmail = request.getParameter("email");
        String subject = request.getParameter("subject");
        String body = request.getParameter("message");
        
        // Simulating message transmission
        message = "Your message has been sent successfully! We will contact you at " + senderEmail + " shortly.";
      }
    %>

    <% if (message != null) { %>
      <div class="toast toast-success" style="position: static; margin-bottom: 1.5rem; width: auto; opacity: 1; transform: none; display: flex;">
        <span class="toast-icon">✅</span>
        <span><%= message %></span>
      </div>
      
      <a href="http://localhost:3000/student/dashboard.html" class="btn btn-primary btn-full" style="text-align: center; display: block; line-height: 2.2rem; text-decoration: none;">Return to Dashboard</a>
    <% } else { %>

      <div class="contact-grid">
        <!-- Contact Information Block -->
        <div class="contact-info-block">
          <h3 style="font-family: 'Outfit', sans-serif; margin-top: 0; margin-bottom: 1rem; color: var(--primary);">Committee Details</h3>
          
          <div class="contact-info-item">
            <div class="contact-icon">📧</div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Email Address</div>
              <div style="font-size: 0.9rem; font-weight: 500;">support@grievance.edu</div>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="contact-icon">📞</div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Phone Number</div>
              <div style="font-size: 0.9rem; font-weight: 500;">+1 (555) 019-2834</div>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="contact-icon">📍</div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Office Location</div>
              <div style="font-size: 0.9rem; font-weight: 500;">Block C, Room 104</div>
            </div>
          </div>
        </div>

        <!-- Working Hours Block -->
        <div class="contact-info-block">
          <h3 style="font-family: 'Outfit', sans-serif; margin-top: 0; margin-bottom: 1rem; color: var(--primary);">Office Hours</h3>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">Monday - Friday</span>
            <span>09:00 AM - 05:00 PM</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">Saturday</span>
            <span>09:00 AM - 01:00 PM</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">Sunday</span>
            <span style="color: var(--primary);">Closed</span>
          </div>

          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 1.5rem; line-height: 1.4;">
            * Inquiries submitted outside hours will be addressed on the following business day.
          </p>
        </div>
      </div>

      <!-- Quick Message Form -->
      <form action="contact.jsp" method="POST" id="contact-form">
        <h3 style="font-family: 'Outfit', sans-serif; margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Send a Quick Message</h3>
        
        <div class="form-grid">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label for="c-name">Your Name <span class="required">*</span></label>
            <input type="text" class="form-input" id="c-name" name="name" placeholder="John Doe" required>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label for="c-email">Your Email <span class="required">*</span></label>
            <input type="email" class="form-input" id="c-email" name="email" placeholder="john.doe@example.com" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label for="c-subject">Subject <span class="required">*</span></label>
          <input type="text" class="form-input" id="c-subject" name="subject" placeholder="Inquiry about grievance status" required>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label for="c-message">Message <span class="required">*</span></label>
          <textarea class="form-input" id="c-message" name="message" rows="4" placeholder="Type your message here..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-full">
          Send Message
        </button>
        
        <a href="http://localhost:3000/student/dashboard.html" class="back-link">Cancel and Return</a>
      </form>
    <% } %>
  </div>
</body>
</html>
