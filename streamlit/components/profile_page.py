import streamlit as st


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
