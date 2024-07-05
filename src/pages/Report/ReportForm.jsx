import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Select as AntSelect, DatePicker as AntDatePicker, Input, Button, Row, Col, Table, Typography } from 'antd';


const { Title } = Typography;
const { Option } = AntSelect;
const { RangePicker } = AntDatePicker;

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
    { value: 'STATUS', label: 'Status' }
  ]);
  const [selectedFields, setSelectedFields] = useState(fields);
  const [previewPDF, setPreviewPDF] = useState(false);

  const handleFieldChange = (selectedOptions) => {
    setSelectedFields(selectedOptions);
  };

  const data = [
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200001', 'NAME': 'AAISHA', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200002', 'NAME': 'AARTI', 'STATUS': 'A' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200003', 'NAME': 'AARTI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200004', 'NAME': 'AARTI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200005', 'NAME': 'AASHU', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200006', 'NAME': 'AASMEEN', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200007', 'NAME': 'ANAM', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200008', 'NAME': 'ANISHA KUMARI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200009', 'NAME': 'AVANTIKA', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200010', 'NAME': 'AZRA', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200011', 'NAME': 'DHATRI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200012', 'NAME': 'HARSHITA', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200013', 'NAME': 'IKRA', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200014', 'NAME': 'ISHA', 'STATUS': 'A' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200015', 'NAME': 'ITI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200016', 'NAME': 'ITI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200017', 'NAME': 'JYOTI DHIMAN', 'STATUS': 'A' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200018', 'NAME': 'KAJAL SAINI', 'STATUS': 'A' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200019', 'NAME': 'KANIKA', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200020', 'NAME': 'KHUSHI SAINI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200021', 'NAME': 'KHUSHI', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200022', 'NAME': 'KOMAL', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200023', 'NAME': 'MAHAK', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200024', 'NAME': 'MISBAH', 'STATUS': 'A' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200025', 'NAME': 'MUSKAN', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200026', 'NAME': 'MUSKAN', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200027', 'NAME': 'NEETU SAINI', 'STATUS': 'A' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200028', 'NAME': 'NITASHA', 'STATUS': 'P' },
    { 'DISTRICT': '101', 'CENTRE_CODE': '001', 'BC': 'B', 'ROLLNO': '200029', 'NAME': 'PAYAL', 'STATUS': 'P' }
  ];

  const styles = StyleSheet.create({
    page: {
      padding: 30,
    },
    title: {
      fontSize: 24,
      textAlign: 'center',
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 18,
      margin: 12,
    },
    text: {
      fontSize: 12,
      margin: 12,
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
      flexDirection: "row",
    },
    tableColHeader: {
      width: "20%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: '#bfbfbf',
      borderLeftWidth: 0,
      borderTopWidth: 0,
      backgroundColor: '#f3f3f3',
      //padding: 2,
    },
    tableCol: {
      width: "20%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: '#bfbfbf',
      borderLeftWidth: 0,
      borderTopWidth: 0,
      //padding: 2,
    },
    tableCellHeader: {
      margin: "auto",
      fontSize: 10,
      fontWeight: 'bold',
      color: '#333333',
    },
    tableCell: {
      margin: "auto",
      marginTop: 5,
      fontSize: 10,
    },
  });

  const PDFReport = () => (
    <Document>
      <Page style={styles.page} size="A3">
        <Text style={styles.title}>Report</Text>
        <Text style={styles.subtitle}>Select Project: {project}</Text>
        <Text style={styles.subtitle}>Start Date: {startDate ? startDate.toLocaleDateString() : ''}</Text>
        <Text style={styles.subtitle}>End Date: {endDate ? endDate.toLocaleDateString() : ''}</Text>
        <Text style={styles.subtitle}>Worked By: {workedBy}</Text>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>S.No.</Text>
            </View>
            {selectedFields.map(field => (
              <View key={field.value} style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>{field.label}</Text>
              </View>
            ))}
          </View>
          {data.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              {selectedFields.map(field => (
                <View key={field.value} style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item[field.value]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  const generatePDF = () => {
    setPreviewPDF(true);
  };

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
      
      <Table
        columns={columns}
        dataSource={tableData}
        bordered
        pagination={false}
        className="mt-4"
      />
      
      {/* <Button type="primary" onClick={generatePDF} className="mt-3">
        Download PDF
      </Button> */}
      
      {/* Preview PDF Section */}
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
