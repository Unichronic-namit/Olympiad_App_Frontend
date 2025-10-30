import streamlit as st
from styles.custom_css import load_custom_css
from components.auth_page import auth_page
from components.sidebar import render_sidebar
from components.dashboard_page import dashboard_page
from components.home_page import home_page
from components.exams_page import exams_page
from components.practice_page import practice_page
from components.analytics_page import analytics_page
from components.notes_page import notes_page
from components.bookmarks_page import bookmarks_page
from components.profile_page import profile_page
from components.settings_page import settings_page

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
