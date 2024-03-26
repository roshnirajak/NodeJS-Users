import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { clearNotifications } from '../redux/slices/notification';

const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notification.notifications);

  //get token
  const token = localStorage.getItem('accessToken');
  const refresh_token = localStorage.getItem('refreshToken');

  const clearAllNotifications = async () => {
    try {
      await axios.put('http://localhost:8080/notifications/clear', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(clearNotifications());
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  return (
    <div className="notification-container">
      <div className="notification-header">
        <h3>Notifications</h3>
      </div>

      <button onClick={clearAllNotifications}>Clear Notifications</button>

      <div className="notification-list">
        {notifications.flat().map((notification) => (
          <div key={notification.notification_id} className="notification-item">
            
              You {notification.action} {notification.name}

          </div>
        ))}

      </div>
    </div>
  );
};

export default Notification;
