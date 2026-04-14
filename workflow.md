# Project Workflow & Features

## 🚀 Project Overview
QuickBox is a comprehensive Influencer Marketing SaaS platform designed to bridge the gap between Brands and Influencers. It provides a robust suite of tools for campaign management, AI-driven content creation, real-time communication, and automated financial settlements.

---

## ✨ Key Features

### 1. 📢 Campaign Management
*   **Creation & Discovery**: Tools for brands to launch campaigns and influencers to discover opportunities.
*   **Automation**: Automated workflows for campaign progression.
*   **Analytics**: In-depth performance tracking for both brands and influencers.

### 2. 🤖 AI-Powered Suite
*   **Content Generation**: AI tools for generating posts, captions, and analyzer for content quality.
*   **AI Search**: Intelligent influencer discovery using AI-driven search parameters.
*   **Image Generation**: Native AI image generation for marketing assets.
*   **AILink & Hashtags**: Smart link management and hashtag optimization.

### 3. 💬 Communication & Collaboration
*   **Real-time Chat**: Enterprise-grade messaging system powered by Socket.io.
*   **Group Messaging**: Support for multi-user collaboration threads.
*   **Notifications**: Automated delivery of campaign updates and system alerts.
*   **Bulk Messaging**: Integrated tools for broad outreach via email and SMS.

### 4. 💳 Financial Ecosystem
*   **Multi-Gateway Payments**: Integration with Razorpay, Stripe, and PayPal.
*   **Subscription Management**: Tiered access plans with automated billing and expiry handling.
*   **Earnings Dashboard**: Transparent tracking of payouts and earnings for influencers.
*   **Autopay**: Automated settlement workflows for campaign milestones.

### 5. 📄 Document & Workflow Management
*   **Digital Signatures**: Secure document signing for contracts and agreements.
*   **Automated Reminders**: Intelligent follow-ups for pending actions.
*   **Role-Based Access**: Specialized views for Brands, Influencers, and Administrators.

---

## 🛠 Development Workflow

### 🟢 Backend (FastAPI)
*   **Environment**: Python 3.9+ with FastAPI.
*   **Run Locally**:
    ```bash
    cd backend
    python -m vicorn main:app --reload --port=8000
    ```
*   **Key Patterns**: Modular routing, dependency injection for auth/db, and Socket.io for real-time events.

### 🔵 Frontend (React)
*   **Framework**: React with Vite/CRA.
*   **Run Locally**:
    ```bash
    cd frontend
    npm start
    ```
*   **Styling**: High-fidelity UI with modern aesthetics (Glassmorphism, Dark Mode).

### 📱 Mobile (Expo)
*   **Framework**: React Native / Expo.
*   **Run Locally**:
    ```bash
    cd mobile
    npx expo start
    ```

---

## 🚢 Deployment
*   **Backend**: Hosted on Azure App Service (South India).
*   **Frontend**: Deployed via Azure Web Apps / Static Web Apps.
*   **CI/CD**: GitHub Actions for automated testing and deployment.

---

## 📝 Coding Standards
*   **UI/UX**: Prioritize "Premium Aesthestics". Use vibrant colors, smooth transitions, and responsive layouts.
*   **Backend**: Clean, documented API endpoints with proper error handling and Pydantic validation.
*   **Reliability**: Ensure socket connections are stable and data persistence is prioritized.
