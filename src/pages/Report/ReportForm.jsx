import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Select as AntSelect, Input, Button, Row, Col, Table, Typography, Dropdown, Menu, Modal } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { Option } = AntSelect;

const ReportForm = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [project, setProject] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null); // New state for selected project ID
  const [workedBy, setWorkedBy] = useState('');
  const [projectOptions, setProjectOptions] = useState([]);
  const [fieldsOptions, setFieldsOptions] = useState([]); // State for field options fetched from API
  const [selectedFields, setSelectedFields] = useState([]);
  const [data, setData] = useState([]);
  const [previewPDF, setPreviewPDF] = useState(false);
  const [previewExcel, setPreviewExcel] = useState(false);

  useEffect(() => {
    // Fetch project names
    fetchProjects();
  }, []);

  useEffect(() => {
    // Fetch fields when selectedProjectId changes
    if (selectedProjectId) {
      fetchFields(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = () => {
    fetch('https://localhost:7290/api/Projects?WhichDatabase=Local')
      .then(response => response.json())
      .then(data => {
        const options = data.map(project => ({
          value: project.projectId.toString(),
          label: project.projectName
        }));
        setProjectOptions(options);
      })
      .catch(error => {
        console.error('Error fetching project names:', error);
      });
  };

  const fetchFields = (projectId) => {
    fetch(`https://localhost:7290/api/Fields?WhichDatabase=Local&projectId=${projectId}`)
      .then(response => response.json())
      .then(data => {
        const options = data.map(field => ({
          value: field.fieldId.toString(),
          label: field.fieldName
        }));
        setFieldsOptions(options);
        setSelectedFields([]); // Reset selectedFields when fields are fetched
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });
  };

  const handleProjectChange = (value) => {
    const projectId = value;
    setProject(value);
    setSelectedProjectId(projectId);
  };

  const handleFieldChange = (selectedOptions) => {
    setSelectedFields(selectedOptions);
  };

  const generatePDF = () => {
    setPreviewPDF(true);
  };

  const generateExcel = () => {
    // Mapping data to include required fields
    const formattedData = data.map((item, index) => {
      let row = {
        'S.No.': index + 1,
        'Roll Number': item.ROLLNO,
        'Center Code': item.CENTRE_CODE,
        'Booklet Number': item.BC,
        'Name': item.NAME,
        'Status': item.STATUS,
        'Score': (item.STATUS === 'P') ? item.SCORE : (item.STATUS === 'A') ? '*' : ''
      };
      return row;
    });

    // Prepending header row
    const headers = {
      'S.No.': 'S.No.',
      'Roll Number': 'Roll Number',
      'Center Code': 'Center Code',
      'Booklet Number': 'Booklet Number',
      'Name': 'Name',
      'Status': 'Status',
      'Score': 'Score'
    };

    const dataWithHeaders = [headers, ...formattedData];

    // Generating Excel file
    const worksheet = XLSX.utils.json_to_sheet(dataWithHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'report.xlsx');
  };

  const PDFReport = () => (
    <Document>
      <Page size="A3" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Report</Text>
          <Text style={styles.subtitle}>Project: {project}</Text>
          <Text style={styles.subtitle}>Date: {startDate && endDate ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : 'All'}</Text>
          <Text style={styles.subtitle}>Worked By: {workedBy}</Text>
        </View>

        {selectedFields.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>S.No.</Text>
              {selectedFields.map(field => (
                <Text key={field.value} style={styles.tableColHeader}>{field.label}</Text>
              ))}
            </View>

            {data.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{index + 1}</Text>
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

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={generatePDF}>
        Download PDF
      </Menu.Item>
      <Menu.Item key="2" onClick={() => setPreviewExcel(true)}>
        Download Excel
      </Menu.Item>
    </Menu>
  );

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
      width: `${100 / (selectedFields.length + 1)}%`,
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
      width: `${100 / (selectedFields.length + 1)}%`,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: '#bfbfbf',
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 8,
      textAlign: 'center',
    },
  });

  return (
    <div className="container mt-5">
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center" style={{ flexGrow: 1 }}>
          <label className="form-label me-2">Project</label>
          <AntSelect
            value={project}
            onChange={handleProjectChange}
            className="form-select"
            style={{ width: '100%' }}
          >
            {projectOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </AntSelect>
        </div>
        <Dropdown overlay={menu}>
          <Button type="primary" className="ms-5">
            Download <DownOutlined />
          </Button>
        </Dropdown>
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
          options={fieldsOptions}
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

      <Modal
        title="Excel Preview"
        visible={previewExcel}
        onOk={generateExcel}
        onCancel={() => setPreviewExcel(false)}
        width="80%"
      >
        <Table
          columns={columns}
          dataSource={tableData}
          bordered
          pagination={false}
          className="mt-4"
        />
      </Modal>
    </div>
  );
};

export default ReportForm;
