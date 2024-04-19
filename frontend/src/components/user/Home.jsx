import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Toast from './Toast';
import CreateStudentForm from './CreateStudent';
import { useDispatch } from 'react-redux';


const HomePage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState('')
    const [perPage, setPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [courseId, setCourseId] = useState('');
    const [courses, setCourses] = useState([]);

    //get token
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');

    useEffect(() => {
        

        getAllUsers(currentPage, perPage);
        fetchCourses();
    }, [currentPage, perPage, searchTerm, courseId]);

    const getAllUsers = async (pageNumber, perPage) => {
        try {
            const response = await axios.get(`http://localhost:8080/users/get-all`, {
                params: {
                    page: pageNumber,
                    usersPerPage: perPage,
                    search: searchTerm,
                    course: courseId
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setTotalStudents(response.data.totalCount);
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

                        const retryResponse = await axios.get('http://localhost:8080/users/get-all/', {
                            params: {
                                page: pageNumber,
                                usersPerPage: perPage,
                                search: searchTerm,
                                course: courseId
                            },
                            headers: {
                                Authorization: `Bearer ${newAccessToken}`
                            }
                        });
                        setUsers(retryResponse.data.users);
                        setTotalPages(retryResponse.data.totalPages);
                        setTotalStudents(retryResponse.data.totalCount);
                        // console.log('Retried request:', retryResponse.data);
                    }

                } catch (refreshError) {
                    console.log('Error refreshing token:');
                    console.clear();
                    navigate('/login')
                }
                finally {
                    console.log("finally")
                }
            }
            else {
                console.clear();
                navigate('/login')
            }
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8080/users/get-course', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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
                                    Authorization: `Bearer ${newAccessToken}`,
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

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8080/users/delete/`,
                {
                    params: {
                        id: id,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

            // console.log(response.data);
            getAllUsers(currentPage, perPage);
            toast.success(response.data.message)
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response.data.error)
        }
    };

    const columns = [
        // Define your table columns here
        {
            name: 'S no.',
            selector: (row, index) => (currentPage - 1) * perPage + index + 1,

        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true
        },
        {
            name: 'Course',
            selector: row => row.course_name,
            sortable: true
        },
        {
            name: 'Update',
            cell: (row) => (
                <div>
                    <button onClick={() => navigate(`/update/${row.student_id}`)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 mr-1 rounded" >Update</button>
                </div>
            ),
        },
        {
            name: 'Delete',
            cell: (row) => (
                <div>
                    <button onClick={() => handleDelete(row.student_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
                </div>
            ),
        }
    ];



    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const handlePerPageChange = (newPerPage, currentPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1); //reset to the first page when changing page size
    };
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };


    const toggleCreateForm = () => {
        setShowCreateForm(!showCreateForm);
    };

    return (
        <div>
            <Toast />
            <button type="button" onClick={toggleCreateForm} className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create Student</button>
            {showCreateForm && <CreateStudentForm toggleForm={toggleCreateForm} />}

            <DataTable
                title="Students"
                columns={columns}
                data={users}
                pagination
                paginationServer
                paginationTotalRows={totalPages * perPage}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[5, 10, 15, 20]}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerPageChange}
                paginationComponentOptions={{
                    rowsPerPageText: 'Rows per page:',
                    rangeSeparatorText: 'of',
                    noRowsPerPage: false,
                    selectAllRowsItem: false,
                    selectAllRowsItemText: 'All',
                }}
                subHeader
                subHeaderComponent={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="form-control mr-2"
                        />

                        <select
                            id="course"
                            value={courseId}
                            onChange={(e) => {
                                setCourseId(e.target.value);
                            }}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                            required
                        >
                            <option value="">All Courses</option>
                            {courses.map((course) => (

                                <option key={course.course_id} value={course.course_id}>
                                    {course.course_name}
                                </option>
                            ))}
                        </select>

                    </div>
                }
            />
            Total {totalStudents} Students
        </div>
    );
};

export default HomePage;

