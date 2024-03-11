import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckLog = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState('')
  const token = localStorage.getItem('accessToken');
  const refresh_token = localStorage.getItem('refreshToken');

  useEffect(() => {
    getLogs();
  }, []);

  const getLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/get-logs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLogs(response.data.adminLogs);
      // setUsers(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Access Token expired. Refreshing token...');
        console.log("refresh token: ", refresh_token)
        try {
          const refreshResponse = await axios.post('http://localhost:8080/api/refresh-token/', null, {
            headers: {
              Authorization: `Bearer ${refresh_token}`
            }
          });
          if (refreshResponse) {
            const newAccessToken = refreshResponse.data.accessToken;
            const newRefreshToken = refreshResponse.data.refreshToken;

            localStorage.setItem('accessToken', newAccessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            const retryResponse = await axios.get('http://localhost:8080/api/get-logs', {
              headers: {
                Authorization: `Bearer ${newAccessToken}`
              }
            });
            setLogs(response.data.adminLogs);
            console.log('Retried request:', retryResponse.data);
          }

        } catch (refreshError) {
          console.log('Error refreshing token:');
          console.clear();
          navigate('/login')
        }
        finally {
          setLoading(false);
        }
      }
      else {
        console.clear();
        navigate('/login')
      }
    }
  };
  return (
    <div>
      <h2 className="mb-4 text-3xl text-center font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white">Admin Logs</h2>

      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Log No.
            </th>
            <th scope="col" className="px-6 py-3">
              Action
            </th>
            <th scope="col" className="px-6 py-3">
              Student
            </th>
            <th scope="col" className="px-6 py-3">
              Timestamp
            </th>
          </tr>

        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.log_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">


              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {log.log_id}
              </th>
              <td className="px-6 py-4">
                {(() => {
                  switch (log.action) {
                    case 'create':
                      return <font color="green">Created</font>;
                    case 'update':
                      return <font color="blue">Updated</font>;
                    case 'delete':
                      return <font color="red">Deleted</font>;
                    default:
                      return null;
                  }
                })()}


              </td>
              <td className="px-6 py-4">
                {log.student_name}
              </td>
              <td className="px-6 py-4">
                {log.timestamp}
              </td>
            </tr>

          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckLog;
