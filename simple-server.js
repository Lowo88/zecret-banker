const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Serve the client-side authentication module
app.get('/src/ai/nearAuthClient.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'src', 'ai', 'nearAuthClient.js'));
});

// Basic status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Simple NEAR server is running',
    status: 'operational'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/direct-auth.html to authenticate`);
}); 