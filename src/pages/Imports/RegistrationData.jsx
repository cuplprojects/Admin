import React, { useEffect, useState } from 'react';

const Registration = ({
  handleFileUpload,
  handleRegistrationUpload,
  selectedFile,
  headers,
  registrationMapping,
  handleRegistrationMappingChange,
  alertMessage,
  alertType,
  loading,
}) => {
  const [isValidData, setIsValidData] = useState(false);

  useEffect(() => {
    // Check if all properties in mapping have a corresponding header in headers
    const isValid = Object.values(registrationMapping).every((value) => headers.includes(value));
    setIsValidData(isValid);
  }, [headers, registrationMapping]);

  return (
    <>
      <div
        className="tab-pane active d-flex align-items-center justify-content-around mt-5 py-3 "
        id="registration"
      >
        <h3 className="head fs-3 text-center">Upload Registration Data</h3>
        <div className="d-flex justify-content-center align-items-center">
          <p>
            <input type="file" onChange={handleFileUpload} accept=".xlsx" />
          </p>
        </div>
        {headers.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
            <table className="table-bordered table">
              <thead>
                <tr>
                  <th>Application Fields</th>
                  <th>Excel Header</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(registrationMapping).map((property) => (
                  <tr key={property}>
                    <td>{property}</td>
                    <td>
                      <select
                        value={registrationMapping[property]}
                        onChange={(e) => handleRegistrationMappingChange(e, property)}
                      >
                        <option value="">Select Header</option>
                        {headers.map((header, index) => (
                          <option key={index} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-center mt-4">
        {selectedFile && (
          <button
            className="btn btn-primary m-auto"
            onClick={handleRegistrationUpload}
            disabled={!isValidData || loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`} role="alert">
          {alertMessage}
        </div>
      )}
    </>
  );
};

export default Registration;
