import React from 'react';
import './NewDashboard.css';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NewDashboard = () => {
    const navigate = useNavigate();

    const onClickProjectId = (projectId) => {
        // Set projectId in localStorage
        localStorage.setItem('projectid', projectId);

        // Navigate to ProjectDashboard after setting localStorage
        setTimeout(() => {
          navigate('/ProjectDashboard');
      }, 500); // 500 milliseconds (0.5 seconds)
    };

    return (
        <div>
            <Row>
                <Col>
                    <div className="outer" onClick={() => onClickProjectId(1)}>
                        <div className="dot"></div>
                        <div className="card">
                            <div className="ray"></div>
                            <div className="text fs-2">Project Alpha</div>
                            
                            <div className="line topl"></div>
                            <div className="line leftl"></div>
                            <div className="line bottoml"></div>
                            <div className="line rightl"></div>
                        </div>
                    </div>
                </Col>
                
                <Col>
                    <div className="outer" onClick={() => onClickProjectId(2)}>
                        <div className="dot"></div>
                        <div className="card">
                            <div className="ray"></div>
                            <div className="text fs-2">Project Beta</div>
                            
                            <div className="line topl"></div>
                            <div className="line leftl"></div>
                            <div className="line bottoml"></div>
                            <div className="line rightl"></div>
                        </div>
                    </div>
                </Col>
                
                <Col>
                    <div className="outer" onClick={() => onClickProjectId(3)}>
                        <div className="dot"></div>
                        <div className="card">
                            <div className="ray"></div>
                            <div className="text fs-2">Project Delta</div>
                            
                            <div className="line topl"></div>
                            <div className="line leftl"></div>
                            <div className="line bottoml"></div>
                            <div className="line rightl"></div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default NewDashboard;
