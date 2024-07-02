import React, { useEffect, useState } from 'react';
import { Col, Row, Card } from 'react-bootstrap';
import { Button } from 'antd';
import ChartComponent from './ChartComponent';

const APIURL = import.meta.env.VITE_API_URL;

const AuditButton = () => {
    const [fieldConfigs, setFieldConfigs] = useState([]);

    const handleClick = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/audit/audit');
            const result = await response.json();

            if (Array.isArray(result)) {
                alert(`Audit Flags:\n${result.join('\n')}`);
            } else {
                alert(result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while performing the audit.');
        }
    };

    useEffect(() => {
        const fetchFieldConfigs = async () => {
            try {
                const response = await fetch(`${APIURL}/FieldConfigurations?WhichDatabase=Local`);
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
            <div className='text-end mt-3 mr-3 mb-3'>
                <Button type='primary' onClick={handleClick}>Run Audit</Button>
            </div>

            <Card style={{ height: 'auto' }}>
                <Row>
                    <Col>
                        <Row>
                            <Col>
                                <Card className='mt-3 ml-3 mr-3'>
                                    <div className='justify-content-center align-items-center'>
                                        <ChartComponent
                                            chartId={`chart-global`}
                                            series={76} // Example series data
                                            labels={['Average Results']}
                                        />
                                        <div>
                                            <p className='fs-2 text-center'>dfgfgf</p>
                                        </div>
                                    </div>

                                </Card>
                            </Col>
                        </Row>
                        {/* <Row>
                        <Card className='mt-5 mb-3'>
                            <div>
                                <p>dfgvfgbf</p>
                            </div>

                        </Card>
                    </Row> */}


                    </Col>
                    <Col>

                        <Card className='mb-5 mt-3 mr-3' style={{ height: '60px' }}>
                            <div className='d-flex align-itmes-center'>
                                <h2>Errors</h2>
                            </div>

                        </Card>

                        <h2 className='fs-3 ' style={{ color: 'grey', textShadow: '0px 2px 4px grey' }}>Error Reports</h2>
                        <Card className='mb-3 mr-3'>
                            <Row className='mt-4 ml-4 mr-4'>
                                {fieldConfigs.map((config, index) => {
                                    let fieldAttributes = [];
                                    try {
                                        fieldAttributes = JSON.parse(config.fieldAttributesJson);
                                    } catch (e) {
                                        console.error('Error parsing fieldAttributesJson:', e);
                                    }

                                    return (
                                        <Col md={4} key={index}>
                                            <Card className="d-flex align-items-center mb-4">
                                                <Card.Body>
                                                    <p className='fs-6 text-center m-auto' style={{ height: '40px', position: 'inherit' }}>
                                                        {fieldAttributes.map((attr, attrIndex) => (
                                                            <span key={attrIndex}>{attr.Field}</span>
                                                        ))}
                                                    </p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Card>
                    </Col>

                </Row>
            </Card>
        </div>
    );
};

export default AuditButton;