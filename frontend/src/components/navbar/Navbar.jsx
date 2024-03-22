import { React, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../user/Notification';

function Navbar() {
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);

    //get token
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');

    const [notificationCount, setNotificationCount] = useState('');
    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const response = await axios.get('http://localhost:8080/notifications/get-notification-count', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setNotificationCount(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.log('Access Token expired. Refreshing token...');
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

                            const retryresponse = await axios.get('http://localhost:8080/notifications/get-notification-count', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            setNotificationCount(retryresponse.data);
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
        fetchNotificationCount()
    }, [])
    const toggleNotification = () => {
        setShowNotification((prev) => !prev);
    };
    const removeCookies = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.clear();
        navigate('/login');
    }

    return (
        <>
            <nav className="bg-white border-gray-200 dark:bg-gray-900">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">CRUD</span>
                    </a>
                    <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                        <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li>
                                <Link to="/">
                                    <span className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Home</span>
                                </Link>
                            </li>
                            {/* <li>
                            <Link to="/check-log">
                                <span className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Check Logs</span>
                                </Link>
                            </li> */}
                            <li>
                                <Link to="/profile">
                                    <span className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Profile</span>
                                </Link>
                            </li>
                            <li>
                                <span onClick={toggleNotification} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Notifications({notificationCount})</span>
                                {showNotification && <Notification />}

                            </li>
                            <li>
                                <span onClick={removeCookies} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Logout</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

        </>
    )
}

export default Navbar;