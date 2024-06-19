// FieldSelectionModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const FieldSelectionModal = ({ show, onHide, fields, onFieldSelect }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select Field</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {fields.map((field, index) => (
            <li key={index}>
              <Button variant="primary" onClick={() => onFieldSelect(field)}>
                {field}
              </Button>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
};

export default FieldSelectionModal;
