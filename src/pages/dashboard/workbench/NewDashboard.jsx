import React, { useState, useEffect } from 'react';
import './NewDashboard.css';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for HTTP requests
import { useProjectActions } from '@/store/ProjectState';

const NewDashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]); // State to store fetched projects
    const {setProjectId} = useProjectActions();

    useEffect(() => {
        fetchProjects(); // Fetch projects when component mounts
    }, []);

    const fetchProjects = async () => {
        try {
            // Fetch projects from API
            const response = await axios.get('https://localhost:7290/api/Projects?WhichDatabase=Local');
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
        <div>
            <Row>
                {/* Map through projects and render each project */}
                {projects.map(project => (
                    <Col key={project.projectId}>
                        <div className="outer" onClick={() => onClickProjectId(project.projectId)}>
                            <div className="dot"></div>
                            <div className="card">
                                <div className="ray"></div>
                                <div className="text fs-2">{project.projectName}</div>
                                
                                <div className="line topl"></div>
                                <div className="line leftl"></div>
                                <div className="line bottoml"></div>
                                <div className="line rightl"></div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default NewDashboard;
