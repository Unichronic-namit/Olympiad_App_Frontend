# 🎓 Olympiad Prep Application

A comprehensive Olympiad exam preparation platform built with Next.js, TypeScript, and Tailwind CSS. This application helps students prepare for various Olympiad exams with structured practice, progress tracking, and interactive learning experiences.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [Theme & Design](#theme--design)
- [Important Notes](#important-notes)

## ✨ Features

### Authentication

- **Signup Page**: Complete registration with multiple fields

  - First Name, Last Name
  - Email & Password (with validation)
  - Grade Selection (1-12)
  - Date of Birth
  - Phone Number (with country code)
  - School Name, City, State
  - Client-side form validation
  - API integration with error handling

- **Login Page**: Secure authentication
  - Email and password login
  - User session management
  - Local storage for authentication state

### Dashboard

- Personalized welcome message
- User statistics display
- Quick action buttons
- Navigation to different sections

### Exam Management

- **Exams Listing** (`/exams`)

  - View all available exams
  - Filter exams by grade (dropdown)
  - Display exam details (questions, marks, time)
  - Grade-specific filtering

- **Sections** (`/exams/[examId]/sections`)

  - View sections for a specific exam
  - Section details (questions, marks per question, total marks)
  - Navigation to topics

- **Topics & Subtopics** (`/exams/[examId]/sections/[sectionId]/topics`)

  - Browse topics and subtopics
  - Difficulty level selection (Easy, Medium, Hard)
  - Select topic/subtopic for practice
  - Difficulty persists across navigation

- **Questions** (`/exams/[examId]/sections/[sectionId]/questions`)
  - MCQ questions display
  - Difficulty-based question filtering
  - Real-time answer validation
  - Solution display for incorrect answers
  - Progress tracking
  - Score calculation and results screen
  - Empty state with navigation back to topics

### Navigation

- **Responsive Navbar**
  - Desktop: Fixed left sidebar
  - Mobile: Drawer/sidebar with toggle
  - Navigation items: Dashboard, Exams, Notes, Practice, Performance, Profile, Logout
  - Active route highlighting
  - Mobile-optimized with app name display

## 🛠 Tech Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Library**: React 19
- **Backend API**: FastAPI (external)
- **Storage**: Local Storage (authentication & user data)

## 📁 Project Structure

```
olympiad-prep/
├── app/
│   ├── (auth)/               # Authentication group route
│   │   ├── login/
│   │   │   └── page.tsx      # Login page
│   │   └── signup/
│   │       └── page.tsx      # Signup page
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── Navbar.tsx    # Navigation component
│   │   ├── layout/
│   │   │   └── Header.tsx    # Header component
│   │   └── ui/
│   │       └── Button.tsx    # Reusable button component
│   ├── config/
│   │   └── api.ts            # API configuration
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page
│   ├── exams/
│   │   ├── page.tsx          # Exams listing page
│   │   └── [examId]/
│   │       └── sections/
│   │           ├── page.tsx # Sections page
│   │           └── [sectionId]/
│   │               ├── topics/
│   │               │   └── page.tsx # Topics page
│   │               └── questions/
│   │                   └── page.tsx # Questions page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- FastAPI backend running (see [API Configuration](#configuration))

### Installation

1. Clone or navigate to the project directory:

```bash
cd olympiad-prep
```

2. Install dependencies:

```bash
npm install
```

3. Configure API base URL (see [Configuration](#configuration))

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note**: The default port is 3000. To run on a different port (e.g., 8501), modify `package.json`:

```json
"dev": "next dev -p 8501"
```

## ⚙️ Configuration

### API Configuration

Edit `app/config/api.ts` to configure your backend API:

```typescript
export const API_BASE_URL = "http://localhost:8000";
// or
export const API_BASE_URL = "https://olympiad-app-backend.onrender.com";
```

### API Endpoints

The application uses the following endpoints:

- `POST /signup` - User registration
- `POST /login` - User authentication
- `GET /exams` - Get all exams
- `GET /exams/{exam_overview_id}/sections` - Get sections for an exam
- `GET /sections/{section_id}/syllabus` - Get topics/subtopics for a section
- `GET /syllabus/{syllabus_id}/questions` - Get questions for a topic/subtopic

### CORS Configuration

**Important**: Ensure your FastAPI backend has CORS middleware configured to allow requests from your frontend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📄 Pages & Routes

### Public Routes

- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (Require Authentication)

- `/dashboard` - User dashboard
- `/exams` - Exams listing
- `/exams/[examId]/sections` - Exam sections
- `/exams/[examId]/sections/[sectionId]/topics` - Topics & subtopics
- `/exams/[examId]/sections/[sectionId]/questions` - Practice questions

**Note**: Protected routes automatically redirect to `/login` if the user is not authenticated.

## 🧩 Components

### Navbar (`components/dashboard/Navbar.tsx`)

Responsive navigation component with:

- Desktop: Fixed left sidebar (visible on `md` breakpoint and above)
- Mobile: Hamburger menu drawer (toggles on mobile)
- Navigation items with active state highlighting
- Mobile: App name replaces menu icon when sidebar is open

### Button (`components/ui/Button.tsx`)

Reusable button component with variants:

- `primary` - Blue background (primary actions)
- `secondary` - Black background (secondary actions)
- Customizable size and disabled states

## 🎨 Theme & Design

### Color Scheme

- **Primary Color**: Blue (`#2563eb`)
- **Secondary Color**: Black (`#000000`)
- **Accent Color**: White (`#ffffff`)
- **Background**: Light gray/white for a clean look

### Design Principles

- **Light & Clean**: White and blue theme matching mobile UI
- **Professional**: Suitable for students while remaining engaging
- **Responsive**: Fully responsive across all screen sizes
- **Accessible**: Clear typography, proper contrast, intuitive navigation

### UI Features

- Smooth transitions and hover effects
- Consistent spacing and typography
- Clear visual hierarchy
- Professional card-based layouts
- Color-coded difficulty indicators (🟢 Easy, 🟡 Medium, 🔴 Hard)

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3000 by default)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## ⚠️ Important Notes

### Authentication

- User authentication state is stored in `localStorage`
- Keys used:
  - `authenticated` - Boolean flag
  - `user_data` - JSON stringified user object
- On logout, localStorage is cleared and user is redirected to login

### API Integration

- All API calls use `fetch` with CORS mode
- Request headers include:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Error handling includes:
  - Network errors
  - HTTP status code handling (400, 401, 403, 201)
  - JSON parsing errors
  - Field-level validation errors

### Form Validation

- **Client-side validation** on signup form:
  - Required field checks
  - Email format validation
  - Password length (minimum 6 characters)
  - Password confirmation match
  - Phone number validation
- **Server-side validation** errors are displayed per field

### Data Flow

1. User signs up → API returns user data → Store in localStorage → Redirect to login
2. User logs in → API returns user data → Store in localStorage → Redirect to dashboard
3. Protected routes check localStorage for authentication
4. Exam data fetched from API with grade filtering
5. Questions filtered by difficulty level from URL params

### Grade Filtering

- Default: Filters exams based on user's registered grade
- Manual override: Dropdown in top-right to select any grade
- Filter persists for the session

### Difficulty Levels

- Available: Easy, Medium, Hard
- Default: Easy
- Selection persists across topic navigation
- Questions filtered by selected difficulty

## 🔐 Security Considerations

- Passwords are not stored on the frontend (handled by backend)
- Authentication tokens should be handled securely (update if using JWT)
- API keys should not be hardcoded (use environment variables)
- CORS should be properly configured on the backend

## 🚧 Future Enhancements

Potential features to add:

1. **Notes Management**

   - Save notes for topics
   - Organize notes by subject

2. **Practice Mode**

   - Timed practice sessions
   - Question bank browsing

3. **Performance Analytics**

   - Detailed score history
   - Progress charts and graphs
   - Performance by topic/subtopic
   - Weak areas identification

4. **Study Materials**

   - PDF downloads
   - Video tutorials
   - Reference materials

5. **Social Features**

   - Leaderboards
   - Share achievements
   - Study groups

6. **Advanced Features**
   - Offline mode with caching
   - Push notifications
   - Email notifications
   - Dark mode toggle

## 📞 Support

For issues or questions:

- Check the API backend is running and accessible
- Verify CORS configuration
- Check browser console for errors
- Ensure all environment variables are set correctly

## 📄 License

This project is private and proprietary.

## 👥 Contributors

Developed for Olympiad exam preparation platform.

---

**Last Updated**: 2025
**Version**: 0.1.0
**Status**: Active Development
