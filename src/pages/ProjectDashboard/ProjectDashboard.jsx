import React, { useState, useEffect } from 'react';
import { Card, Progress } from 'antd';
import { useProjectActions, useProjectId } from '@/store/ProjectState';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import StackedHorizontalBarChart from './stackchart';

const { Meta } = Card;

const ProjectDashboard = () => {
  // State variables
  const [projectName, setProjectName] = useState('');
  const projectId = useProjectId();
  const { setProjectId } = useProjectActions();
  const [progress, setProgress] = useState(0);
  const [numErrors, setNumErrors] = useState(0);
  const [numWarnings, setNumWarnings] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch project details based on projectId from localStorage
    const id = localStorage.getItem('projectId');
    setProjectId(id);

    // Fetch project details if projectId exists
    if (id) {
      fetchProjectDetails(id);
    }
  }, [projectId]); // Empty dependency array to run only once on component mount

  const onClickProjectLogout = () => {
    setProjectId(0);
    navigate('/dashboard/workbench');
  };

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
        setProgress(data.progress);
        setNumErrors(data.numErrors);
        setNumWarnings(data.numWarnings);
        setTasksCompleted(data.tasksCompleted);
      })
      .catch((error) => console.error('Error fetching project details:', error));
  };

  return (
    <div className="project-dashboard">
      <Card
        className="project-card"
        title={
          <h2>
            {projectId}. {projectName}
          </h2>
        }
        extra={<Button onClick={onClickProjectLogout}>Logout</Button>}
      >
        <div className="statistics">
          <Card.Grid className="statistic-item">
            <Meta title="Errors" description={numErrors} />
          </Card.Grid>
          <Card.Grid className="statistic-item">
            <Meta title="Warnings" description={numWarnings} />
          </Card.Grid>
          <Card.Grid className="statistic-item">
            <Meta title="Tasks Completed" description={tasksCompleted} />
          </Card.Grid>
          {/* Add more Card.Grid items for additional statistics */}
        </div>
      </Card>
      <StackedHorizontalBarChart />
    </div>
  );
};

export default ProjectDashboard;
