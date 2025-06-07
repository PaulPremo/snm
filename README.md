# Express.js Authentication and Profile App with MongoDB

This is a basic web application built with Express.js, Handlebars for templating, and MongoDB for user data storage. It provides user registration, login, profile viewing, and basic protected routes.

## Features

* **User Registration:** Allows new users to create an account by providing their name, email, password (with confirmation), favorite genres, and tags. Includes basic email format and password complexity validation.
* **User Login:** Enables registered users to log in using their email and password.
* **Password Hashing:** Uses `bcryptjs` to securely hash user passwords before storing them in the database.
* **JWT Authentication:** Implements JSON Web Tokens (JWT) for user session management. Upon successful login, a JWT is generated and stored as an HTTP-only cookie.
* **Protected Routes:** Includes middleware (`authenticateToken`) to secure specific routes, requiring a valid JWT cookie to access.
* **Profile Page:** A protected route (`/protected/profilo`) that displays basic user information retrieved from cookies.
* **Basic Home and Playlist Pages:** Simple protected routes (`/protected/home`, `/protected/playlist`).
* **Logout:** Clears all cookies, effectively logging the user out and redirecting them to the home page.
* **Environment Variables:** Utilizes `dotenv` to manage sensitive information like database URLs, JWT secret, and Spotify API credentials.
* **Handlebars Templating:** Uses Express Handlebars for dynamic HTML rendering.
* **Cookie Parser:** Employs `cookie-parser` middleware to handle HTTP cookies.
* **Caching Disabled:** Includes middleware to prevent client-side caching of all routes.

## Technologies Used

* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web application framework for Node.js.
* **Handlebars:** Templating engine for dynamic HTML.
* **MongoDB:** NoSQL database for storing user data.
* **`mongodb`:** Node.js driver for MongoDB.
* **`dotenv`:** Loads environment variables from a `.env` file.
* **`bcryptjs`:** Library for hashing passwords.
* **`jsonwebtoken`:** Library for generating and verifying JWTs.
* **`cookie-parser`:** Middleware for parsing HTTP cookies.
* **`express-handlebars`:** Handlebars view engine for Express.

## Prerequisites

* **Node.js** (version >= 14 recommended)
* **npm** or **yarn** (Node.js package managers)
* **MongoDB** installed and running (you'll need a MongoDB connection URL)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_REPOSITORY_DIRECTORY>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create a `.env` file** in the root directory and configure your environment variables:
    ```
    URL_DB=YOUR_MONGODB_CONNECTION_URL
    DB_NAME=YOUR_DATABASE_NAME
    CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID (optional, if you plan to use Spotify features)
    CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET (optional, if you plan to use Spotify features)
    JWT_SECRET=YOUR_SECRET_JWT_KEY
    PORT=YOUR_DESIRED_PORT (e.g., 3000)
    ```
    **Important:** Replace the placeholder values with your actual MongoDB connection URL, database name, Spotify API credentials (if needed), a strong secret key for JWT, and the port you want the server to run on.

4.  **Run the application:**
    ```bash
    npm start
    # or
    yarn start
    ```

    The server should now be running at `http://localhost:<YOUR_DESIRED_PORT>`.

## Usage

* Navigate to `http://localhost:<YOUR_DESIRED_PORT>/register` in your browser to register a new user.
* Go to `http://localhost:<YOUR_DESIRED_PORT>/login` to log in with your registered credentials.
* After successful login, you will be redirected to the home page (`/protected/home`).
* Access your profile page at `http://localhost:<YOUR_DESIRED_PORT>/protected/profilo`.
* Visit the playlist page at `http://localhost:<YOUR_DESIRED_PORT>/protected/playlist`.
* Click the logout link (usually on a protected page) to clear your session.

## Directory Structure

├── .env
├── public/
│   └── ... (static files like CSS, JavaScript)
├── routes/
│   ├── playlist.js
│   └── user.js
├── views/
│   ├── layouts/
│   │   ├── index_auth.hbs
│   │   └── index_noauth.hbs
│   ├── partials/
│   │   └── ... (reusable Handlebars components)
│   ├── home.hbs
│   ├── login.hbs
│   ├── playlist.hbs
│   ├── profilo.hbs
│   └── register.hbs
├── app.js
├── package.json
