# Git Mastery

A comprehensive platform for learning Git and GitHub through interactive tutorials, hands-on exercises, and real-world simulations.

## Features

- Interactive Git Tutorials
- Practice Exercises
- AI-powered Learning Assistant
- User Authentication
- Progress Tracking
- Responsive Design

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd git-mastery
```

2. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
- Create `.env` file in the server directory
- Add required environment variables (see `.env.example`)

4. Start the development servers:
```bash
# Start backend server
cd server
npm run dev

# Start frontend server (in a new terminal)
cd client
npm start
```

## Project Structure

```
git-mastery/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── hooks/
│   └── public/
└── server/             # Backend Node.js application
    ├── src/
    │   ├── routes/
    │   ├── models/
    │   ├── middleware/
    │   └── utils/
    └── config/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 