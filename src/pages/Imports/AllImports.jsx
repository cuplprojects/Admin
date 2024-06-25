import React, { useState } from 'react';
// import './Import.css';
// import OMRImages from './OMRImages';
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
 
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    district: '',
    centerCode: '',
    bookletCode: '',
    status: '',
    name: '',
    projectId: '',
    rollNo: ''
  });
  const [registrationMapping, setRegistrationMapping] = useState({
    rollNo: ''
  });


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


 

  const handleAbsenteeUpload = async () => {
    if (selectedFile) {
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
            rowData[property] = String(row[index]);
          }
          return rowData;
        });

        console.log('Mapped Data:', mappedData);

        try {
          const response = await fetch(`${apiurl}/Absentee/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappedData), // Send the mappedData array directly
          });
          const data = await response.json();
          console.log('Response from server:', data);
        } catch (error) {
          console.error('Error uploading data:', error);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } else {
      console.error('No file selected.');
    }

    setSelectedFile(null); // Reset selected file after upload
  };


  const handleScannedUpload = () => {
    console.log('Uploading file:', selectedFile);

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const content = event.target.result;
        const rows = content.split('\n').map((row) => row.split(','));

        // Assuming the first row contains headers
        const headers = rows[0].map((header) => header.trim().replace(/"/g, '')); // Clean up headers
        const parsedData = rows.slice(1).map((row) => {
          const rowData = {};
          row.forEach((value, index) => {
            const cleanedValue = value.trim().replace(/"/g, ''); // Clean up values
            rowData[headers[index]] = cleanedValue;
          });

          // Process ANS field separately to create a nested object
          if (rowData['ANS']) {
            const answers = {};
            const ansArray = rowData['ANS'].split('');

            // Ensure we have 100 entries, filling in with empty strings if necessary
            for (let i = 0; i < 100; i++) {
              if (i < ansArray.length) {
                answers[i + 1] = `'${ansArray[i]}'`;
              } else {
                answers[i + 1] = "''"; // Fill remaining slots with empty strings
              }
            }

            rowData['answers'] = JSON.stringify(answers).replace(/"/g, '');
            delete rowData['ANS']; // Remove the original ANS field
          }

          return rowData;
        });

        console.log('Parsed data:', parsedData);

        try {
          const response = await fetch(`${apiurl}/OMRData/uploadcsv`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedData),
          });
          const data = await response.json();
          console.log('Response from server:', data);
        } catch (error) {
          console.error('Error uploading data:', error);
        }
      };

      reader.readAsText(selectedFile);
    } else {
      console.error('No file selected.');
    }



    setSelectedFile(null); // Reset selected file after upload
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
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const mappedData = jsonData.map((item) => {
          console.log(item)
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
        } catch (error) {
          console.error('Error uploading registration data:', error);
        }
      };

      reader.readAsBinaryString(selectedFile);
    } else {
      console.error('No file selected.');
    }
  };



  const handleMappingChange = (e, property) => {
    setMapping({
      ...mapping,
      [property]: e.target.value
    });
  };


  return (
    <div>
      <section style={{height:"70vh"}} className=' container-fluid pb-4 border border-2 rounded'>
        <div className="container">
          <div className="row">
            <div className="board-pq">
              <div className="">
                <ul className="d-flex align-items-center justify-content-around my-4" id="myTab">
                  <li style={{border:`2px solid ${colorPrimary}`}} className='tabcircle' onClick={() => {setActivetab('OMRImages');setSelectedFile(null);}}>
                    <a  data-toggle="tab" title="welcome">
                      <span className="round-tabs-pq one-pq">
                        <i className="fa-regular fa-image " style={{color:colorPrimary}}></i>
                      </span>
                    </a>
                  </li>
                  <span  className='tabline'></span>
                  <li style={{border:`2px solid ${colorPrimary}`}} className='tabcircle' onClick={() => {setActivetab('scanned'); setSelectedFile(null);}}>
                    <a data-toggle="tab" title="scanned">
                      <span className="round-tabs-pq two-pq">
                        <i className="fa-solid fa-file-csv" style={{color:colorPrimary}}></i>
                      </span>
                    </a>
                  </li>
                  <span className='tabline'></span>
                  <li style={{border:`2px solid ${colorPrimary}`}} className='tabcircle' onClick={() => {setActivetab('registration'); setSelectedFile(null); setHeaders([])}}>
                    <a  data-toggle="tab" title="registration">
                      <span className="round-tabs-pq three-pq">
                        <i className="fa-regular fa-id-card" style={{color:colorPrimary}}></i>
                      </span>
                    </a>
                  </li>
                  <span className='tabline'></span>
                  <li style={{border:`2px solid ${colorPrimary}`}} className='tabcircle' onClick={() =>  { setActivetab('absentee'); setSelectedFile(null); setHeaders([])}}>
                    <a  data-toggle="tab" title="absentee">
                      <span className="round-tabs-pq four-pq ">
                        <i className="fa-solid fa-file-excel" style={{color:colorPrimary}} ></i>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="tab-content-pq">
                {activetab === 'OMRImages' && <ImportOmr />}
                {activetab === 'scanned' && <Scanned handleFileUpload={handleFileUpload} handleScannedUpload={handleScannedUpload} selectedFile={selectedFile} />}
                {activetab === 'registration' && <Registration handleFileUpload={handleFileUpload} handleRegistrationUpload={handleRegistrationUpload} selectedFile={selectedFile} headers={headers} registrationMapping={registrationMapping} handleRegistrationMappingChange={handleRegistrationMappingChange} />}
                {activetab === 'absentee' && (
                  <Absentee
                    handleFileUpload={handleFileUpload}
                    handleAbsenteeUpload={handleAbsenteeUpload}
                    selectedFile={selectedFile}
                    headers={headers}
                    mapping={mapping}
                    handleMappingChange={handleMappingChange}
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
