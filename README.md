# LabTracker Pro

This is a Next.js application for tracking and managing lab performance, built within Firebase Studio.

## Setup Instructions

To run this project on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or a similar package manager

### 1. Install Dependencies

Open your terminal, navigate to the project directory, and install the required packages:

```bash
npm install
```

### 2. Set Up Environment Variables

The project uses Firebase for authentication and other services. You will need to connect it to your own Firebase project.

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

3.  **Populate `.env.local`:**
    - Open the `.env.local` file you created.
    - Fill in the values from your Firebase configuration. The keys should start with `NEXT_PUBLIC_`.

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```

**Important Note:** The current application code uses mock authentication and data for demonstration purposes (see `src/contexts/auth-context.tsx` and `src/lib/actions.ts`). To use your live Firebase backend, you would need to replace the mock logic with the Firebase SDK. I can help with that when you're ready!

### 3. Run the Development Server

Once your dependencies are installed and environment variables are set, you can start the development server:

```bash
npm run dev
```

The application will be running at [http://localhost:9002](http://localhost:9002).

## Key Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the codebase.
