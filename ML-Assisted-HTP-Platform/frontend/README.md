## DSI Platform - Frontend
This repository contains the frontend code for the DSI Platform, a single-page application (SPA) built with React. The application provides role-based dashboards for `Uploader`, `Assessor`, and `Admin` users, allowing them to interact with the backend API seamlessly.
### Table of Contents
1.  [Project Overview](#project-overview-1)
2.  [Features](#features-1)
3.  [Technology Stack](#technology-stack-1)
4.  [Prerequisites](#prerequisites-1)
5.  [Installation and Setup](#installation-and-setup-1)
6.  [Running the Application](#running-the-application)
7.  [Component Structure](#component-structure)
8.  [Key Concepts](#key-concepts)

---

### Project Overview

This is a single-page application (SPA) built with React that serves as the user interface for the DSI Platform. It provides distinct, role-based dashboards for `Uploader`, `Assessor`, and `Admin` users, allowing them to interact with the backend API in an intuitive and efficient manner.

### Features

-   **Role-Based Dashboards:** Custom-tailored user interfaces for each user role.
    -   **Uploader View:** A simple, mobile-friendly interface for uploading new drawings and checking submission statuses.
    -   **Assessor View:** A professional workspace for reviewing AI-flagged cases, comparing ML analysis with the original drawing, and submitting final reports.
    -   **Admin View:** A comprehensive dashboard for monitoring system analytics, managing all user accounts, and auditing/reassigning all cases.
-   **Persistent Login:** User sessions are maintained across page reloads using JWTs stored in `localStorage`.
-   **Protected Routes:** Client-side routing that prevents unauthorized access to role-specific pages.
-   **Centralized State Management:** Uses React Context API (`AuthContext`) for global authentication state management.
-   **Dynamic UI:** Components are designed to be responsive and update in real-time based on API data.

### Technology Stack

-   **React.js:** A JavaScript library for building user interfaces.
-   **React Router:** For declarative routing within the SPA.
-   **Axios:** For making HTTP requests to the backend API.
-   **Bootstrap:** For quick and responsive UI styling.
-   **Custom CSS:** For theme-specific styling to match professional mockups.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
-   The **DSI Platform - Backend** must be running and accessible.

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure the API Proxy:**
    The project is configured to proxy API requests to the backend server running on port 5001. Ensure the following line is present in your `package.json`:
    ```json
    "proxy": "http://localhost:5001"
    ```
    This avoids CORS issues during development.

### Running the Application

1.  **Start the Backend Server:** Make sure your backend server is running (usually on `http://localhost:5001`).

2.  **Start the Frontend Development Server:**
    ```bash
    npm start
    ```
    The application will automatically open in your default browser at `http://localhost:3000`.

### Component Structure

The `src` folder is organized by feature and role to keep the codebase maintainable.

```
src/
├── api/              # Centralized Axios API calls
├── assets/           # Static assets like logos
├── components/
│   ├── admin/        # Components for the Admin dashboard
│   ├── uploader/     # Components for the Uploader dashboard
│   ├── AdminDashboard.js
│   ├── AssessorDashboard.js
│   ├── UploaderDashboard.js
│   ├── ProtectedRoute.js
│   ├── ReviewView.js
│   └── all other files
├── context/
│   └── AuthContext.js  # Global state for authentication
├── pages/
│   └── LoginPage.js
├── App.js            # Main application component with routing
└── index.js          # Entry point of the application
```
*(Note: The structure has evolved to include sub-folders like `/admin` and `/uploader` for better organization.)*

### Key Concepts

-   **`AuthContext`:** This context provider wraps the entire application. It manages the `user` object and `loading` state, handles login/logout, and verifies the user's session on app startup by calling the `/api/auth/me` endpoint.
-   **`ProtectedRoute`:** This component is a wrapper around routes that require authentication and specific roles. It checks the `AuthContext` to determine if a user is authorized to view a page, showing a loading indicator or redirecting as needed.
-   **View Controller Pattern:** Dashboards like `AdminDashboard` and `UploaderDashboard` act as "controllers." They manage a `view` state variable and render different child components (`AdminMainDashboard`, `UploadForm`, etc.) based on user interaction, keeping the main component clean and organized.
