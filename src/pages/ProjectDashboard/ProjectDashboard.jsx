import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Checkbox } from 'antd';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useProjectActions, useProjectId } from '@/store/ProjectState';
import { useThemeToken } from '@/theme/hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircleOutlined } from '@ant-design/icons'; // Import Ant Design icon
import axios from 'axios';

const APIURL = import.meta.env.VITE_API_URL;
const ProjectDashboard = () => {
  // State variables
  const [projectName, setProjectName] = useState('');
  const projectId = useProjectId();
  const { setProjectId } = useProjectActions();
  const navigate = useNavigate();
  const { colorPrimary } = useThemeToken();
  const [dataCounts, setDataCounts] = useState([]);
  const [remaining, setRemaining] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [corrected, setCorrected] = useState(0);
  const [progress, setProgress] = useState(0); // Progress state
  const [fcName, setFCName] = useState('');
  const [recName, setRECName] = useState('');
  const [imcName, setIMCName] = useState('');

  useEffect(() => {
    // Fetch project details if projectId exists
    if (projectId) {
      fetchProjectDetails(projectId);
      fetchCounts(projectId);
      checkApiCompletion(projectId);
    }
  }, [projectId]); // Empty dependency array to run only once on component mount

  const onClickProjectLogout = () => {
    setProjectId(0);
    navigate('/dashboard/workbench');
  };
  const getFlags = async () => {
    try {
      const response = await fetch(`${APIURL}/Flags/counts/projectId?projectId=${projectId}`);
      const result = await response.json();
      console.log(result);
      setTotalCount(result.totalCount);
      setRemaining(result.remaining);
      setCorrected(result.corrected);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    getFlags();
  }, [projectId]);

  // Function to fetch project details from an API
  const fetchProjectDetails = (projectId) => {
    // Replace with actual API call to fetch project details
    fetch(`https://localhost:7290/api/Projects/${projectId}?WhichDatabase=Local`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Update state with fetched data
        setProjectName(data.projectName);
      })
      .catch((error) => console.error('Error fetching project details:', error));
  };

  // Function to fetch counts
  const fetchCounts = async (projectId) => {
    try {
      const omrImagesResponse = await axios.get(
        `https://localhost:7290/api/OMRData/omrdata/${projectId}/total-images?WhichDatabase=Local`,
      );
      const omrImagesCount = omrImagesResponse.data;

      const omrDataResponse = await axios.get(
        `https://localhost:7290/api/OMRData/count/${projectId}?WhichDatabase=Local`,
      );
      const omrDataCount = omrDataResponse.data;

      const absenteeResponse = await axios.get(
        `https://localhost:7290/api/Absentee/absentee/count/${projectId}?WhichDatabase=Local`,
      );
      const absenteeCount = absenteeResponse.data;

      const keyResponse = await axios.get(
        `https://localhost:7290/api/Key/count?WhichDatabase=Local&ProjectId=${projectId}`,
      );
      const keyCount = keyResponse.data;

      const registrationResponse = await axios.get(
        `https://localhost:7290/api/Registration/CountByProjectId?whichDatabase=Local&ProjectId=${projectId}`,
      );
      const registrationCount = registrationResponse.data;

      // Set all counts
      setDataCounts([
        { name: 'OMR ', count: omrImagesCount },
        { name: 'Scanned ', count: omrDataCount },
        { name: 'Absentees', count: absenteeCount },
        { name: 'Keys ', count: keyCount },
        { name: 'Registration ', count: registrationCount },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const checkApiCompletion = async (projectId) => {
    try {
      // Fetch data from all three APIs concurrently
      const responses = await Promise.all([
        fetch(`${APIURL}/FieldConfigurations/GetByProjectId/${projectId}?WhichDatabase=Local`),
        fetch(`${APIURL}/ResponseConfigs/byproject/${projectId}?WhichDatabase=Local`),
        fetch(`${APIURL}/ImageConfigs/ByProjectId/${projectId}?WhichDatabase=Local`),
      ]);

      // Check if all responses are successful
      const results = await Promise.all(responses.map((response) => response.json()));
      const completedStep1 = results[0].length > 0 ? 100 / 3 : 0;
      const completedStep2 = results[1].length > 0 ? 100 / 3 : 0;
      const completedStep3 = results[2].length > 0 ? 100 / 3 : 0;

      setFCName(results[0].length > 0 ? 'Field Configurations' : '');
      setRECName(results[1].length > 0 ? 'Response Configurations' : '');
      setIMCName(results[2].length > 0 ? 'Image Configurations' : '');

      // Calculate progress based on completed steps
      const progressPercentage = completedStep1 + completedStep2 + completedStep3;
      setProgress(progressPercentage.toFixed(2));
    } catch (error) {
      console.error('Error checking API completion:', error);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between">
        <div className="fs-1 ml-3">
          <p>
            <strong>
              {projectId}. {projectName}
            </strong>
          </p>
        </div>
        <div className="text-end">
          <Button
            onClick={onClickProjectLogout}
            style={{ backgroundColor: colorPrimary, color: 'white' }}
          >
            Project Logout
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div>
          <Row>
            <Col className='col-12 col-md-8'>
              <Row gutter={16}>
                <Col span={24}>
                  <Card>
                    <div className="fs-4 text-center">Import Status</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dataCounts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col className='col-12 col-md-4'>
              <Card>
                <p className="fs-3 text-center">Audit Report</p>
                <Card
                  className="d-flex align-items-center fs-4 justify-content-between mb-1 mr-3 mt-3 "
                  style={{ height: '60px', backgroundColor: '#F9D9D3' }}
                >
                  <div className="">
                    <h2 className="text-center">Error Counts: {totalCount}</h2>
                  </div>
                </Card>

                <Card
                  className="d-flex align-items-center fs-4 justify-content between mb-1 mr-3 mt-3"
                  style={{ height: '60px', backgroundColor: '#CCEAE0' }}
                >
                  <div className="">
                    <h2 className="text-center ">Corrected Counts: {corrected}</h2>
                  </div>
                </Card>

                <Card
                  className="d-flex align-items-center fs-4 justify-content between mb-1 mr-3 mt-3"
                  style={{ height: '60px', backgroundColor: '#CCEDF3' }}
                >
                  <div className="">
                    <h2 className="text-center ">Remaining Counts: {remaining}</h2>
                  </div>
                </Card>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <div className="mt-4">
        <Card>
          <div className="fs-4 text-center">Project Configuration Status</div>
          {console.log(progress)}
          <Progress percent={progress} status={progress === 100 ? 'success' : 'normal'} />

          <div className="mt-2">
            <span className="mr-5">
              {fcName && (
                <span>
                  {fcName}
                  <Checkbox checked={true} style={{ marginRight: 5, marginLeft: 5 }} />
                </span>
              )}
            </span>
            <span className="mr-5">
              {recName && (
                <span>
                  {recName}
                  <Checkbox checked={true} style={{ marginRight: 5, marginLeft: 5 }} />
                </span>
              )}
            </span>
            <span>
              {imcName && (
                <span>
                  {imcName}
                  <Checkbox checked={true} style={{ marginRight: 5, marginLeft: 5 }} />
                </span>
              )}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;
