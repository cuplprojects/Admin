// AuditButton.js
import React from 'react';

const AuditButton = () => {
    const handleClick = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/audit/audit');
            const result = await response.json();

            if (Array.isArray(result)) {
                alert(`Audit Flags:\n${result.join('\n')}`);
            } else {
                alert(result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while performing the audit.');
        }
    };

    return (
        <button onClick={handleClick}>Run Audit</button>
    );
};

export default AuditButton;

