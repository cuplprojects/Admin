import React, { useState, useRef } from 'react';
import { Form, Input, Radio, Typography, Divider, Row, Col, Space, Table, Select } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const MarksAllotmentForm = () => {
    const [formState, setFormState] = useState({
        numberOfAmbiguousQuestions: '',
        numberOfOptions: '',
        optionsJumbled: '',
        setCode: 'SetA', // Default set code
        ambiguousQuestions: {}, // Store ambiguous questions by set code
    });

    const tableRefs = {
        SetA: useRef(null),
        SetB: useRef(null),
        SetC: useRef(null),
        SetD: useRef(null),
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value
        });
    };

    const handleSetCodeChange = (value) => {
        setFormState({
            ...formState,
            setCode: value
        });

        // Scroll to the corresponding table
        if (tableRefs[value] && tableRefs[value].current) {
            tableRefs[value].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const renderTableData = () => {
        const { numberOfAmbiguousQuestions, numberOfOptions, ambiguousQuestions } = formState;
        const data = [];

        if (numberOfAmbiguousQuestions && !isNaN(numberOfAmbiguousQuestions) && numberOfOptions && !isNaN(numberOfOptions)) {
            const questions = ambiguousQuestions[formState.setCode] || {};
            for (let i = 1; i <= parseInt(numberOfAmbiguousQuestions); i++) {
                data.push({
                    key: `${formState.setCode}-${i}`,
                    questionNumber: i,
                    questionInput: (
                        <Input
                            type="text"
                            name={`ambiguousQuestion${i}`}
                            value={questions[i] || ''}
                            onChange={(e) => handleQuestionChange(i, e)}
                            style={{ borderRadius: '0' }}
                        />
                    ),
                    options: (
                        <Space direction="vertical">
                            {Array.from({ length: parseInt(numberOfOptions) }).map((_, index) => (
                                <Input
                                    key={`ambiguousQuestion${i}Option${String.fromCharCode(65 + index)}`}
                                    type="text"
                                    name={`ambiguousQuestion${i}Option${String.fromCharCode(65 + index)}`}
                                    value={questions[`option${String.fromCharCode(65 + index)}`] || ''}
                                    onChange={(e) => handleOptionChange(i, e)}
                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                    style={{ borderRadius: '0' }}
                                />
                            ))}
                        </Space>
                    )
                });
            }
        }

        return data;
    };

    const handleQuestionChange = (questionNumber, e) => {
        const { value } = e.target;
        const updatedQuestions = {
            ...formState.ambiguousQuestions,
            [formState.setCode]: {
                ...(formState.ambiguousQuestions[formState.setCode] || {}),
                [questionNumber]: value
            }
        };
        setFormState({
            ...formState,
            ambiguousQuestions: updatedQuestions
        });
    };

    const handleOptionChange = (questionNumber, e) => {
        const { name, value } = e.target;
        const updatedQuestions = {
            ...formState.ambiguousQuestions,
            [formState.setCode]: {
                ...(formState.ambiguousQuestions[formState.setCode] || {}),
                [name]: value
            }
        };
        setFormState({
            ...formState,
            ambiguousQuestions: updatedQuestions
        });
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
        },
        {
            title: 'Options',
            dataIndex: 'options',
            key: 'options',
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
                    <Form.Item label="Number of options">
                        <Input
                            type="number"
                            name="numberOfOptions"
                            value={formState.numberOfOptions}
                            onChange={handleChange}
                            style={{ borderRadius: '0' }}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
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
                <Col span={12}>
                    <Form.Item label={<span style={{ fontWeight: 'bold', color: '#ff0000' }}>Set Code</span>}>
                        <Select
                            value={formState.setCode}
                            onChange={handleSetCodeChange}
                            style={{ borderRadius: '0' }}
                        >
                            <Option value="SetA">SetA</Option>
                            <Option value="SetB">SetB</Option>
                            <Option value="SetC">SetC</Option>
                            <Option value="SetD">SetD</Option>
                        </Select>
                    </Form.Item>

                </Col>
            </Row>

            <Divider />

            {['SetA', 'SetB', 'SetC', 'SetD'].map(setCode => (
                <div key={setCode} ref={tableRefs[setCode]}>
                    <Title level={3}>{setCode}</Title>
                    <Table
                        columns={columns}
                        dataSource={renderTableData()}
                        pagination={false}
                    />
                    <Divider />
                </div>
            ))}

        </Form>
    );
};

export default MarksAllotmentForm;
