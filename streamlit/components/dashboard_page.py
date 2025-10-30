import streamlit as st


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
