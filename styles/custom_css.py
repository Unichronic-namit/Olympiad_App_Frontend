import streamlit as st


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
                
    p {
        color: #37352F;
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 0.5rem;
    }

    div {
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
                
    .stSuccess {
        color: #0F5132;  /* Dark green text for success messages */
    }

    .stError {
        color: #721C24;  /* Dark red text for error messages */
    }

    .stWarning {
        color: #856404;  /* Dark yellow/brown text for warning messages */
    }

    .stInfo {
        color: #004085;  /* Dark blue text for info messages */
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
