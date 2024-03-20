import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'
import Cookies from 'js-cookie'
import { get, post, put, del, patch } from '../API/handleAPI';
import { toast } from 'react-toastify';
import Toast from './Toast';


function UpdateForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState({
        name: '',
        email: '',
    });
    const [name, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const token = localStorage.getItem('accessToken');
    const refresh_token = localStorage.getItem('refreshToken');

    useEffect(() => {
        console.log("id", id)
        const getUser = async (e) => {
            try {
                const response = await axios.get(`http://localhost:8080/users/get-one`, 
                {
                    params:{
                        id: id
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // console.log(response.data);
                setUser(response.data);
                setFullName(response.data.name)
                setEmail(response.data.email);

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
                    }
                }
                else {
                    console.clear();
                    navigate('/login')
                }
            }
        };
        getUser();
    }, [])

    const updateStudent = async (e) => {
        e.preventDefault();

        const updatedUser = { name, email };

        try {
            const response = await axios.put(
                `http://localhost:8080/users/update-row`,
                { ...updatedUser },  // Spread the updatedUser object
                {
                    params: {
                        id: user.student_id
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            //   console.log(response)
            toast.success(response.data.message);
            setTimeout(() => {
                navigate(-1);
            }, 4000);

        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.error);
            }
        }
    };
    return (
        <>
            <div><br /> <br />
                <form onSubmit={updateStudent} className="max-w-sm mx-auto">
                    <Toast />
                    <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white">Update data</h2>
                    <div className="mb-5">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setFullName(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" required />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="name@flowbite.com" required />
                    </div>

                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Update Data</button>
                    <br />
                </form>
            </div>

        </>
    )
}

export default UpdateForm;
