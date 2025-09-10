import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// You can add props if you want to make it more dynamic
const Toast: React.FC = () => (
  <ToastContainer
    position="top-right"
    autoClose={2000}
    hideProgressBar={true}
    newestOnTop
    closeOnClick
    pauseOnFocusLoss
    draggable
    pauseOnHover
  />
);

export default Toast;
