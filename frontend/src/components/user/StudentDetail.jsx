import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Toast from './Toast';

const StudentDetail = () => {
    const navigate = useNavigate('');

    const [user, setUser] = useState(null);
    // const [loading, setLoading] = useState(true);
    const { id } = useParams('');
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');
    const [showPopup, setShowPopup] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [error, setError] = useState('');

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    useEffect(() => {

        const getStudentData = async () => {

            try {
                const response = await axios.get(`http://localhost:8080/user/${id}`, {
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

                            const retryResponse = await axios.get(`http://localhost:8080/user/${id}`, {
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

        getStudentData();
    }, []);

    if (!user) {
        return <p>Error fetching profile data</p>;
    }

    return (
        <>
        </>
    );
};

export default StudentDetail;
