import { React, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
import { toast } from 'react-toastify';
import Toast from './Toast';
import ReactPaginate from 'react-paginate';

const HomePage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [name, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    //get token
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');


    const getAllUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/users/get-all`,
                {
                    params: {
                        page:1,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

            if (response) {
                // console.log(response.data);
                setUsers(response.data);
            }
            if (!response) {
                console.log("Empty")
            }
            setLoading(false);
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
                            headers: {
                                Authorization: `Bearer ${newAccessToken}`
                            }
                        });
                        setUsers(retryResponse.data);
                        // console.log('Retried request:', retryResponse.data);
                    }

                } catch (refreshError) {
                    console.log('Error refreshing token:');
                    console.clear();
                    navigate('/login')
                }
                finally {
                    setLoading(false);
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
            getAllUsers();
            toast.success(response.data.message)
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response.data.error)
        }
    };


    //show pop up form
    const [showForm, setShowForm] = useState(false);
    const handleShowForm = () => {
        setShowForm(true);
    };
    const handleHideForm = () => {
        setShowForm(false);
    };
    const handleCreateStudent = async (e) => {
        e.preventDefault();
        // console.log("email: ", email, "name: ", name)
        try {
            const response = await axios.post(
                'http://localhost:8080/users/create/',
                { name, email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            toast.success(response.data.message);
            setFullName('');
            setEmail('');
            handleHideForm(false)
            getAllUsers();

        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.error);
            }
        }
    };
    const formatDate = (dateString) => {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC',
        };

        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', options);
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    return (
        <div>
            {loading ? (
                <div className="text-center">
                    <div role="status">
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="relative overflow-x-auto">
                    <h2 className="mb-4 text-3xl text-center font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white">Homepage / Dashboard</h2>

                    <button type="button" onClick={handleShowForm} className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create Student</button>
                    {showForm && (
                        <div className="popup">
                            <div className="popup-content">
                                <span className="close" onClick={handleHideForm}>&times;</span>
                                <h3 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-2xl dark:text-white">Create Student</h3>
                                <form onSubmit={handleCreateStudent}>

                                    <div className="mb-5">
                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Student Full Name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
                                    </div>
                                    <div className="mb-5">
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Student email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="name@flowbite.com" required />
                                    </div>
                                    {error && <p style={{ color: 'red' }}>{error}</p>}<br />
                                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add new Student</button>
                                </form>
                            </div>
                        </div>
                    )}
                    <Toast />

                   
                </div>
            )}
        </div>
    );
}

export default HomePage;