# LabTracker Pro

This is a Next.js application for tracking and managing lab performance with Firebase Support, Analytics, and AI-powered features.

## Features

- **Authentication & User Management**: Secure login/signup with role-based access (Teacher/Student)
- **Course Management**: Create courses, generate join codes, and manage enrollments
- **Performance Tracking**: Record weekly lab marks, quiz scores, viva scores, and attendance
- **Analytics Dashboard**: Visual charts and graphs for student performance analysis
- **AI-Powered Grading**: Intelligent final grade calculation using Google AI
- **Interactive Chatbot**: AI assistant to help with system usage and questions
- **Real-time Data**: Firebase integration for live data synchronization

## Setup Instructions

To run this project on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or a similar package manager
- Google AI API key for AI features

### 1. Install Dependencies

Open your terminal, navigate to the project directory, and install the required packages:

```bash
npm install
```

### 2. Set Up Environment Variables

The project uses Firebase for authentication and Google AI for intelligent features.

1.  **Create a `.env.local` file** in the root of the project by copying the example `.env` file.

    ```bash
    cp .env .env.local
    ```

2.  **Get your Firebase configuration:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Create a new project or select an existing one.
    - In your project's settings (click the gear icon > Project settings), scroll down to the "Your apps" card.
    - Select or create a Web App.
    - Find and copy your web app's configuration object.

3.  **Get your Google AI API key:**
    - Go to [Google AI Studio](https://aistudio.google.com/)
    - Create an API key for Gemini

4.  **Populate `.env.local`:**
    - Open the `.env.local` file you created.
    - Fill in the values from your Firebase configuration and Google AI API key.

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    GOOGLE_GENAI_API_KEY=your-google-ai-api-key
    ```

**Important Note:** The current application code uses mock authentication and data for demonstration purposes (see `src/contexts/auth-context.tsx` and `src/lib/actions.ts`). To use your live Firebase backend, you would need to replace the mock logic with the Firebase SDK.

### 3. Run the Development Server

Once your dependencies are installed and environment variables are set, you can start the development server:

```bash
npm run dev
```

The application will be running at [http://localhost:9002](http://localhost:9002).

### 4. Run AI Development Server (Optional)

To enable AI features in development mode, run the Genkit development server in a separate terminal:

```bash
npm run genkit:dev
```

## Key Scripts

- `npm run dev`: Starts the development server.
- `npm run genkit:dev`: Starts the AI development server.
- `npm run genkit:watch`: Starts the AI development server with file watching.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the codebase.

## Architecture

The application is built with:

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Gemini via Genkit
- **Charts**: Recharts for data visualization
- **State Management**: React Context API

## Key Components

- **Analytics Dashboard**: Visual performance tracking with charts and graphs
- **AI Chatbot**: Interactive assistant for user support
- **Performance Entry**: Streamlined data entry for teachers
- **Student Progress**: Comprehensive progress tracking for students
- **Grade Calculator**: AI-powered intelligent grading system