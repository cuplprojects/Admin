import React, { useState, useEffect } from 'react';
import { Card, Progress } from 'antd';

const { Meta } = Card;

const ProjectDashboard = () => {
  // Dummy data (replace with actual data from your application state or API)
  const [projectName, setProjectName] = useState('Sample Project');
  const [projectId, setProjectId] = useState('');
  const [progress, setProgress] = useState(70);
  const [numErrors, setNumErrors] = useState(5);
  const [numWarnings, setNumWarnings] = useState(3);
  const [tasksCompleted, setTasksCompleted] = useState(20);

  useEffect(() => {
    const id = localStorage.getItem('projectid');
    setProjectId(id);
  });

 


  return (
    <div className="project-dashboard">
      <Card
        className="project-card"
        title={
          <>
            <h2>
              {projectId}. {projectName}
            </h2>
          </>
        }
        extra={<Progress type="circle" percent={progress} width={60} />}
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
    </div>
  );
};

export default ProjectDashboard;
