import React, { useEffect, useState } from 'react';
import { Col, Row, Card } from 'react-bootstrap';
import { Button, notification } from 'antd';
import ChartComponent from './ChartComponent';
import { useProjectId } from '@/store/ProjectState';

const APIURL = import.meta.env.VITE_API_URL;

const AuditButton = () => {
  const [fieldConfigs, setFieldConfigs] = useState([]);
  const [flags, setFlags] = useState([]);
  const [remarksCounts, setRemarksCounts] = useState([]);
  const [corrected, setCorrected] = useState(0);

  const [remaining, setRemaining] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const ProjectId = useProjectId();
  const [wip, setWip] = useState(0)
  
  useEffect(() => {
    if(totalCount>0)
    {
      setWip(((corrected/totalCount)*100).toFixed(3))
    }
  }, [corrected,totalCount])


  // const handleClick = async () => {
  //   try {
  //     const response = await fetch(`${APIURL}/Audit/audit?WhichDatabase=Local&ProjectID=${ProjectId}`);

  //     const result = await response.json();

  //     if (Array.isArray(result)) {
  //       alert(`Audit Flags:\n${result.join('\n')}`);
  //     } else {
  //       alert(result);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('An error occurred while performing the audit.');
  //   }
  // };

  // const handleClick = async () => {
  //   try {
  //     const response = await fetch(`${APIURL}/Audit/audit?WhichDatabase=Local&ProjectID=${ProjectId}`);
  
  //     // Check if the response status is OK (status code 200-299)
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  
  //     const result = await response.json();
  
  //     // Log the result for debugging
  //     console.log('Fetched result:', result);
  
  //     // Check if the result is an array
  //     if (Array.isArray(result)) {
  //       alert(`Audit Flags:\n${result.join('\n')}`);
  //     } else {
  //       alert(result);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('An error occurred while performing the audit.');
  //   }
  // };

  const handleClick = async () => {
    try {
      const response = await fetch(`${APIURL}/Audit/audit?WhichDatabase=Local&ProjectID=${ProjectId}`);
  
      // Log the response status and headers
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`); 
      }
      notification.success({
        message: 'Audit Cycle Complete!',
        duration: 3,
      });

      getFlags();
  
      // Attempt to parse the JSON

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while performing the audit.');
    }
  };
  

  const getFlags = async () => {
    try {
      const response = await fetch(`${APIURL}/Flags/counts`);
      const result = await response.json();
      console.log(result);
      setFlags(result.countsByFieldname); // Update state with countsByFieldname array
      setRemarksCounts(result.remarksCounts);

      setCorrected(result.corrected);
      setRemaining(result.remaining);
      setTotalCount(result.totalCount);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    getFlags();
  }, []);

  useEffect(() => {
    const fetchFieldConfigs = async () => {
      try {
        const response = await fetch(`${APIURL}/FieldConfigurations?WhichDatabase=Local&ProjectID=${ProjectId}`);
        const result = await response.json();
        setFieldConfigs(result);
      } catch (error) {
        console.error('Error fetching field configurations:', error);
      }
    };

    fetchFieldConfigs();
  }, []);

  return (
    <div>
      <div className="mb-3 mr-3 mt-3 text-end">
        <Button type="primary" onClick={handleClick}>
          Run Audit
        </Button>
      </div>

      <Card style={{ height: 'auto' }}>
        <Row>
          <Col>
            <Row>
              <Col>
                <Row>
                  <Card className="ml-3 mr-3 mt-3">
                    <div className="justify-content-center align-items-center">
                      <ChartComponent
                        chartId={`chart-global`}
                        series={wip} // Example series data
                        labels={['Average Results']}
                      />
                      <div>
                        <p className="fs-2 text-center">
                        {totalCount === 0 ? "Run Audit to Start Audit Process" : "Completion Status"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Row>
                <Row>
                  <Card className="ml-3 mr-3 mt-3">
                    <table className="table-striped table-bordered table">
                      <thead className="thead-dark">
                        <tr>
                          <th scope="col">Remark</th>
                          <th scope="col">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {remarksCounts.map((remark, index) => (
                          <tr key={index}>
                            <td>{remark.remark}</td>
                            <td>{remark.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col>

            <Card
              className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3 "
              style={{ height: '60px', backgroundColor: '#ffd1d1' }}
            >
              <div className="">
                <h2 className="text-center">Error Counts: {totalCount}</h2>
              </div>
            </Card>

            <Card
              className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3 "
              style={{ height: '60px', backgroundColor: '#95f595' }}
            >
              <div className="">
                <h2 className="text-center">Corrected Counts: {corrected}</h2>
              </div>
            </Card>

            <Card
              className="d-flex align-items-center fs-3 justify-content-center mb-5 mr-3 mt-3 "
              style={{ height: '60px', backgroundColor: '#b4b4ff' }}
            >
              <div className="">
                <h2 className="text-center">Remaining Counts: {remaining}</h2>
              </div>
            </Card>


            <h2
              className="fs-3 mb-3 text-center "
              style={{ color: 'grey', textShadow: '0px 2px 4px grey' }}
            >
              Error Reports
            </h2>
            <Card className="mb-3 mr-3">
              <Row className="ml-4 mr-4 mt-4">
                {flags.map((flag, index) => (
                  <Col md={4} key={index}>
                    <Card className="d-flex align-items-center mb-4">
                      <Card.Body>
                        <p className="fs-6 m-auto text-center">
                          {flag.fieldName} <br />
                          <span>({flag.count})</span>
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AuditButton;
