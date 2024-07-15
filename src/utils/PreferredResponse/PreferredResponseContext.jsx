import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { notification } from 'antd';
import { useProjectId } from '@/store/ProjectState';

const apiUrl = import.meta.env.VITE_API_URL;

// Create a context for preferred responses
const PreferredResponseContext = createContext();

export const usePreferredResponse = () => {
  return useContext(PreferredResponseContext);
};

export const PreferredResponseProvider = ({ children }) => {
  const projectId = useProjectId();
  const [preferredResponse, setPreferredResponse] = useState('');

  const fetchPreferredResponse = async (fieldName) => {
    try {
      const response = await axios.get(
        `${apiUrl}/Registration/GetUniqueValues?whichDatabase=Local&key=${fieldName}&ProjectId=${projectId}`,
      );
      const data = response.data || []; // Ensure data is an array or handle accordingly

      // Check if data is an empty array
      if (Array.isArray(data) && data.length === 0) {
        setPreferredResponse('');
        notification.error({
          message: 'No Preferred Response found',
        }); // Set preferredResponse to empty string
        return ''; // Return empty string for autofill
      }

      const responseString = data.join(','); // Convert array to comma-separated string
      setPreferredResponse(responseString);
      return responseString; // Return the comma-separated string
    } catch (error) {
      console.error('Error fetching preferred response:', error);
      notification.error({
        message: 'No Preferred Response found',
      });
      return '1,2,3,4,5'; // Return a dummy response or handle the error as needed
    }
  };

  return (
    <PreferredResponseContext.Provider value={{ preferredResponse, fetchPreferredResponse }}>
      {children}
    </PreferredResponseContext.Provider>
  );
};
