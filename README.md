# Student Grievance Management System (SGMS)

A full-stack, secure, and modern grievance registration and resolution system for educational institutions. The application features a dark glassmorphism interface, custom role-based authentication, real-time analytics, and dual-server orchestration (Node.js/Express + Apache Tomcat for JSP).

---

## 🌟 Key Features

* **Modern Dark Theme**: Rich glassmorphism aesthetics, styled layouts, custom input indicators, and smooth animations.
* **Role-Based Login & Boundary Control**: Dedicated login portals and validation workflows for **Students** and **Administrators** to prevent illegal dashboard cross-access.
* **Student Dashboard**: 
  * View status counts (Total, Pending, In Progress, Resolved).
  * File new grievances with ticket auto-generation (`GRV-XXXXXXX`).
  * Monitor grievance categories, priority indicators, and track administrator comments.
* **Admin Dashboard & Analytics**:
  * Real-time aggregate count counters.
  * Interactive data visualization (doughnut/bar/trend charts) powered by **Chart.js**.
  * Complete control panel to filter, search, update status, and write resolution responses.
* **JSP Academic Integrations (Tomcat)**:
  * **System Feedback Form (`feedback.jsp`)**: High-fidelity dark-themed star rating form writing submissions directly to the database via JDBC.
  * **Support Information Board (`contact.jsp`)**: Multi-column responsive layout displaying support contacts, office hours, and inquiry form with JDBC persistence.
* **Database Reliability**: Built on top of **Supabase PostgreSQL** with Row Level Security (RLS) tables.
* **Automated Notifications**: Email confirmations sent automatically to students via SMTP when a grievance is registered or updated.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, CSS3 Custom Properties (Vanilla), ES6 JavaScript, Chart.js
* **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Security Headers (`helmet`), CORS, rate-limiting, Nodemailer
* **JSP Server**: Java, Apache Tomcat, JDBC (PostgreSQL Driver)
* **Database**: Supabase (PostgreSQL)

---

## 📂 Project Structure

```
GrievanceSystem-main/
├── index.html                  # Landing page (checks session → redirects)
├── login.html                  # Unified login page with Student/Admin role tabs
├── register.html               # Registration page with Student/Admin toggle
│
├── student/                    # Student Dashboard pages
│   ├── dashboard.html          
│   ├── grievances.html         
│   └── submit.html             
│
├── admin/                      # Admin Portal pages
│   ├── dashboard.html          
│   └── panel.html              
│
├── jsp/                        # Tomcat JSP source files
│   ├── feedback.jsp            # System feedback page
│   └── contact.jsp             # Contact support page
│
├── css/                        # Stylesheets
│   ├── style.css               # Global variables, fonts, auth, animations
│   └── dashboard.css           # Sidebar, stats, tables, modals, badges
│
├── js/                         # Frontend scripts
│   ├── supabase.js             # Base settings & Toast alerts helper
│   ├── auth.js                 # Session token management & role checks
│   ├── student.js              # Student dashboard data loader
│   ├── grievance.js            # Grievance CRUD, search & filter functions
│   └── admin.js                # Admin dashboard, panel, modal, & Chart.js logic
│
├── server/                     # Node.js backend
│   ├── app.js                  # App config (Helmet, CORS, Rate Limiters, routes)
│   ├── routes/                 # Auth & Grievance routes
│   ├── controllers/            # Registration, login, & grievance actions
│   ├── middleware/             # JWT authenticators & XSS sanitization
│   └── utils/                  # Nodemailer HTML templates
│
├── database/
│   └── schema.sql              # Supabase SQL table definitions & RLS policies
│
├── package.json                # Dependencies & script configurations
├── .env.example                # Configuration template
└── README.md                   # Project documentation
```

---

## 🚀 Setup & Execution Guide

### 1. Database Setup (Supabase)
1. Register a project on [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** -> Click **New Query**.
3. Copy the contents of `database/schema.sql` and run them. This will initialize the four required tables (`users`, `grievances`, `feedback`, and `contact_messages`).

### 2. Backend Config
1. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-publishable-key
   JWT_SECRET=choose-a-strong-jwt-secret-string
   JWT_EXPIRE=7d
   ```

### 3. Deploy Tomcat JSP Pages
1. Install Apache Tomcat (running on port **8080**).
2. Copy `jsp/feedback.jsp` and `jsp/contact.jsp` into your Tomcat ROOT directory (typically `C:\Program Files\Apache Software Foundation\Tomcat 10.1\webapps\ROOT\`).
3. Set your PostgreSQL database password inside the `dbPassword` variable in both deployed JSP files to enable direct JDBC persistence.

### 4. Start the Application
Install dependencies and run the server:
```bash
# Install Node modules
npm install

# Start Express server (runs on port 3000)
npm run dev
```

Open your browser to **`http://localhost:3000`** to access the login panel.
