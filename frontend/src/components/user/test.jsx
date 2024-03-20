import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Toast from './Toast';

const Test = () => {
    const navigate= useNavigate();
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState('')
    const [perPage, setPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');


    //get token
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');

    useEffect(() => {
        getAllUsers(currentPage, perPage);
    }, [currentPage, perPage, searchTerm]);

    const getAllUsers = async (pageNumber, perPage) => {
        try {
            const response = await axios.get(`http://localhost:8080/users/get-all`,
                {
                    params: {
                        page: pageNumber,
                        usersPerPage: perPage,
                        search: searchTerm,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            setUsers(response.data.users);
            console.log(users)
            setTotalPages(response.data.totalPages);
            setTotalStudents(response.data.totalCount)
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

                        const retryResponse = await axios.get('http://localhost:8080/users/get-all/',
                            {
                                params: {
                                    page: pageNumber,
                                    usersPerPage: perPage,
                                    search: searchTerm,
                                },
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });

                        setUsers(response.data.users);
                        setTotalPages(response.data.totalPages);
                        setTotalStudents(response.data.totalCount)
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
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 mr-1 rounded" onClick={() => handleUpdate(row)}>Update</button>
                </div>
            ),
        },
        {
            name: 'Delete',
            cell: (row) => (
                <div>
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" onClick={() => handleDelete(row)}>Delete</button>
                </div>
            ),
        }
    ];

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (newPerPage, currentPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1); // Reset to the first page when changing page size
    };
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };


    return (
        <div>
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
                    </div>
                }
            />
            Total {totalStudents}
        </div>
    );
};

export default Test;

