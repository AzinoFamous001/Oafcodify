const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Oafcodify Backend Server...');

const serverPath = path.join(__dirname, 'src', 'Backend', 'Server', 'server.js');
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

console.log('📝 Server logs will appear below...');
console.log('🤖 Gemini API endpoint: http://localhost:5000/api/gemini');
console.log('🏥 Health check: http://localhost:5000/api/health');
