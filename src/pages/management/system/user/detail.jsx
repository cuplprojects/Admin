import { Button, Col, Form, Input, Row, Space, Modal, notification } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, Navigate } from 'react-router-dom'; // Import Link from react-router-dom
import { useRouter } from '@/router/hooks';

export default function GeneralTab() {
  const { push } = useRouter()
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleId: 0,
  });

  const [userList, setUserList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('https://localhost:7290/api/Users1');
        setUserList(res.data);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:7290/api/Users1', userData);
      setUserData({
        firstName: '',
        lastName: '',
        email: '',
        roleId: 0,
      });
      notification.success({
        message: 'Update success!',
        duration: 3,
      });
      const res = await axios.get('https://localhost:7290/api/Users1');
      setUserList(res.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    console.log(user)
    setUserData(user);
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    if (editingUser && editingUser.userId) {
      try {
        await axios.put(`https://localhost:7290/api/Users1/${editingUser.userId}`, userData);
        setIsModalVisible(false);
        setEditingUser(null);
        setUserData({
          firstName: '',
          lastName: '',
          email: '',
          roleId: 0,
        });
        notification.success({
          message: 'User updated successfully!',
          duration: 3,
        });
        const res = await axios.get('https://localhost:7290/api/Users1');
        setUserList(res.data);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      notification.error({
        message: 'Invalid user ID',
        duration: 3,
      });
    }
  };

  // Function to navigate to the form section


  return (
    <Row>
      <Col span={24}>
        {/* Add User Button */}
        <Col span={24} style={{ marginBottom: '1rem', textAlign: 'right' }}>
      <Button type="primary"  onClick={() => push('/management/user/AddUser')}>Add User</Button>
    </Col>
        <div className="card">
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">SN.</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, index) => (
                  <tr key={user.userId}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.roleName}</td>
                    <td>
                      <Button onClick={() => handleEdit(user)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Col>

      <Modal
        title="Edit User"
        visible={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form>
          <Form.Item label="First Name">
            <Input name="firstName" value={userData.firstName} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Last Name">
            <Input name="lastName" value={userData.lastName} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Email">
            <Input name="email" value={userData.email} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Role ID">
            <Input name="roleId" value={userData.roleId} onChange={handleChange} />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
}
