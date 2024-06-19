// src/AuditPage.js
import React, { useState } from 'react';
import axios from 'axios';

function Audit() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAudit = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/audit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data.message);
    } catch (error) {
      setResult('Error occurred during the audit.');
    }
  };

  return (
    <div>
      <h1>Audit Page</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleAudit}>Audit</button>
      {result && <p>{result}</p>}
    </div>
  );
}

export default Audit;
