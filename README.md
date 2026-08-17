# ML-Assisted HTP Platform

An AI-assisted web platform for the analysis and preliminary interpretation of House-Tree-Person (HTP) drawings. The system combines computer vision, generative AI, and human expert review into an end-to-end case management workflow.

## Overview

The ML-Assisted HTP Platform is a full-stack application designed to assist trained assessors with the preliminary analysis of House-Tree-Person (HTP) drawings.

The platform allows users to upload drawings, performs automated visual analysis using a machine learning model, generates an AI-assisted interpretation, and provides assessors with a structured interface to review and finalize cases.

The system follows a human-in-the-loop approach: AI-generated results are treated as preliminary observations and are reviewed by a qualified assessor before a case is finalized.

## Key Features

* User authentication with JWT
* Role-based access control
* Separate interfaces for Uploaders, Assessors, and Administrators
* HTP drawing upload and management
* Cloud-based image storage using Cloudinary
* Machine learning-based visual feature extraction
* EfficientNet-based image analysis
* Google Gemini-based interpretation
* RAG and fine-tuning experimentation
* Automated case creation and assignment
* Workload-aware assessor assignment
* Human review and final assessment workflow
* Administrative dashboard and analytics
* Case management and reassignment
* System activity logging
* Docker-based service orchestration

## System Architecture

```text
                         ┌───────────────────┐
                         │       Client      │
                         │     Web Browser   │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  React Frontend   │
                         │                   │
                         │ Role-based UI     │
                         │ Authentication    │
                         │ Case Management   │
                         └─────────┬─────────┘
                                   │
                              REST API
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Node.js / Express │
                         │     Backend       │
                         │                   │
                         │ Authentication    │
                         │ Users             │
                         │ Cases             │
                         │ Drawings          │
                         │ Assignment        │
                         │ Administration    │
                         └──────┬───────┬────┘
                                │       │
                    ┌───────────┘       └────────────┐
                    ▼                                ▼
             ┌─────────────┐                  ┌─────────────┐
             │   MongoDB   │                  │  Cloudinary │
             │   Database  │                  │    Images   │
             └─────────────┘                  └─────────────┘
                               
                                │
                                ▼
                       ┌──────────────────┐
                       │   Python ML API  │
                       │      Flask       │
                       └────────┬─────────┘
                                │
                     ┌──────────┴──────────┐
                     ▼                     ▼
              ┌─────────────┐       ┌─────────────┐
              │ EfficientNet│       │ Google      │
              │ Visual Model│       │ Gemini      │
              └─────────────┘       └─────────────┘
                     │                     │
                     └──────────┬──────────┘
                                ▼
                       Preliminary Analysis
                                │
                                ▼
                         Human Assessor
                                │
                                ▼
                         Final Assessment
```

## Application Workflow

### 1. Authentication

Users authenticate through the web application. JWT-based authentication is used to protect API endpoints and control access based on user roles.

### 2. Drawing Submission

An authorized user uploads an HTP drawing through the React frontend.

The image is sent to the backend using a multipart form request.

### 3. Image Storage

The backend processes the uploaded image and stores it using Cloudinary. Associated metadata is persisted in MongoDB.

### 4. Machine Learning Analysis

The backend communicates with the Python ML service.

The ML service uses an EfficientNet-based model to analyze visual characteristics of the submitted drawing.

### 5. AI Interpretation

The extracted information is passed to the interpretation layer, where Google Gemini generates a preliminary structured interpretation.

The project also contains experimentation with Retrieval-Augmented Generation (RAG) and fine-tuning.

### 6. Case Assignment

A case is created after processing the submission. Cases requiring human review are assigned to assessors using workload-aware assignment logic.

### 7. Human Review

Assessors can access their assigned cases and review:

* Original drawing
* Machine learning observations
* AI-generated interpretation
* Case information

The assessor then provides the final assessment.

### 8. Administration

Administrators can manage users, monitor cases, view analytics, reassign cases, and review system activity.

## Technology Stack

### Frontend

* React.js
* React Router
* Axios
* Bootstrap
* Context API
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt.js
* Multer
* Cloudinary
* Axios
* dotenv

### Machine Learning

* Python
* Flask
* PyTorch
* timm
* EfficientNet
* Google Gemini
* Retrieval-Augmented Generation (RAG)
* Fine-tuning

### Deployment

* Docker
* Docker Compose
* Nginx

## Project Structure

```text
ML-Assisted-HTP-Platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── Dockerfile
│   ├── server.js
│   ├── seeder.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── package.json
│
├── ml-api/
│   ├── models/
│   ├── app.py
│   ├── knowledge_base.txt
│   ├── RAG+finetune.ipynb
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── DOCKER_SETUP.md
├── QUICK_START.md
└── README.md
```

## API

The backend provides REST APIs for authentication, drawing submissions, case management, user management, analytics, and administrative operations.

| Method              | Endpoint                        | Description               |
| ------------------- | ------------------------------- | ------------------------- |
| POST                | `/api/auth/login`               | Authenticate a user       |
| GET                 | `/api/auth/me`                  | Get authenticated user    |
| POST                | `/api/drawings`                 | Submit a drawing          |
| GET                 | `/api/drawings`                 | Retrieve drawings         |
| GET                 | `/api/cases`                    | Retrieve assigned cases   |
| POST                | `/api/cases/:id/review`         | Submit an assessment      |
| GET                 | `/api/admin/analytics`          | Retrieve system analytics |
| GET                 | `/api/admin/cases`              | Retrieve all cases        |
| PUT                 | `/api/admin/cases/:id/reassign` | Reassign a case           |
| GET                 | `/api/admin/logs`               | Retrieve system logs      |
| GET/POST/PUT/DELETE | `/api/users`                    | User management           |

Protected endpoints require a valid JWT bearer token.

## Getting Started

### Prerequisites

The following are required to run the project:

* Docker
* Docker Compose
* Node.js
* Python
* MongoDB / MongoDB Atlas
* Cloudinary account
* Google Gemini API key

### Clone the Repository

```bash
git clone https://github.com/pranjal0sharma/ML-Assisted-HTP-Platform.git

cd ML-Assisted-HTP-Platform
```

### Environment Variables

Create the required environment files for the backend and ML service.

Example backend configuration:

```env
PORT=5001

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ML_API_ENDPOINT=http://ml-api:5002
```

Example ML configuration:

```env
GOOGLE_API_KEY=your_gemini_api_key
```

Do not commit `.env` files or API credentials to the repository.

### Run with Docker

From the project root:

```bash
docker compose up --build
```

The application consists of three primary services:

| Service  | Port |
| -------- | ---: |
| Frontend | 3000 |
| Backend  | 5001 |
| ML API   | 5002 |

The frontend can be accessed at:

```text
http://localhost:3000
```

The backend API runs at:

```text
http://localhost:5001
```

### Stop the Application

```bash
docker compose down
```

To rebuild the containers:

```bash
docker compose up --build
```

## Security

The application implements several security mechanisms:

* JWT-based authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected API routes
* Environment-based configuration
* Controlled cloud image storage
* Separation of application and ML services

For production deployments, additional security measures such as HTTPS, rate limiting, secure secret management, stricter CORS policies, and comprehensive audit controls should be implemented.

## Future Improvements

* Improve ML model accuracy and generalization
* Expand and diversify the HTP dataset
* Add model confidence scores
* Implement explainable AI visualizations
* Improve RAG-based interpretation
* Add automated model evaluation
* Introduce model versioning and monitoring
* Add automated testing
* Implement CI/CD
* Deploy the system to a cloud environment
* Add real-time notifications
* Improve analytics and reporting

## Disclaimer

This platform is intended as an AI-assisted research and decision-support system.

The generated analysis should not be considered a definitive psychological diagnosis or a substitute for assessment by a qualified professional. AI-generated results are intended to assist trained assessors as part of a human-in-the-loop workflow.

## Contributors

This project was developed collaboratively across frontend, backend, machine learning, AI, and deployment components.

## Repository

[GitHub Repository](https://github.com/pranjal0sharma/ML-Assisted-HTP-Platform)
