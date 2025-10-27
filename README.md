# Olympiad App Frontend

This is the Streamlit-based frontend for testing the Olympiad API.

## Features

- Test all API endpoints for Exams, Sections, Syllabus, Notes, Questions, Analytics, and Authentication
- Interactive UI for creating, reading, updating, and deleting data
- Real-time API testing and response viewing

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

To change the API base URL, edit the `API_BASE_URL` variable in `app.py`.

## Usage

1. Select a module from the sidebar (Exams, Sections, Syllabus, Notes, Questions, Analytics, Auth)
2. Choose an action (Get, Create, Update, Delete)
3. Fill in the required fields
4. Click the button to execute the API call
5. View the JSON response

## Modules

- **Exams**: Manage exam overviews
- **Sections**: Manage exam sections
- **Syllabus**: Manage topics and subtopics
- **Notes**: Manage study notes
- **Questions**: Manage practice questions
- **Analytics**: View exam analytics and full overview
- **Auth**: User signup and login
