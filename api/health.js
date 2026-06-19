import connectToDatabase from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test MongoDB connection
    await connectToDatabase();
    
    res.json({ 
      status: 'Server is running', 
      mongodb: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'Server error', 
      mongodb: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
}
