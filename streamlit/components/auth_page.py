import streamlit as st
from datetime import date
from utils.auth import signup_user, login_user


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
