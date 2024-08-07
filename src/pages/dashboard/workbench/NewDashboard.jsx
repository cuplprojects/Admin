// src/pages/NewDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProjectActions } from '@/store/ProjectState';
import { useThemeToken } from '@/theme/hooks';
import Color from 'color';
import ProjectCard from './ProjectCard'; // Adjust the import path as needed
import { useUserInfo } from '@/store/UserDataStore';

const apiurl = import.meta.env.VITE_API_URL;

const NewDashboard = () => {
  const themeToken = useThemeToken();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]); // State to store fetched projects
  const { setProjectId } = useProjectActions();
  const {userId} = useUserInfo();

  // Define background gradient using the theme tokens
  const bg = `linear-gradient(135deg, ${Color(themeToken.colorPrimaryHover).alpha(0.2)}, ${Color(
    themeToken.colorPrimary,
  ).alpha(0.2)})`;

  useEffect(() => {
    fetchProjects(); // Fetch projects when component mounts
  }, []);

  const fetchProjects = async () => {
    try {
      // Fetch projects from API
      const response = await axios.get(`${apiurl}/Projects/ByUser/${userId}?WhichDatabase=Local`);
      setProjects(response.data); // Update projects state with fetched data
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const onClickProjectId = (projectId) => {
    // Set projectId in localStorage
    setProjectId(projectId);

    // Navigate to ProjectDashboard after setting localStorage
    setTimeout(() => {
      navigate('/ProjectDashboard');
    }, 500); // 500 milliseconds (0.5 seconds)
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <Card className="shadow-sm" style={{ background: bg }}>
            <Card.Body>
              <Card.Title
                className="mb-4 text-center"
                style={{ color: themeToken.colorPrimaryActive }}
              >
                Recent Projects
              </Card.Title>
              <Row>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.projectId}
                    project={project}
                    onClickProjectId={onClickProjectId}
                  />
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewDashboard;
