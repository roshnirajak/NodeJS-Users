import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function StudentDetails() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { studentId } = useParams();

  //get token
  const token = localStorage.getItem('accessToken');
  const refresh_token = localStorage.getItem('refreshToken');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/users/get-one/`,{
            params:{
                id: studentId
            },
            headers: {
                Authorization: `Bearer ${token}`
              }
        });
        setStudent(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student:', error);
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  if (!student) {
    return <div className="text-center mt-4">Student not found</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mt-4">
      <h2 className="text-xl font-bold mb-4">Student Details</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
        <p className="text-gray-700">{student.name}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">ID:</label>
        <p className="text-gray-700">{student.student_id}</p>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
        <p className="text-gray-700">{student.email}</p>
      </div>
    </div>
  );
}

export default StudentDetails;
