const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');

// Import your route handlers and middleware
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const notificationRoutes = require('./src/routes/notificationRoute');
const loggerMiddleware = require('./src/middleware/loggerMiddleware');

app.use(cors());

// Current index of backend server for round-robin
let currentIndex = -1;

// List of backend servers
let servers = [];

// Function to add a new backend server
function addServer(port) {
    const server = express();

    // Set up CORS middleware


    server.use(express.json());
    server.use(loggerMiddleware);

    server.get('/', (req, res) => {
        res.send('This is backend');
    });
    server.use('/api', authRoutes);
    server.use('/users', userRoutes);
    server.use('/notifications', notificationRoutes);

    server.listen(port, () => {
        console.log(`Backend Server running on port ${port}`);
    });

    servers.push(`http://localhost:${port}`);
}

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});


// Function to remove a backend server
function removeServer(port) {
    servers = servers.filter(server => server !== `http://localhost:${port}`);
    currentIndex = currentIndex >= servers.length ? 0 : currentIndex;
  }
  
  // Function to get the next backend server using round-robin
  function getNextServer() {
    if (servers.length === 0) {
      return null;
    }
    currentIndex = (currentIndex + 1) % servers.length;
    return servers[currentIndex];
  }
  
  // Log requests
  app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
  });
  
  // Handler for incoming requests
  app.get('*', async (req, res) => {
    // Get next backend server using round-robin
    const server = getNextServer();
  
    if (!server) {
      res.status(500).send('No available backend servers');
      return;
    }
  
    // Forward request
    try {
      const result = await axios.get(server + req.url);
      res.status(result.status).send(result.data);
    } catch (err) {
      res.status(500).send('Failed to connect to backend');
    }
  });
  
  const PORT = 8088;
  app.listen(PORT, () => {
    console.log('Load balancer running on port 8080');
  });
  
  // Add backend servers dynamically

  addServer(8083);
  addServer(8086);
  addServer(8089);
  
  // Example: Remove a server after some time (e.g., after 30 seconds)
  setTimeout(() => {
    removeServer(8088);
  }, 30000);
  