import { useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/login', {
                email,
                password,
            });

            // Assuming your backend responds with status 201 upon successful login
            if (response.status === 201) {
                const { accessToken, refreshToken } = response.data;

                // Set cookies for accessToken and refreshToken
                Cookies.set('accessToken', accessToken, { expires: 1, secure: true, sameSite: 'None' });
                Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'None' });

                console.log('Login successful');
                console.log('Access Token:', accessToken);
                console.log('Refresh Token:', refreshToken);
                window.location.href='/'
            }

        } catch (error) {
            if (error.response) {
                setError(error.response.data.message);
                console.error('Login error:', error.response.data);
              } 
              else {
                setError('An unexpected error occurred. Please try again.');
                console.error('Error:', error.message);
              }
        }
    };

    return (
        <>
            <div>
                <div className="heading-content text-center">
                    <h3 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl "><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 ">Login</span> Page</h3>
                </div>

                <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
                    <div className="mb-5">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com" required />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                    </div>

                    {/* <div className="flex items-start mb-5">
                        <div className="flex items-center h-5">
                            <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required />
                        </div>
                        <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Remember me</label>
                    </div> */}
                    <button type="submit" className="text-white bg-sky-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login</button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>

            </div>

        </>
    )
}

export default Login
