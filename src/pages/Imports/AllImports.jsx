import React, { useState, useEffect } from 'react';
import Scanned from './ScannedData';
import Registration from './RegistrationData';
import Absentee from './Absentee';
import * as XLSX from 'xlsx';
import axios from 'axios';
import FileUploadComponent from './FileUploadComponent';
import './style.css'
import { useThemeToken } from '@/theme/hooks';
import { color } from 'framer-motion';
import ImportOmr from './OmrImport/ImportOmr';

//const apiurl = import.meta.env.VITE_API_URL_PROD;
const apiurl = import.meta.env.VITE_API_URL;

const Import = () => {
  const { colorPrimary } = useThemeToken();
  const [activetab, setActivetab] = useState('OMRImages');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [mapping, setMapping] = useState([]);
  const [registrationMapping, setRegistrationMapping] = useState({
    rollNo: ''
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [fieldNamesArray, setFieldNamesArray] = useState([]);


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && activetab === 'OMRImages') {
      console.log('Files uploaded:', e.target.files);
      setSelectedFile(file);

    } else if (file && ['scanned', 'registration', 'absentee'].includes(activetab)) {
      if (activetab === 'scanned' && (file.type === 'text/csv' || file.type === 'application/dat')) {
        console.log('File uploaded:', file);
        setSelectedFile(file);

      } else if ((activetab === 'registration' || activetab === 'absentee') && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        console.log('File uploaded:', file);
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const excelHeaders = jsonData[0];
          setHeaders(excelHeaders);
        };
        reader.readAsArrayBuffer(file);
      } else {
        console.error('Invalid file format:', file.type);
      }
    } else {
      console.error('No file selected or unsupported tab:', activetab);
    }
  };


  useEffect(() => {
    // Fetch mapping fields from backend
    const fetchMappingFields = async () => {
      try {
        const response = await fetch(`${apiurl}/Absentee/absentee/mapping-fields?WhichDatabase=Local`);
        const data = await response.json();
        
        // Transform array data into object format
        const initialMapping = data.reduce((acc, field) => {
          acc[field.toUpperCase()] = '';
          return acc;
        }, {});

        setMapping(initialMapping);
      } catch (error) {
        console.error('Error fetching mapping fields:', error);
      }
    };
    fetchMappingFields();
  }, []);

  
  const handleAbsenteeUpload = async () => {
    if (selectedFile) {
      setLoading(true);
      const reader = new FileReader();

      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const rows = jsonData.slice(1); // Exclude headers
        const mappedData = rows.map(row => {
          const rowData = {};
          for (let property in mapping) {
            const header = mapping[property];
            const index = jsonData[0].indexOf(header);
            // Ensure the value is converted to string before assigning
            rowData[property] = index !== -1 ? String(row[index]) : ''; 
          }
          return rowData;
        });

        console.log('Mapped Data:', mappedData);

        try {

          const response = await fetch(`${apiurl}/Absentee/upload?WhichDatabase=Local`, {


            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappedData), // Send the mappedData array directly
          });
          const data = await response.json();
          console.log('Response from server:', data);
          setAlertMessage('Upload successful!');
          setAlertType('success');
        } catch (error) {
          console.error('Error uploading data:', error);
          setLoading(false);
          setAlertMessage('Error uploading data.');
          setAlertType('danger');
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } else {
      console.error('No file selected.');
      setAlertMessage('No file selected.');
      setAlertType('warning');
    }

    setSelectedFile(null); // Reset selected file after upload
    setLoading(false);
  };

  useEffect(() => {
    if (activetab === "scanned") {
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const rows = content.split('\n').map(row => row.split(','));
          const headersFromFile = rows[0].map(header => header.trim().replace(/"/g, ''));
          setHeaders(headersFromFile);
        };
        reader.readAsText(selectedFile);
      }
    }

  }, [selectedFile]);

  useEffect(() => {
    // Fetch field mappings from the backend
    const fetchFieldMappings = async () => {
      try {
        const response = await fetch(`${apiurl}/FieldConfigurations?WhichDatabase=Local`);
        if (!response.ok) {
          throw new Error('Failed to fetch field mappings');
        }
        const data = await response.json();
        console.log(data)
        const mappings = data.map((item) => ({
          field: item.fieldAttributes[0].field

        }));

        mappings.push({ field: "Answers" });
        mappings.push({ field: "Barcode" });
        mappings.push({ field: "NCS" });

        console.log(mappings)
        setFieldMappings(mappings.reduce((acc, current) => ({ ...acc, [current.field]: current }), {}));
      } catch (error) {
        console.error('Error fetching field mappings:', error);
      }
    };
    fetchFieldMappings();
  }, []);

  const handleFieldMappingChange = (e, field) => {
    setFieldMappings((prevMappings) => ({ ...prevMappings, [field]: e.target.value }));
  };


  const handleScannedUpload = async () => {
    if (selectedFile) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        const rows = content.split('\n').map((row) => row.split(','));
        const headers = rows[0].map((header) => header.trim().replace(/"/g, ''));
        const mappingObject = {};

        headers.forEach((header) => {
          const matchingField = Object.keys(fieldMappings).find(key => fieldMappings[key] === header);
          if (matchingField) {
            mappingObject[header] = matchingField;
          } else {
            console.warn(`No matching field found for header "${header}"`);
          }
        });

        const parsedData = rows.slice(1, -1).map((row) => {
          const rowData = {};
          row.forEach((value, index) => {
            const cleanedValue = value.trim().replace(/"/g, '');
            const matchingField = mappingObject[headers[index]];
            if (matchingField) {
              rowData[matchingField] = cleanedValue;
            }
          });

          if (rowData['Answers']) {
            const answers = {};
            const ansArray = rowData['Answers'].split('');
            for (let i = 0; i < 100; i++) {
              if (i < ansArray.length) {
                answers[i + 1] = `'${ansArray[i]}'`;
              } else {
                answers[i + 1] = "''";
              }
            }
            rowData['Answers'] = JSON.stringify(answers).replace(/"/g, '');
          }

          return rowData;
        });
        console.log(parsedData)
        try {
          const response = await fetch(`${apiurl}/OMRData/uploadcsv?WhichDatabase=Local`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedData),
          });
          const contentType = response.headers.get('content-type');

          if (contentType && contentType.indexOf('application/json') !== -1) {
            const data = await response.json();
            console.log('Response from server:', data);
            setAlertMessage('Upload successful!');
            setAlertType('success');
          } else {
            const text = await response.text();
            console.log('Response from server:', text);
            setAlertMessage('Upload successful!');
            setAlertType('success');
          }

        } catch (error) {
          console.error('Error uploading data:', error);
          setAlertMessage('Error uploading data.');
          setAlertType('danger');
        } finally {
          setLoading(false);

          setSelectedFile(null); // Reset selected file after upload
        }
      };
      reader.readAsText(selectedFile);
    } else {
      console.error('No file selected.');
      setAlertMessage('No file selected.');
      setAlertType('warning');
      setLoading(false);
    }

  };

  const handleRegistrationMappingChange = (e, property) => {
    setRegistrationMapping({
      ...registrationMapping,
      [property]: e.target.value
    });
  };


  const handleRegistrationUpload = async (event) => {
    event.preventDefault();
  
    if (selectedFile) {
      setLoading(true);
      const reader = new FileReader();
  
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
  
        const mappedData = jsonData.map((item) => {
          // console.log(item)
          let mappedItem = {
            "rollNumber": item[registrationMapping.rollNo].toString(),
            "registrationsData": JSON.stringify(item).replace(/\"/g, "'"), // Assuming item already contains the desired structure
          };
  
          // console.log(mappedItem);
          return mappedItem;
        });
  
        try {
          const response = await axios.post(`${apiurl}/Registration?WhichDatabase=Local`, mappedData);
  
          console.log('Registration data uploaded successfully:', response.data);
          setAlertMessage('Upload successful!');
          setAlertType('success');
        } catch (error) {
          console.error('Error uploading registration data:', error);
          setAlertMessage('Error uploading data.');
          setAlertType('danger');
        } finally {
          setLoading(false);
        }
      };
  
      reader.readAsBinaryString(selectedFile);
    } else {
      console.error('No file selected.');
      setAlertMessage('No file selected.');
      setAlertType('warning');
      setLoading(false);
    }
  };
  



  const handleMappingChange = (e, property) => {
    setMapping((prevMapping) => ({
      ...prevMapping,
      [property]: e.target.value  || ''
    }));
  };
  console.log(mapping)


  return (
    <div>

      <section style={{ minHeight: "70vh" }} className=' container-fluid pb-4 border border-2 rounded'>
        <div className="container">
          <div className="row">
            <div className="board-pq">
              <div className="">
                <ul className="d-flex align-items-center justify-content-around my-4" id="myTab">
                  <li style={{ border: `2px solid ${colorPrimary}` }} className='tabcircle' onClick={() => { setActivetab('OMRImages'); setSelectedFile(null); }}>
                    <a data-toggle="tab" title="OMR Images">
                      <span className="round-tabs-pq one-pq">
                        <i className="fa-regular fa-image " style={{ color: colorPrimary }}></i>
                      </span>
                    </a>
                  </li>
                  <span className='tabline'></span>

                  <li style={{ border: `2px solid ${colorPrimary}` }} className='tabcircle' onClick={() => { setActivetab('scanned'); setSelectedFile(null); setAlertMessage(null); setAlertType(null); setHeaders([]); }}>
                    <a data-toggle="tab"  title="Scanned Data" >

                      <span className="round-tabs-pq two-pq">
                        <i className="fa-solid fa-file-csv" style={{ color: colorPrimary }}></i>
                      </span>
                    </a>
                  </li>
                  <span className='tabline'></span>

                  <li style={{ border: `2px solid ${colorPrimary}` }} className='tabcircle' onClick={() => { setActivetab('registration'); setSelectedFile(null); setHeaders([]); setAlertMessage(null);setAlertType(null); }}>
                    <a data-toggle="tab" title="Registration Data">
         <span className="round-tabs-pq three-pq">
                        <i className="fa-regular fa-id-card" style={{ color: colorPrimary }}></i>
                      </span>
                    </a>
                  </li>
                  <span className='tabline'></span>

                  <li style={{ border: `2px solid ${colorPrimary}` }} className='tabcircle' onClick={() => { setActivetab('absentee'); setSelectedFile(null); setHeaders([]); setAlertMessage(null);setAlertType(null); }}>
                    <a data-toggle="tab" title="Absentee Data">

                      <span className="round-tabs-pq four-pq ">
                        <i className="fa-solid fa-file-excel" style={{ color: colorPrimary }} ></i>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="tab-content-pq">
                {fieldNamesArray.map((item) => {
                  console.log(item.field)
                })}
                {activetab === 'OMRImages' && <ImportOmr />}
                {activetab === 'scanned' &&
                  <Scanned
                    handleFileUpload={handleFileUpload}
                    handleScannedUpload={handleScannedUpload}
                    selectedFile={selectedFile}
                    alertMessage={alertMessage}
                    alertType={alertType}
                    loading={loading}
                    headers={headers}
                    fieldMappings={fieldMappings}
                    handleFieldMappingChange={handleFieldMappingChange}
                  />}
                {activetab === 'registration' &&
                  <Registration
                    handleFileUpload={handleFileUpload}
                    handleRegistrationUpload={handleRegistrationUpload}
                    selectedFile={selectedFile}
                    alertMessage={alertMessage}
                    alertType={alertType}
                    headers={headers}
                    registrationMapping={registrationMapping}
                    handleRegistrationMappingChange={handleRegistrationMappingChange}
                    loading={loading}
                  />}
                {activetab === 'absentee' && (
                  <Absentee
                    handleFileUpload={handleFileUpload}
                    handleAbsenteeUpload={handleAbsenteeUpload}
                    selectedFile={selectedFile}
                    alertMessage={alertMessage}
                    alertType={alertType}
                    headers={headers}
                    mapping={mapping}
                    handleMappingChange={handleMappingChange}
                    loading={loading}
                  />)}
                <div className="clearfix-pq"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

};

export default Import;
