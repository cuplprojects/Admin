import React, { useEffect, useState } from 'react';

const Registration = ({ handleFileUpload, handleRegistrationUpload, selectedFile, headers, registrationMapping, handleRegistrationMappingChange,alertMessage,
  alertType,loading }) => {
  const [isValidData, setIsValidData] = useState(false);

  useEffect(() => {
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.values(registrationMapping).every(value => headers.includes(value));
    setIsValidData(isValid);
  }, [headers, registrationMapping]);

  return (
    <div className="tab-pane active" id="registration">
      <h3 className="head text-center">Upload Registration Data</h3>
      <div className="d-flex justify-content-center mt-4">
        <p>
          <input type="file" onChange={handleFileUpload} accept=".xlsx" />
        </p>
      </div>
      {headers.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Model Property</th>
                <th>Excel Header</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(registrationMapping).map((property) => (
                <tr key={property}>
                  <td>{property}</td>
                  <td>
                    <select value={registrationMapping[property]} onChange={(e) => handleRegistrationMappingChange(e, property)}>
                      <option value="">Select Header</option>
                      {headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="d-flex justify-content-center mt-4">{
        selectedFile &&
        <button className="btn btn-primary" onClick={handleRegistrationUpload} disabled={!isValidData || loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>}
        {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
      </div>
    </div>
  );
};

export default Registration;
