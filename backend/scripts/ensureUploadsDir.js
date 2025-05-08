import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the backend directory path
const backendDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(backendDir, 'uploads');

try {
    if (!fs.existsSync(uploadsDir)) { 
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Created uploads directory at:', uploadsDir); 
    } else {
        console.log('ℹ️ Uploads directory already exists at:', uploadsDir);
    }
} catch (error) {
    console.error('❌ Error creating uploads directory:', error.message);
    process.exit(1);
}

fetch('http://localhost:5000/api/tests/process-excel-questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTI1NWM2NDY0ODM4NWE3NWE1OGViMiIsInJvbGUiOiJmYWN1bHR5IiwiZW1haWwiOiJwYXJhczEyMzRAZ21haWwuY29tIiwiaWF0IjoxNzQ2MzAzMjA2LCJleHAiOjE3NDYzODk2MDZ9.b4VpbQMZ_67M7OibA01onFedqCNPECurrce_dRvei6E'
  },
  body: JSON.stringify({
    fileId: '6816eafc3e576918147fc665',
    testId: '681671ab0ddaa27097f378af'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err)); 