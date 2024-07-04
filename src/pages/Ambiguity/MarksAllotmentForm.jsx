import React, { useState } from 'react';
import { Form, Input, Radio, Typography, Divider, Row, Col, Space, Table } from 'antd';

const { Title } = Typography;

const MarksAllotmentForm = () => {
    const [formState, setFormState] = useState({
        numberOfAmbiguousQuestions: '',
        optionsJumbled: '',
        setCode: '',
        questionNo: '',
        options: '',
        incorrectQuestionOption: '',
        multipleOptionsCorrectOption: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value
        });
    };

    const renderTableData = () => {
        const { numberOfAmbiguousQuestions } = formState;
        const data = [];

        if (numberOfAmbiguousQuestions && !isNaN(numberOfAmbiguousQuestions)) {
            for (let i = 1; i <= parseInt(numberOfAmbiguousQuestions); i++) {
                data.push({
                    key: i,
                    questionNumber: i,
                    questionInput: (
                        <Input
                            type="text"
                            name={`ambiguousQuestion${i}`}
                            value={formState[`ambiguousQuestion${i}`] || ''}
                            onChange={handleChange}
                            style={{ borderRadius: '0' }}
                        />
                    )
                });
            }
        }

        return data;
    };

    const columns = [
        {
            title: 'Question Number',
            dataIndex: 'questionNumber',
            key: 'questionNumber',
        },
        {
            title: 'Ambiguous Question',
            dataIndex: 'questionInput',
            key: 'questionInput',
        }
    ];

    return (
        <Form layout="vertical" style={{ maxWidth: '900px', margin: '50px auto 0 auto' }}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Number of ambiguous questions">
                        <Input 
                            type="number" 
                            name="numberOfAmbiguousQuestions" 
                            value={formState.numberOfAmbiguousQuestions} 
                            onChange={handleChange} 
                            style={{ borderRadius: '0' }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Options Jumbled?">
                        <Radio.Group 
                            name="optionsJumbled" 
                            value={formState.optionsJumbled} 
                            onChange={handleChange}
                        >
                            <Space>
                                <Radio value="Yes">Yes</Radio>
                                <Radio value="No">No</Radio>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Set Code">
                        <Input 
                            type="text" 
                            name="setCode" 
                            value={formState.setCode} 
                            onChange={handleChange} 
                            style={{ borderRadius: '0' }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    {/* <Form.Item label="Question No.">
                        <Input 
                            type="text" 
                            name="questionNo" 
                            value={formState.questionNo} 
                            onChange={handleChange} 
                            style={{ borderRadius: '0' }}
                        />
                    </Form.Item> */}
                </Col>
            </Row>
            <Form.Item label="Options">
                <Input 
                    type="text" 
                    name="options" 
                    value={formState.options} 
                    onChange={handleChange} 
                    style={{ borderRadius: '0' }}
                />
            </Form.Item>
            <Divider />
            {/* <Title level={5}>Ambiguous Questions</Title> */}
            <Table 
                columns={columns} 
                dataSource={renderTableData()} 
                pagination={false}
            />
        </Form>
    );
};

export default MarksAllotmentForm;
