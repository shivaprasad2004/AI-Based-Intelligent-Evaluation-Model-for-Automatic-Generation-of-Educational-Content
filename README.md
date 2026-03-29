# AI-Based Intelligent Evaluation Model for Automatic Generation of Educational Content

An advanced AI-driven adaptive learning platform that generates educational content, provides intelligent evaluation, and tracks student progress. Built with a Flask backend and a modern React frontend, this platform leverages state-of-the-art AI models (Gemini, Claude, OpenAI, Groq) to provide personalized learning experiences.

## 🚀 Key Features

- **AI Content Generation**: Automatically generates questions and educational content for any topic using multiple AI providers.
- **Adaptive Learning Engine**: Dynamically adjusts question difficulty based on student performance.
- **Intelligent Evaluation**: Provides detailed feedback and scoring for both multiple-choice and written exams.
- **Comprehensive Analytics**: Tracks student streaks, progress, and performance across various topics.
- **Interactive Dashboards**: Separate dashboards for students and educators to monitor progress and manage content.
- **Real-time Chatbot**: AI-powered assistant to help students with their queries.
- **Global Leaderboard**: Gamified learning experience with student rankings.
- **Secure Authentication**: JWT-based secure login and registration system.

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask
- **Database**: SQLAlchemy (SQLite/PostgreSQL)
- **Authentication**: Flask-JWT-Extended
- **AI Models**: Google Gemini, Anthropic Claude, OpenAI GPT, Groq
- **Rate Limiting**: Flask-Limiter
- **Logging**: Custom logging system

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Viz**: Recharts
- **State Management**: React Context API
- **Networking**: Axios

## 📂 Project Structure

```text
.
├── backend/                # Flask API
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── services/           # Core logic & AI integration
│   ├── utils/              # Helper functions
│   ├── app.py              # Application entry point
│   └── config.py           # Configuration settings
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI & shared components
│   │   ├── pages/          # Application views
│   │   ├── context/        # State management
│   │   └── services/       # API interaction
│   └── vite.config.js      # Vite configuration
└── README.md               # Project documentation
```

## ⚙️ Installation & Setup

### 1. Clone the Repository
Clone the project to your local machine using the following command:
```bash
git clone https://github.com/shivaprasad2004/AI-Based-Intelligent-Evaluation-Model-for-Automatic-Generation-of-Educational-Content.git
cd AI-Based-Intelligent-Evaluation-Model-for-Automatic-Generation-of-Educational-Content
```

### 2. Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### 3. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env` (copy from `.env.example` if available):
   ```env
   FLASK_APP=app.py
   FLASK_ENV=development
   DATABASE_URL=sqlite:///app.db
   JWT_SECRET_KEY=your_secret_key
   GEMINI_API_KEY=your_gemini_key
   AI_PROVIDER=gemini  # Choose from gemini, claude, openai, groq, mock
   ```
5. Run the application:
   ```bash
   flask run
   ```

### 4. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Backend Deployment (Render, Railway, or Docker)
The backend is ready to be deployed as a Docker container or directly using Gunicorn.

1.  **Environment Variables**: Set all keys from your `.env` in your deployment platform's settings.
2.  **Database**: For production, it's recommended to use a managed PostgreSQL database. Set `DATABASE_URL` to your PostgreSQL connection string.
3.  **Command**: If not using Docker, use the following command:
    ```bash
    gunicorn --bind 0.0.0.0:5000 "app:create_app()"
    ```

### Frontend Deployment (Vercel, Netlify, or Firebase)
The frontend can be deployed as a static site.

#### Vercel/Netlify
1.  **Build Command**: `npm run build`
2.  **Output Directory**: `dist`
3.  **Environment Variables**: Set `VITE_API_URL` to your deployed backend API URL.

#### Firebase Hosting
1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize (if not already): `firebase init hosting` (Select `dist` as public directory, configure as SPA).
4.  Build the project: `npm run build`
5.  Deploy: `firebase deploy`

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by [Shiva Prasad](https://github.com/shivaprasad2004)
