# Spott - Road Alert & Hangout Finder

Spott is a full-stack web application designed for the community to share real-time road-related alerts, discover new hangout places, and stay informed about their surroundings. Modeled with a Reddit-style user interface, Spott allows users to report incidents like Police Alerts or Accidents natively tied to geolocations, while also sharing hidden viewpoints, safe couple spots, cafes, or just random interesting locations.

## Features ✨

*   **Real-time Geolocation Mapping:** Every post includes precise coordinates. Discover posts near you using Leaflet.js interactive maps.
*   **Automatic Reverse Geocoding:** Spott automatically translates your map clicks or device location into a readable real-world location name.
*   **Diverse Post Categories:** Tag your spots with context—Police Alert, Accident, Viewpoint, Picnic, Couple Safe, Cafe, or Random.
*   **Reddit-Style Upvotes & Downvotes:** The community curates the best (and most reliable) spots and alerts through an intuitive voting system.
*   **Trust Score:** Users build credibility (Trust Score) based on how the community receives their shared posts via upvotes and activity.
*   **Secure Authentication:** JWT-powered authentication ensures that posts, interactions, and reporting remain secure within our community.
*   **Bookmarking & Saving:** Keep track of cool hangouts or important alerts by saving posts directly to your profile.
*   **Cloudinary Integration:** Seamless and reliable image uploads for users to provide visual proof and context to their alerts and hangouts.
*   **Community Moderation:** Built-in reporting mechanism helps flag unreliable or inappropriate posts to maintain community standards.

## Tech Stack 🛠️

**Frontend:**
*   **Framework:** React 19 (via Vite)
*   **Styling:** Tailwind CSS v4 for clean, responsive, modern UIs
*   **Maps:** Leaflet & React-Leaflet
*   **Routing:** React Router DOM v7
*   **Icons:** Lucide React

**Backend:**
*   **Environment:** Node.js & Express.js
*   **Database:** MongoDB & Mongoose (utilizing `2dsphere` indexes for scalable geospatial queries)
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt
*   **File Storage:** Multer & Cloudinary

## Getting Started 🚀

### Prerequisites
Make sure you have Node.js and MongoDB installed on your system.

### Installation

1.  **Clone the Repository** (If applicable):
    ```bash
    git clone https://github.com/your-username/Spott.git
    cd Spott
    ```

2.  **Environment Setup**:
    You will need to create `.env` files for both the frontend and backend.
    
    *   **Backend (`/server/.env`)**:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINARY_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        ```
    *   **Frontend (`/frontend/.env`)**:
        ```env
        VITE_API_URL=http://localhost:5000/api
        ```

3.  **Install Dependencies**:
    Open two terminal windows/tabs to install dependencies for both the client and the server.
    
    *   **Server**:
        ```bash
        cd server
        npm install
        ```
    *   **Frontend**:
        ```bash
        cd frontend
        npm install
        ```

### Running the Application Locally

1.  **Start the Backend Server**:
    In the `server` directory, run:
    ```bash
    npm run dev
    ```
    This will start the Express backend at `http://localhost:5000`.

2.  **Start the Frontend Client**:
    In the `frontend` directory, run:
    ```bash
    npm run dev
    ```
    This will spin up Vite's dev server, typically on `http://localhost:5173`.

## Architecture & API Outline 🌐

### Core Data Models
*   **User:** Manages authentication, profile basic data (name, email, profile image), saved posts.
*   **Post:** Stores all the action. Image link, geographic coordinates (Lat/Lng), Location Name, Categories, Upvotes, Downvotes, Comments, and Report flags. Spatial indexing via `2dsphere` ensures rapid search within particular map boundaries.

### Core API Routes (Examples)
*   `POST /api/auth/register` & `/api/auth/login`
*   `GET /api/posts` (Supports geographic boundary queries and feed fetching)
*   `POST /api/posts` (Upload images via Cloudinary + store location data)
*   `PUT /api/posts/:id/upvote` & `:id/vote`
*   `POST /api/posts/:id/comment`

## Contributing 🤝
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## License 📝
This project is open-source and available under the ISC License.
