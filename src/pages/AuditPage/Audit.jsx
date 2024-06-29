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

                        <ChartComponent
                            chartId={`chart-global`}
                            series={76} // Example series data
                            labels={['Average Results']} />

                    </Col>
                    <Col>

                        <Row>

                        </Row>
                        <Card className='mb-3' style={{ height: '60px' }}>
                            <h2 className='align-items-center'>Errors</h2>

                        </Card>
                        <Row>

                            <Row>
                                {fieldConfigs.map((config, index) => {
                                    let fieldAttributes = [];
                                    try {
                                        fieldAttributes = JSON.parse(config.fieldAttributesJson);
                                    } catch (e) {
                                        console.error('Error parsing fieldAttributesJson:', e);
                                    }

                                    return (
                                        <Col md={4} key={index}>
                                            <Card className="mb-4">
                                                {/* <ChartComponent
                                        chartId={`chart-${index}`}
                                        series={76} // Example series data
                                        labels={['Average Results']} // Example labels
                                    /> */}
                                                <Card.Body>
                                                    <p className='fs-6 text-center' style={{ height: '20px', position: 'inherit' }}>
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
                        </Row>



                    </Col>

                </Row>
            </Card>
        </div>
    );
};

export default AuditButton;