import streamlit as st
import requests
from datetime import date

# ========================================
# CONFIGURATION
# ========================================
API_BASE_URL = "https://olympiad-app-backend.onrender.com"

# ========================================
# CUSTOM CSS - Notion-inspired Mobile-First Design
# ========================================
def load_custom_css():
    st.markdown("""
    <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* Global Styles */
    * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* Hide Streamlit Default Elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Sidebar Styles - Notion Inspired */
    [data-testid="stSidebar"] {
        background-color: #F7F6F3;
        padding: 0;
    }

    [data-testid="stSidebar"] > div:first-child {
        background-color: #F7F6F3;
        padding: 0.5rem 0.5rem;
    }

    /* Sidebar Divider */
    .sidebar-divider {
        height: 1px;
        background-color: rgba(55, 53, 47, 0.09);
        margin: 0.5rem 0;
    }

    /* Override Streamlit Sidebar Button - Notion Style */
    [data-testid="stSidebar"] .stButton > button {
        width: 100%;
        background-color: transparent;
        color: #5A5A5A;
        border: none;
        border-radius: 3px;
        padding: 0.25rem 0.5rem;
        font-weight: 400;
        font-size: 0.813rem;
        text-align: left;
        margin: 0;
        height: auto;
        min-height: 27px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    [data-testid="stSidebar"] .stButton > button:hover {
        background-color: rgba(0, 0, 0, 0.03);
        box-shadow: none;
        transform: none;
    }

    [data-testid="stSidebar"] .stButton > button:active {
        background-color: rgba(0, 0, 0, 0.05);
    }

    /* Sidebar icon styling */
    [data-testid="stSidebar"] .stButton > button::before {
        opacity: 0.6;
    }

    /* Main Container - Mobile First */
    .main .block-container {
        padding: 1rem 1rem;
        max-width: 100%;
    }

    @media (min-width: 768px) {
        .main .block-container {
            padding: 2rem 2rem;
            max-width: 500px;
            margin: 0 auto;
        }
    }

    /* Background */
    .stApp {
        background-color: #FFFFFF;
    }

    /* Custom Button Styles */
    .stButton > button {
        width: 100%;
        background-color: #2D2D2D;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        font-size: 1rem;
        transition: all 0.2s ease;
        margin-top: 0.5rem;
    }

    .stButton > button:hover {
        background-color: #404040;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-1px);
    }

    /* Input Fields */
    .stTextInput > div > div > input,
    .stNumberInput > div > div > input,
    .stDateInput > div > div > input,
    .stSelectbox > div > div > input {
        border-radius: 8px;
        border: 1px solid #E0E0E0;
        padding: 0.75rem;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .stTextInput > div > div > input:focus,
    .stNumberInput > div > div > input:focus {
        border-color: #2D2D2D;
        box-shadow: 0 0 0 1px #2D2D2D;
    }

    /* Labels */
    .stTextInput > label,
    .stNumberInput > label,
    .stDateInput > label,
    .stSelectbox > label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #37352F;
        margin-bottom: 0.5rem;
    }

    /* Title Styles */
    h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #37352F;
        margin-bottom: 0.5rem;
        text-align: center;
    }

    h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #37352F;
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #37352F;
    }

    /* Subtitle/Description */
    .subtitle {
        text-align: center;
        color: #787774;
        font-size: 0.95rem;
        margin-bottom: 2rem;
        line-height: 1.5;
    }

    /* Success/Error Messages */
    .stSuccess, .stError, .stWarning, .stInfo {
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
    }

    /* Divider */
    hr {
        margin: 2rem 0;
        border: none;
        border-top: 1px solid #E0E0E0;
    }

    /* Link Styles */
    a {
        color: #2D2D2D;
        text-decoration: none;
        font-weight: 500;
    }

    a:hover {
        text-decoration: underline;
    }

    /* Card Style */
    .card {
        background: #FAFAFA;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
        border: 1px solid #E0E0E0;
    }

    /* Logo/Brand Section */
    .brand {
        text-align: center;
        margin-bottom: 2rem;
    }

    .brand-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }

    /* Toggle Link */
    .toggle-link {
        text-align: center;
        margin-top: 1.5rem;
        color: #787774;
        font-size: 0.9rem;
    }

    /* Password Input */
    input[type="password"] {
        font-family: 'Courier New', monospace;
    }

    /* Remove extra spacing */
    .element-container {
        margin-bottom: 0;
    }

    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
        justify-content: center;
    }

    .stTabs [data-baseweb="tab"] {
        font-weight: 500;
        font-size: 1rem;
        color: #787774;
        padding: 0.5rem 0;
    }

    .stTabs [aria-selected="true"] {
        color: #2D2D2D;
        border-bottom: 2px solid #2D2D2D;
    }
    </style>
    """, unsafe_allow_html=True)

# ========================================
# SESSION STATE INITIALIZATION
# ========================================
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user_data' not in st.session_state:
    st.session_state.user_data = None
if 'current_page' not in st.session_state:
    st.session_state.current_page = 'auth'
if 'active_nav' not in st.session_state:
    st.session_state.active_nav = 'Dashboard'

# ========================================
# AUTHENTICATION FUNCTIONS
# ========================================
def signup_user(user_data):
    """Sign up a new user"""
    try:
        response = requests.post(f"{API_BASE_URL}/signup", json=user_data)
        return response
    except Exception as e:
        return None

def login_user(email, password):
    """Login user"""
    try:
        response = requests.post(f"{API_BASE_URL}/login", json={
            "email": email,
            "password": password
        })
        return response
    except Exception as e:
        return None

# ========================================
# AUTHENTICATION PAGE
# ========================================
def auth_page():
    """Authentication page with Sign In and Sign Up"""

    # Brand Section
    st.markdown("""
        <div class="brand">
            <div class="brand-icon">🎓</div>
            <h1>Olympiad Prep</h1>
        </div>
    """, unsafe_allow_html=True)

    st.markdown('<p class="subtitle">Master your Olympiad journey with personalized practice and smart analytics</p>', unsafe_allow_html=True)

    # Tabs for Sign In and Sign Up
    tab1, tab2 = st.tabs(["Sign In", "Sign Up"])

    # ========== SIGN IN TAB ==========
    with tab1:
        st.markdown("<br>", unsafe_allow_html=True)

        with st.form("signin_form", clear_on_submit=False):
            email = st.text_input("Email", placeholder="Enter your email", key="signin_email")
            password = st.text_input("Password", type="password", placeholder="Enter your password", key="signin_password")

            submitted = st.form_submit_button("Sign In")

            if submitted:
                if not email or not password:
                    st.error("Please fill in all fields")
                else:
                    with st.spinner("Signing in..."):
                        response = login_user(email, password)

                        if response and response.status_code == 200:
                            user_data = response.json()
                            st.session_state.authenticated = True
                            st.session_state.user_data = user_data
                            st.session_state.current_page = 'dashboard'
                            st.success(f"Welcome back, {user_data.get('first_name', 'User')}!")
                            st.rerun()
                        elif response and response.status_code == 401:
                            st.error("Invalid email or password")
                        elif response and response.status_code == 403:
                            st.error("Your account is deactivated")
                        else:
                            st.error("Failed to sign in. Please try again.")

    # ========== SIGN UP TAB ==========
    with tab2:
        st.markdown("<br>", unsafe_allow_html=True)

        with st.form("signup_form", clear_on_submit=True):
            col1, col2 = st.columns(2)

            with col1:
                first_name = st.text_input("First Name", placeholder="John", key="signup_first")
            with col2:
                last_name = st.text_input("Last Name", placeholder="Doe", key="signup_last")

            email = st.text_input("Email", placeholder="john.doe@example.com", key="signup_email")
            password = st.text_input("Password", type="password", placeholder="Create a password", key="signup_password")

            col3, col4 = st.columns(2)
            with col3:
                grade = st.number_input("Grade", min_value=1, max_value=12, value=8, key="signup_grade")
            with col4:
                dob = st.date_input("Date of Birth", min_value=date(2000, 1, 1), max_value=date.today(), key="signup_dob")

            col5, col6 = st.columns([1, 2])
            with col5:
                country_code = st.text_input("Code", value="+91", key="signup_country_code")
            with col6:
                phone = st.text_input("Phone Number", placeholder="9876543210", key="signup_phone")

            school = st.text_input("School Name", placeholder="Enter your school name", key="signup_school")

            col7, col8 = st.columns(2)
            with col7:
                city = st.text_input("City", placeholder="Mumbai", key="signup_city")
            with col8:
                state = st.text_input("State", placeholder="Maharashtra", key="signup_state")

            submitted = st.form_submit_button("Create Account")

            if submitted:
                # Validation
                if not all([first_name, last_name, email, password, phone, school, city, state]):
                    st.error("Please fill in all required fields")
                elif len(password) < 6:
                    st.error("Password must be at least 6 characters long")
                elif '@' not in email:
                    st.error("Please enter a valid email address")
                else:
                    user_data = {
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email,
                        "password": password,
                        "grade": int(grade),
                        "date_of_birth": str(dob),
                        "country_code": country_code,
                        "phone_number": phone,
                        "profile_image": "",
                        "school_name": school,
                        "city": city,
                        "state": state
                    }

                    with st.spinner("Creating your account..."):
                        response = signup_user(user_data)

                        if response and response.status_code == 201:
                            st.success("Account created successfully! Please sign in.")
                        elif response and response.status_code == 400:
                            st.error("Email already registered or invalid data")
                        else:
                            st.error("Failed to create account. Please try again.")

# ========================================
# SIDEBAR NAVIGATION
# ========================================
def render_sidebar():
    """Render Notion-style sidebar navigation"""

    user = st.session_state.user_data

    with st.sidebar:
        # User Profile Section - Compact Notion Style
        st.markdown(f"""
            <div style="padding: 0.375rem 0.5rem; margin-bottom: 0.25rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 20px; height: 20px; border-radius: 3px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.688rem; font-weight: 600;">
                        {user.get('first_name', 'U')[0].upper()}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.813rem; font-weight: 500; color: #37352F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {user.get('first_name', 'User')}'s Workspace
                        </div>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)

        # Search (placeholder)
        st.markdown("""
            <div style="padding: 0.25rem 0.5rem; margin: 0.125rem 0; color: #9B9A97; font-size: 0.813rem; display: flex; align-items: center; gap: 0.5rem; height: 27px;">
                <span style="opacity: 0.6;">🔍</span>
                <span>Search</span>
            </div>
        """, unsafe_allow_html=True)

        # Navigation Menu
        nav_items = [
            ("🏠", "Home", "home"),
            ("📊", "Dashboard", "dashboard"),
            ("📚", "My Exams", "exams"),
            ("📝", "Practice", "practice"),
        ]

        for icon, label, key in nav_items:
            if st.button(f"{icon} {label}", key=f"nav_{key}", use_container_width=True):
                st.session_state.active_nav = label
                st.rerun()

        st.markdown('<div class="sidebar-divider"></div>', unsafe_allow_html=True)

        # Section Label
        st.markdown("""
            <div style="padding: 0.25rem 0.5rem; margin: 0.25rem 0; color: #9B9A97; font-size: 0.688rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                MY STUDY
            </div>
        """, unsafe_allow_html=True)

        # Study items
        study_items = [
            ("📈", "Analytics", "analytics"),
            ("📖", "Study Notes", "notes"),
            ("🔖", "Bookmarks", "bookmarks"),
        ]

        for icon, label, key in study_items:
            if st.button(f"{icon} {label}", key=f"study_{key}", use_container_width=True):
                st.session_state.active_nav = label
                st.rerun()

        st.markdown('<div class="sidebar-divider"></div>', unsafe_allow_html=True)

        # Settings & Profile
        if st.button("👤 Profile", key="nav_profile", use_container_width=True):
            st.session_state.active_nav = "Profile"
            st.rerun()

        if st.button("⚙️ Settings", key="nav_settings", use_container_width=True):
            st.session_state.active_nav = "Settings"
            st.rerun()

        st.markdown('<div class="sidebar-divider"></div>', unsafe_allow_html=True)

        if st.button("🚪 Sign Out", key="nav_signout", use_container_width=True):
            st.session_state.authenticated = False
            st.session_state.user_data = None
            st.session_state.current_page = 'auth'
            st.session_state.active_nav = 'Dashboard'
            st.rerun()

# ========================================
# PAGE COMPONENTS
# ========================================
def dashboard_page():
    """Main dashboard after login"""
    user = st.session_state.user_data

    st.markdown(f"""
        <h1 style="text-align: left;">Welcome back, {user.get('first_name', 'User')}! 👋</h1>
        <p style="color: #787774; font-size: 0.95rem; margin-top: -0.5rem;">Grade {user.get('grade', 'N/A')} • {user.get('school_name', 'School')}</p>
    """, unsafe_allow_html=True)

    st.markdown("---")

    # Quick Stats
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
            <div class="card">
                <div style="font-size: 1.5rem; font-weight: 600; color: #37352F;">0</div>
                <div style="font-size: 0.875rem; color: #787774; margin-top: 0.25rem;">Tests Taken</div>
            </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
            <div class="card">
                <div style="font-size: 1.5rem; font-weight: 600; color: #37352F;">0%</div>
                <div style="font-size: 0.875rem; color: #787774; margin-top: 0.25rem;">Avg Score</div>
            </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
            <div class="card">
                <div style="font-size: 1.5rem; font-weight: 600; color: #37352F;">0 🔥</div>
                <div style="font-size: 0.875rem; color: #787774; margin-top: 0.25rem;">Day Streak</div>
            </div>
        """, unsafe_allow_html=True)

    # Coming Soon
    st.markdown("""
        <div class="card" style="margin-top: 2rem;">
            <h3>🚀 Dashboard Coming Soon!</h3>
            <p style="color: #787774; margin-top: 0.5rem;">
                We're building an amazing experience for you. Stay tuned!
            </p>
        </div>
    """, unsafe_allow_html=True)

def home_page():
    """Home page"""
    st.markdown("<h1>🏠 Home</h1>", unsafe_allow_html=True)
    st.markdown("Welcome to your home page!")

def exams_page():
    """My Exams page"""
    st.markdown("<h1>📚 My Exams</h1>", unsafe_allow_html=True)
    st.markdown("Browse and select exams to practice.")

def practice_page():
    """Practice page"""
    st.markdown("<h1>📝 Practice</h1>", unsafe_allow_html=True)
    st.markdown("Start practicing questions!")

def analytics_page():
    """Analytics page"""
    st.markdown("<h1>📈 Analytics</h1>", unsafe_allow_html=True)
    st.markdown("View your performance analytics.")

def notes_page():
    """Study Notes page"""
    st.markdown("<h1>📖 Study Notes</h1>", unsafe_allow_html=True)
    st.markdown("Access your study materials.")

def bookmarks_page():
    """Bookmarks page"""
    st.markdown("<h1>🔖 Bookmarks</h1>", unsafe_allow_html=True)
    st.markdown("View your bookmarked questions.")

def profile_page():
    """Profile page"""
    user = st.session_state.user_data
    st.markdown("<h1>👤 Profile</h1>", unsafe_allow_html=True)

    st.markdown("### Your Information")

    col1, col2 = st.columns(2)
    with col1:
        st.text_input("First Name", value=user.get('first_name', ''), disabled=True)
        st.text_input("Email", value=user.get('email', ''), disabled=True)
        st.text_input("School", value=user.get('school_name', ''), disabled=True)

    with col2:
        st.text_input("Last Name", value=user.get('last_name', ''), disabled=True)
        st.text_input("Grade", value=str(user.get('grade', '')), disabled=True)
        st.text_input("City", value=user.get('city', ''), disabled=True)

def settings_page():
    """Settings page"""
    st.markdown("<h1>⚙️ Settings</h1>", unsafe_allow_html=True)
    st.markdown("Manage your account settings.")

# ========================================
# MAIN DASHBOARD ROUTER
# ========================================
def main_app():
    """Main app with sidebar navigation"""

    # Render sidebar
    render_sidebar()

    # Route to active page
    active = st.session_state.active_nav

    if active == "Home":
        home_page()
    elif active == "Dashboard":
        dashboard_page()
    elif active == "My Exams":
        exams_page()
    elif active == "Practice":
        practice_page()
    elif active == "Analytics":
        analytics_page()
    elif active == "Study Notes":
        notes_page()
    elif active == "Bookmarks":
        bookmarks_page()
    elif active == "Profile":
        profile_page()
    elif active == "Settings":
        settings_page()
    else:
        dashboard_page()

# ========================================
# MAIN APP
# ========================================
def main():
    # Set page config
    st.set_page_config(
        page_title="Olympiad Prep",
        page_icon="🎓",
        layout="centered",
        initial_sidebar_state="expanded" if st.session_state.authenticated else "collapsed"
    )

    # Load custom CSS
    load_custom_css()

    # Route to appropriate page
    if st.session_state.authenticated:
        main_app()
    else:
        auth_page()

if __name__ == "__main__":
    main()
