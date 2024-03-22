import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  //get token
  const token = localStorage.getItem('accessToken');
  const refresh_token = localStorage.getItem('refreshToken');


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:8080/notifications/get-notification', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setNotifications(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('Access Token expired. Refreshing token...');
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

              const retryresponse = await axios.get('http://localhost:8080/notifications/get-notification', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              setNotifications(retryresponse.data);
            }

          } catch (refreshError) {
            console.log('Error refreshing token:');
            console.clear();
            navigate('/login')
          }
          finally {
          }
        }
        else {
          console.clear();
          navigate('/login')
        }
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h3>Notifications</h3>
      </div>
      <div className="notification-list">
        {notifications.map((notification) => (

          <div key={notification.notification_id} className="notification-item">
            <Link to={`/student/${notification.student_id}`}>
              You {notification.action} {notification.name}
            </Link>
          </div>

        ))}
      </div>
    </div>
  );
};

export default Notification;
