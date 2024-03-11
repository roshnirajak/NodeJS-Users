import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Toast from './Toast';

const Profile = () => {
    const navigate = useNavigate('');

    const [user, setUser] = useState(null);
    // const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');
    const [showPopup, setShowPopup] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [error, setError] = useState('');

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(
                `http://localhost:8080/api/change-password`,{},
                {
                    headers: {
                        oldpassword: oldPassword,
                        newpassword: newPassword,
                        email: user.email,
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(response.data);
            toast.success(response.data.message);
            
            setError('');
            togglePopup();

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (error) {
            console.error('Error changing password:', error.response.data);
            toast.error(error.response.data.error);
            setError(error.response.data.error);
        }
    };
    useEffect(() => {

        const getProfileData = async () => {

            try {
                const response = await axios.get('http://localhost:8080/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(response.data.user);
                // setLoading(false);
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

                            const retryResponse = await axios.get('http://localhost:8080/api/profile', {
                                headers: {
                                    Authorization: `Bearer ${newAccessToken}`
                                }
                            });
                            setUser(retryResponse.data.user)
                            console.log('Retried request:', retryResponse.data);
                        }

                    } catch (refreshError) {
                        console.log('Error refreshing token:');
                        console.clear();
                        navigate('/login')
                    }
                }
                else {
                    console.clear();
                    navigate('/login')
                }
            }
        };

        getProfileData();
    }, []);

    if (!user) {
        return <p>Error fetching profile data</p>;
    }

    return (
        <><Toast />
            <div style={{ position: 'absolute', right: '50%', top: '30%', transform: 'translate(50%, -20%)' }}>


                <span className="justify-center block max-w-sm p-6 bg-white border border-gray-200 
            rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">

                    <h5 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">My Profile</h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">ID: {user.admin_id}</p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">Name: {user.name}</p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">Email: {user.email}</p>
                </span>

                <br />
                <button onClick={togglePopup} className="change-password-button">
                    Change Password
                </button>

                {showPopup && (
                    <div className="popup">
                        <div className="popup-content">
                            <div onClick={togglePopup} className="close-icon">
                                &times;
                            </div>
                            <h3 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-2xl dark:text-white">Update Password</h3>
                            <br /><br />
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Old Password</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
                                </div>


                                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Change Password</button>
                            </form>

                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;
