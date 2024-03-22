import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';


const CreateStudentForm = ({ toggleForm }) => {
    const navigate = useNavigate();
    const [name, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [courseId, setCourseId] = useState('');
    const [courses, setCourses] = useState([]);

    //get token
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');

    useEffect(() => {

        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8080/users/get-course',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                },);

            setCourses(response.data);

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

                        const retryResponse = await axios.get('http://localhost:8080/users/get-course/',
                            {

                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                        setCourses(response.data);
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
    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            console.log(courseId)
            const response = await axios.post(
                'http://localhost:8080/users/create/',
                { name, email, courseId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success(response.data.message);
            setFullName('');
            setEmail('');
            setCourseId('');
            toggleForm();

        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.error);
            }
        }
    };

    const handleOutsideClick = (e) => {
        const formContainer = document.getElementById('create-student-form');
        if (formContainer && !formContainer.contains(e.target)) {
            toggleForm();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [toggleForm]);

    return (
        <div>
            <div id="create-student-form" className="popup">
                <div className="popup-content">
                    <span className="close" onClick={toggleForm}>&times;</span>
                    <h3 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-2xl dark:text-white">Create Student</h3>
                    <form onSubmit={handleCreateStudent}>
                        <div className="mb-5">
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Student Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setFullName(e.target.value)}
                                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Student email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                placeholder="name@flowbite.com"
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Course</label>
                            <select
                                id="course"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                required
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add new Student</button>
                    </form>
                </div>
            </div>

            {/* <button type="button" onClick={() => setShowForm(true)} className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create Student</button> */}
        </div>
    );
};

export default CreateStudentForm;
