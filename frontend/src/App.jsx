import { React, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import HomePage from './components/user/Home';
import Profile from './components/user/Profile';
import CheckLog from './components/user/CheckLog';
import UpdateForm from './components/user/UpdateForm';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Navbar />
              <Outlet />
            </div>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="/update/:id" element={<UpdateForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/check-log" element={<CheckLog />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
