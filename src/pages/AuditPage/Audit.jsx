import React, { useEffect, useState } from 'react';
import { Col, Row, Card } from 'react-bootstrap';
import { Button, notification } from 'antd';
import ChartComponent from './ChartComponent';
import { useProjectId } from '@/store/ProjectState';
import StackedHorizontalBarChart from './stackchart';
import useFlags from '@/CustomHooks/useFlag';

const APIURL = import.meta.env.VITE_API_URL;

const AuditButton = () => {
  // const [fieldConfigs, setFieldConfigs] = useState([]);
  const ProjectId = useProjectId();
  const { flags, remarksCounts, corrected, remaining, totalCount, getFlags } = useFlags(ProjectId);
  const WIP = ((corrected / totalCount) * 100).toFixed(3);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleClickAudit = async () => {
    try {
      setIsAuditing(true);
      const response = await fetch(`${APIURL}/Audit/audit?WhichDatabase=Local&ProjectID=${ProjectId}`);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      setIsAuditing(false);
      notification.success({
        message: 'Audit Cycle Complete!',
        duration: 3,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      getFlags(); // Re-fetch flags after auditing
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while performing the audit.');
    }
  };

  // useEffect(() => {
  //   const fetchFieldConfigs = async () => {
  //     try {
  //       const response = await fetch(`${APIURL}/FieldConfigurations?WhichDatabase=Local&ProjectID=${ProjectId}`);
  //       const result = await response.json();
  //       setFieldConfigs(result);
  //       console.log(result)
  //     } catch (error) {
  //       console.error('Error fetching field configurations:', error);
  //     }
  //   };
  //   fetchFieldConfigs();
  // }, [ProjectId]);

  return (
    <div>
      <div className="mb-3 mr-3 mt-3 text-end">
        <Button type="primary" onClick={handleClickAudit} disabled={isAuditing}>
          {isAuditing ? 'Auditing' : 'Run Audit'}
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
                        series={WIP}
                        labels={['Average Results']}
                      />
                      <div>
                        <p className="fs-2 text-center">Completion Status</p>
                      </div>
                    </div>
                  </Card>
                </Row>
                <Row>
                  <Card className="ml-3 mr-3 mt-3">
                    <div>
                      <StackedHorizontalBarChart data={remarksCounts} />
                    </div>
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
            <Card className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3" style={{ height: '60px', backgroundColor: '#ffd1d1' }}>
              <div>
                <h2 className="text-center">Error Counts: {totalCount}</h2>
              </div>
            </Card>

            <Card className="d-flex align-items-center fs-3 justify-content-center mb-1 mr-3 mt-3" style={{ height: '60px', backgroundColor: '#95f595' }}>
              <div>
                <h2 className="text-center">Corrected Counts: {corrected}</h2>
              </div>
            </Card>

            <Card className="d-flex align-items-center fs-3 justify-content-center mb-5 mr-3 mt-3" style={{ height: '60px', backgroundColor: '#b4b4ff' }}>
              <div>
                <h2 className="text-center">Remaining Counts: {remaining}</h2>
              </div>
            </Card>

            <h2 className="fs-3 mb-3 text-center" style={{ color: 'grey', textShadow: '0px 2px 4px grey' }}>Error Reports</h2>
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
