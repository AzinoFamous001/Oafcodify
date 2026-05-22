// Test script to check if server can start
console.log('Starting server test...');

try {
  const express = require('express');
  const cors = require('cors');
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Simple test endpoint
  app.post('/api/gemini', (req, res) => {
    res.json({ 
      response: 'Test response - server is working!' 
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
  });
  
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
    console.log(`🤖 Gemini endpoint: http://localhost:${PORT}/api/gemini`);
  });
  
} catch (error) {
  console.error('❌ Server error:', error);
}
