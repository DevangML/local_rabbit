# Local CodeRabbit Server

A production-ready Express.js server for the Local CodeRabbit application, providing Git repository analysis and diff viewing capabilities.

## Features

- Git repository management
- Branch comparison and diff analysis
- RESTful API design
- Structured project organization
- Error handling and logging
- Security best practices

## Project Structure

```
server/
├── logs/                  # Log files
├── src/                   # Source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── app.js             # Express app setup
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Dependencies and scripts
├── README.md              # Project documentation
└── server.js              # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Create a `.env` file based on the example provided

### Running the Server

#### Development Mode

```bash
npm run dev
# or
yarn dev
```

#### Production Mode

```bash
npm start
# or
yarn start
```

## API Endpoints

### Repository Management

- `GET /api/repositories` - Get list of repositories
- `POST /api/repository/set` - Set current repository
- `GET /api/repository/branches` - Get branches for current repository
- `GET /api/repository/info` - Get current repository info

### Diff Analysis

- `POST /api/diff` - Get diff between two branches
- `POST /api/diff/analyze` - Analyze diff between two branches

## Environment Variables

| Variable      | Description                      | Default Value          |
|---------------|----------------------------------|------------------------|
| PORT          | Server port                      | 3001                   |
| NODE_ENV      | Environment mode                 | development            |
| CORS_ORIGIN   | Allowed origins for CORS         | http://localhost:3000  |
| LOG_LEVEL     | Logging level                    | info                   |
| GIT_STATE_PATH| Path to Git state file           | .state.json            |
| DB_PATH       | Path to SQLite database          | db.sqlite              |

## License

MIT 