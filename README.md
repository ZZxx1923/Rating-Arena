# EvalPro — Employee Evaluation System

**A modern, bilingual (Arabic/English) employee evaluation platform with glassmorphic design, real-time analytics, and seamless API integration.**

---

## 🎯 Overview

EvalPro is a comprehensive employee evaluation and survey system designed for organizations to collect, manage, and analyze employee performance feedback. Built with **React 19**, **TypeScript**, **Tailwind CSS 4**, and the **Arctic Glass** design system, it offers a premium user experience with support for both Arabic and English languages.

### Key Features

- **Bilingual Support** — Full Arabic/English interface with automatic translation of employee names, positions, departments, and evaluation criteria
- **Dual Authentication** — Admin and Regular User roles with different permission levels
- **Comprehensive Dashboard** — Real-time statistics, charts, and performance metrics
- **Evaluation Management** — Create, submit, approve, and reject employee evaluations
- **Anonymous Evaluations** — Option to submit feedback anonymously
- **Advanced Analytics** — Trend analysis, department comparisons, top performers identification
- **API Integration** — Full integration with Rating Arena backend (https://arena-server-c8xo.onrender.com)
- **Dark/Light Mode** — Theme switching with persistent preferences
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile devices

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended 22.13.0)
- **pnpm** 10.4.1+ (package manager)

### Installation

1. **Extract the project**
   ```bash
   unzip employee-evaluation-system.zip
   cd employee-evaluation-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

4. **Build for production**
   ```bash
   pnpm build
   ```

---

## 🔐 Demo Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full system access, all management features

### Regular User Account
- **Username:** `user`
- **Password:** `user123`
- **Access:** Submit evaluations, view dashboard (limited)

---

## 📁 Project Structure

```
employee-evaluation-system/
├── client/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth, Theme, etc.)
│   │   ├── hooks/             # Custom React hooks (useI18n, etc.)
│   │   ├── lib/               # Utilities (store, API, i18n, translator)
│   │   ├── pages/             # Page components (Login, Dashboard, etc.)
│   │   ├── App.tsx            # Main app component with routes
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles & design tokens
│   ├── index.html             # HTML template
│   └── public/                # Static assets
├── server/                    # Backend placeholder (static deployment)
├── shared/                    # Shared types
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── README.md                  # This file
```

---

## 🌐 Bilingual System (i18n)

### Language Switching

Click the **Globe icon** (🌍) in the sidebar to toggle between Arabic and English.

### Supported Languages

- **Arabic (AR)** — Default language with RTL layout
- **English (EN)** — Full English interface with LTR layout

### Automatic Translation

The system automatically translates:
- **Employee names** — Ahmed ↔ أحمد
- **Positions** — Software Engineer ↔ مهندس برمجيات
- **Departments** — Engineering ↔ الهندسة
- **Evaluation criteria** — Professionalism ↔ الاحترافية

Custom translations can be added via the `translator.ts` service.

---

## 🔌 API Integration

### Backend Server

**Base URL:** `https://arena-server-c8xo.onrender.com`

### Available Endpoints

| Resource | Methods | Description |
|----------|---------|-------------|
| `/users` | GET, POST, PATCH, DELETE | User management |
| `/employees` | GET, POST, DELETE | Employee management |
| `/departments` | GET, POST, DELETE | Department management |
| `/questions` | GET, POST, DELETE | Evaluation criteria |
| `/evaluations` | GET, POST, PATCH, DELETE | Evaluation submissions |
| `/login` | POST | User authentication |

### API Service

All API functions are available in `client/src/lib/api.ts`:

```typescript
import * as api from "@/lib/api";

// Get all users
const users = await api.apiGetUsers();

// Submit evaluation
await api.apiSubmitEvaluation({
  targetName: "Ahmed",
  avgScore: 4.5,
  details: { professionalism: 5, communication: 4 },
  comment: "Great work",
  isAnonymous: true,
});

// Check API health
const isHealthy = await api.apiHealthCheck();
```

---

## 🎨 Design System

### Arctic Glass (Corporate Glassmorphism)

The design follows the **Arctic Glass** aesthetic:

- **Color Palette**
  - Primary: Indigo Electric (`oklch(0.60 0.22 264)`)
  - Background: Navy Deep (`oklch(0.14 0.020 264)`)
  - Accent: Cyan (`oklch(0.78 0.17 70)`)

- **Typography**
  - Display: **Sora** (bold, modern)
  - Body: **Inter** (readable, clean)
  - Mono: **JetBrains Mono** (code)

- **Effects**
  - Glassmorphism with backdrop blur
  - Soft shadows and subtle gradients
  - Smooth transitions (180-250ms)

### Theme Switching

Toggle between **Dark Mode** (default) and **Light Mode** using the theme button in the sidebar.

---

## 📊 Features Breakdown

### 1. Dashboard
- Total users, employees, departments, evaluations count
- Pending, approved, rejected evaluation statistics
- Recent evaluations list
- Interactive charts (line, pie, radar)

### 2. New Evaluation
- Step-by-step evaluation form
- 13 evaluation criteria with 1-5 rating scale
- Optional comments
- Anonymous submission option
- Real-time validation

### 3. Evaluations Management
- View all evaluations with filtering
- Approve/reject with optional reasons
- Delete evaluations
- Status tracking (Pending/Approved/Rejected)

### 4. Employees
- Full CRUD operations
- Employee profiles with performance radar charts
- Department assignment
- Position and email management

### 5. Departments
- Create and manage departments
- View department statistics
- Employee count per department

### 6. Users
- User account management
- Role assignment (Admin/User)
- Permission control
- API synchronization

### 7. Analytics
- Evaluation trends over time
- Status distribution charts
- Department performance comparison
- Top performers identification
- Average scores by criterion

---

## 🔄 Data Persistence

### Local Storage
- Primary data storage for offline capability
- Persists across browser sessions
- Automatic sync with API when available

### API Backend
- Secondary data source
- Real-time synchronization
- Dual-source architecture for reliability

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Code formatting
pnpm format
```

### Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4 with custom design tokens
- **UI Components:** shadcn/ui
- **Routing:** Wouter
- **State Management:** React Context + localStorage
- **Charts:** Recharts
- **Notifications:** Sonner
- **Icons:** Lucide React
- **Build Tool:** Vite 7
- **Package Manager:** pnpm

---

## 📝 Evaluation Criteria

The system includes 13 predefined evaluation criteria:

1. **Professionalism** — Professional conduct and appearance
2. **Respectfulness** — Respect for colleagues and policies
3. **Communication Skills** — Clarity and effectiveness in communication
4. **Teamwork** — Collaboration and team contribution
5. **Problem Solving** — Ability to identify and resolve issues
6. **Work Quality** — Quality of deliverables
7. **Time Management** — Meeting deadlines and managing workload
8. **Responsibility** — Accountability for tasks
9. **Customer Service** — Service quality to clients/users
10. **Leadership** — Leadership and mentoring abilities
11. **Cooperation** — Willingness to help and cooperate
12. **Punctuality** — Attendance and timeliness
13. **Overall Performance** — General performance assessment

---

## 🔒 Security

- **Password Storage:** Hashed in localStorage (demo only)
- **Session Management:** Browser-based with logout option
- **API Communication:** HTTPS only
- **CORS:** Enabled for API integration

> ⚠️ **Note:** This is a demo system. For production use, implement proper backend authentication, JWT tokens, and secure password hashing.

---

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1280px+)
- **Tablet** (768px - 1279px)
- **Mobile** (< 768px)

---

## 🚀 Deployment

### Manus Hosting
The project is configured for deployment on Manus with built-in hosting support.

### GitHub
To push to GitHub:

1. Create a new repository on GitHub
2. Clone this project
3. Add remote: `git remote add origin <your-repo-url>`
4. Push: `git push -u origin main`

### Other Platforms
The project can be deployed to any static hosting platform (Vercel, Netlify, etc.) after running `pnpm build`.

---

## 🐛 Troubleshooting

### API Connection Issues
- Verify internet connection
- Check if `https://arena-server-c8xo.onrender.com` is accessible
- Check browser console for CORS errors
- Use `api.apiHealthCheck()` to diagnose

### Language Not Switching
- Clear browser cache and localStorage
- Check browser console for errors
- Verify localStorage is enabled
- Try hard refresh (Ctrl+Shift+R)

### Build Errors
- Delete `node_modules` and `pnpm-lock.yaml`
- Run `pnpm install` again
- Ensure Node.js version is 18+

---

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Review the API test report in `/api-test-report.md`
3. Verify all dependencies are installed correctly
4. Ensure backend API is accessible

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🎉 Features Roadmap

### Planned Features
- [ ] Export evaluations to PDF/Excel
- [ ] Real-time notifications for evaluation status changes
- [ ] Evaluation cycles/periods management
- [ ] Advanced filtering and search
- [ ] Custom evaluation templates
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Audit logs
- [ ] Performance trends over time
- [ ] Salary/bonus recommendations based on evaluations

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

**Version:** 1.0.0  
**Last Updated:** June 13, 2026
