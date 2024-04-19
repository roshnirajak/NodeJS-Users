import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = ({ message }) => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={true}
      newestOnTop
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      closeButton={false}
    />
  );
};

export default Toast;
