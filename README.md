# Exam Trainer AI

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

**Exam Trainer AI** is a full-stack, AI-powered educational platform designed to help students prepare for their exams intelligently. By leveraging OpenAI's cutting-edge models, this application generates customized questions, analyzes answers, and provides interactive feedback to boost learning outcomes.

## ✨ Features
- **AI-Powered Learning sessions:** Interactively study and receive feedback directly driven by OpenAI GPT integrations.
- **Full-Stack Architecture:** Built on an Express/Node backend, featuring Drizzle ORM for robust database management.
- **Modern User Interface:** A snappy front-end constructed using Vite, React, and Tailwind CSS.
- **Dynamic Content:** Images, chats, and training modules are completely dynamic and tailored dynamically via the API.

## 🛠️ Built With
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (with Drizzle ORM)
- **AI Integration:** OpenAI API

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/2k33cse992574/Exam-trainer-ai.git
   cd Exam-trainer-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Create a `.env` file in the root directory and add the following keys to make the app function securely:
   ```env
   DATABASE_URL=your_postgresql_database_url
   AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_api_key
   ```
   *(Note: Never commit your `.env` file!)*

4. Run the development server:
   ```bash
   npm run build
   npm start
   ```

## 📝 License
This project is open-source and available under the MIT License.
