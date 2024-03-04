import { React, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/home/Home';
import Login from './components/auth/Login';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
