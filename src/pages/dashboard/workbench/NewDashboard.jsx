import React from 'react'
import './NewDashboard.css'
import { Col, Row } from 'react-bootstrap'




const NewDashboard = () => {

  const onClickProjectId = (projectid) => {
    localStorage.setItem('projectid', projectid)
  } 
  return (
    <div>
      <Row>
        <Col>
          <div class="outer" onClick={()=> onClickProjectId(1)}>
            <div class="dot"></div>
            <div class="card">
              <div class="ray"></div>
              <div class="text fs-2">Project Alpha</div>
              
              <div class="line topl"></div>
              <div class="line leftl"></div>
              <div class="line bottoml"></div>
              <div class="line rightl"></div>
            </div>
          </div>
        </Col>
        
        <Col>
          <div class="outer" onClick={()=> onClickProjectId(2)}>
            <div class="dot"></div>
            <div class="card">
              <div class="ray"></div>
              <div class="text fs-2">Project Beta</div>
              
              <div class="line topl"></div>
              <div class="line leftl"></div>
              <div class="line bottoml"></div>
              <div class="line rightl"></div>
            </div>
          </div>
        </Col>
        <Col>
          <div class="outer"  onClick={()=> onClickProjectId(3)}>
            <div class="dot"></div>
            <div class="card">
              <div class="ray"></div>
              <div class="text fs-2">Project Delta</div>
              
              <div class="line topl"></div>
              <div class="line leftl"></div>
              <div class="line bottoml"></div>
              <div class="line rightl"></div>
            </div>
          </div>
        </Col>
      </Row>

    </div>
  )
}

export default NewDashboard
