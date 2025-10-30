# Olympiad Prep - Frontend

A mobile-first, Notion-inspired Streamlit web application for Olympiad exam preparation.

## Features

- Clean, minimalist design inspired by Notion
- Mobile-first responsive layout
- User authentication (Sign In/Sign Up)
- Secure login with session management
- Dashboard with personalized greeting
- Connected to Olympiad App Backend API

## Design Philosophy

- **Simple & Clean**: Notion-style minimal UI
- **Mobile-First**: Optimized for mobile devices, scales up beautifully on desktop
- **Inter Font**: Modern, professional typography
- **Subtle Interactions**: Smooth transitions and hover effects
- **User-Focused**: Intuitive navigation and clear CTAs

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Streamlit app:
```bash
streamlit run app.py
```

3. The app will open in your browser at `http://localhost:8501`

## Configuration

The app is configured to connect to the backend API at:
```
https://olympiad-app-backend.onrender.com
```

To change the API base URL, edit the `API_BASE_URL` variable in `app.py` (line 8).

## Usage

### Sign Up
1. Open the app and click the "Sign Up" tab
2. Fill in all required fields:
   - Name, Email, Password
   - Grade, Date of Birth
   - Phone Number (with country code)
   - School, City, State
3. Click "Create Account"
4. After successful signup, switch to "Sign In" tab

### Sign In
1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to the dashboard

### Dashboard
- View personalized greeting
- See your profile information
- Access to upcoming features (coming soon!)

## Project Structure

```
Olympiad_App_Frontend/
├── app.py              # Main Streamlit application
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Tech Stack

- **Framework**: Streamlit 1.26.1
- **HTTP Client**: Requests
- **Styling**: Custom CSS (Notion-inspired)
- **Font**: Inter (Google Fonts)

## Color Palette

- **Primary Text**: `#37352F` (Notion black)
- **Secondary Text**: `#787774` (Notion gray)
- **Background**: `#FFFFFF` (White)
- **Button**: `#2D2D2D` (Dark gray)
- **Border**: `#E0E0E0` (Light gray)
- **Card Background**: `#FAFAFA` (Off-white)

## Roadmap

- [x] Authentication (Sign In/Sign Up)
- [ ] Exam selection dashboard
- [ ] Topic-wise practice
- [ ] Mock tests with timer
- [ ] Progress analytics
- [ ] Study notes viewer
- [ ] Question bookmarking
- [ ] Performance tracking

## Development

To contribute or modify:

1. Fork the repository
2. Make your changes in a feature branch
3. Test thoroughly on mobile and desktop
4. Submit a pull request

## Support

For issues or questions, please open an issue on GitHub.
