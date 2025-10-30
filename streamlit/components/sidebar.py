import streamlit as st


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
