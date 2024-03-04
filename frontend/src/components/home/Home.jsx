import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import Cookies from 'js-cookie';

const HomePage = () => {
    //   const [data, setData] = useState('');
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const token = Cookies.get('accessToken');
        const refresh_token = Cookies.get('refreshToken');

        const getAllUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response) {
                    console.log(response.data);
                    setUsers(response.data);
                }
                if (!response) {
                    console.log("Empty")
                }
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

                            Cookies.set('accessToken', newAccessToken, { expires: 1, secure: true, sameSite: 'None' });
                            Cookies.set('refreshToken', newRefreshToken, { expires: 7, secure: true, sameSite: 'None' });

                            // Now retry the original request with the new access token
                            const retryResponse = await axios.get('http://localhost:8080/users/', {
                                headers: {
                                    Authorization: `Bearer ${newAccessToken}`
                                }
                            });

                            console.log('Retried request:', retryResponse.data);
                        }

                    } catch (refreshError) {
                        console.log('Error refreshing token:');
                        console.clear();
                        navigate('/login')
                        // Handle refresh token error
                    }
                }
                else {
                    console.clear();
                    navigate('/login')
                }
            }
        };

        getAllUsers();
    }, []);


    return (
        <div>
            <header>
                <h1>My Simple React Home Page</h1>
            </header>


            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                User ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Full Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Created At
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {user.id}
                                </th>
                                <td className="px-6 py-4">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4">
                                    {user.created_at}
                                </td>
                                <td className="px-6 py-4">
                                <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Update</button>


                                </td>
                                <td className="px-6 py-4">
                                    <button type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Delete</button>

                                </td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default HomePage;