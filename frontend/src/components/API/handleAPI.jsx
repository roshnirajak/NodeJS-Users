import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const navigate = useNavigate();
//get token
const token = localStorage.getItem('accessToken');
const refresh_token = localStorage.getItem('refreshToken');

const useAPI = () => {
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
      return response.data
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
            return response.data
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

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  };

}
export { fetchCourses, getAllUsers };
