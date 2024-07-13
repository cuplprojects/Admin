import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Select as AntSelect, Input, Button, Row, Col, Table, Typography } from 'antd';

const { Title } = Typography;
const { Option } = AntSelect;

const ReportForm = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [project, setProject] = useState('');
  const [workedBy, setWorkedBy] = useState('');
  const [fields] = useState([
    { value: 'ROLLNO', label: 'Roll Number' },
    { value: 'CENTRE_CODE', label: 'Center Code' },
    { value: 'BC', label: 'Booklet Number' },
    { value: 'NAME', label: 'Name' },
    { value: 'STATUS', label: 'Status' },
    { value: 'SCORE', label: 'Score' }
  ]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [previewPDF, setPreviewPDF] = useState(false);

  const handleFieldChange = (selectedOptions) => {
    setSelectedFields(selectedOptions);
  };

  const data = [];

  const styles = StyleSheet.create({
    page: {
      padding: 30,
    },
    header: {
      marginBottom: 20,
      textAlign: 'center',
    },
    title: {
      fontSize: 24,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      marginBottom: 8,
    },
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: '#bfbfbf',
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: {
      flexDirection: 'row',
    },
    tableColHeader: {
      width: `${100 / selectedFields.length}%`,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: '#bfbfbf',
      borderRightWidth: 0,
      borderBottomWidth: 0,
      backgroundColor: '#f0f0f0',
      textAlign: 'center',
      fontWeight: 'bold',
      padding: 8,
    },
    tableCol: {
      width: `${100 / selectedFields.length}%`,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: '#bfbfbf',
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 8,
      textAlign: 'center',
    },
  });

  const generatePDF = () => {
    setPreviewPDF(true);
  };

  const PDFReport = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Report</Text>
          <Text style={styles.subtitle}>Project: {project}</Text>
          <Text style={styles.subtitle}>Date: {startDate && endDate ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : 'All'}</Text>
          <Text style={styles.subtitle}>Worked By: {workedBy}</Text>
        </View>

        {selectedFields.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {selectedFields.map(field => (
                <Text key={field.value} style={styles.tableColHeader}>{field.label}</Text>
              ))}
            </View>

            {data.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                {selectedFields.map(field => (
                  <Text key={`${field.value}-${index}`} style={styles.tableCol}>
                    {(field.value === 'SCORE' && item.STATUS === 'P') ? item.SCORE : ((field.value === 'SCORE' && item.STATUS === 'A') ? '*' : item[field.value])}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );

  const columns = [
    {
      title: 'S.No.',
      dataIndex: 'sno',
      key: 'sno',
      render: (text, record, index) => index + 1,
    },
    ...selectedFields.map(field => ({
      title: field.label,
      dataIndex: field.value,
      key: field.value,
      render: (text, record) => {
        if (field.value === 'SCORE' && record.STATUS === 'P') {
          return text;
        } else if (field.value === 'SCORE' && record.STATUS === 'A') {
          return '*';
        } else {
          return text;
        }
      },
    }))
  ];

  const tableData = data.map((item, index) => ({ ...item, key: index }));

  return (
    <div className="container mt-5">
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center" style={{ flexGrow: 1 }}>
          <label className="form-label me-2">Project</label>
          <AntSelect value={project} onChange={setProject} className="form-select" style={{ width: '100%' }}>
            <Option value="BHU GROUP">BHU Group</Option>
            <Option value="RGVP GROUP">RGVP GROUP</Option>
          </AntSelect>
        </div>
        <Button type="primary" onClick={generatePDF} className="ms-5">
          Download PDF
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <div className="mb-3">
            <label className="form-label">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="mb-3">
            <label className="form-label">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>
        </Col>
      </Row>

      <div className="mb-3">
        <label className="form-label">Worked By</label>
        <Input
          value={workedBy}
          onChange={(e) => setWorkedBy(e.target.value)}
          placeholder="Enter names separated by commas"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Select the fields you want in your report</label>
        <Select
          isMulti
          value={selectedFields}
          onChange={handleFieldChange}
          options={fields}
          className="basic-multi-select"
          classNamePrefix="select"
        />
      </div>

      {selectedFields.length > 0 && (
        <Table
          columns={columns}
          dataSource={tableData}
          bordered
          pagination={false}
          className="mt-4"
        />
      )}

      {previewPDF && (
        <div className="mt-3">
          <Title level={3}>Preview</Title>
          <PDFViewer style={{ width: '100%', height: '600px' }}>
            <PDFReport />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default ReportForm;
