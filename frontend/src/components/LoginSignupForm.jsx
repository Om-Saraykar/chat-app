import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginSignupForm() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isLoginMode ? '/login' : '/signup';
      const response = await axios.post(`http://localhost:5000${url}`, formData);
      
      console.log(response.data); // Check if you receive the correct response

      if (isLoginMode) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('chatId', response.data.chatId); // Store the chatId
        localStorage.setItem('userId', response.data._id); // Store the MongoDB _id
        console.log('Token stored:', localStorage.getItem('token')); // Check if token is stored correctly
        console.log('User ID stored:', localStorage.getItem('userId')); // Check if userId is stored correctly
        console.log('Navigating to dashboard');
        navigate('/dashboard'); // Navigate to the dashboard after successful login
      } else {
        toggleMode();
        alert("Signup successful! Please log in.");
      }
    } catch (error) {
      console.error('Error during login/signup:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="px-12 py-12 border bg-white rounded-xl shadow-sm">
        {isLoginMode ? (
          <>
            <h2 className="text-center mb-4 font-bold text-[25px]">Login</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                className='px-2 py-2 border border-gray-200 rounded'
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                className='px-2 py-2 border border-gray-200 rounded'
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button className='px-2 py-2 bg-blue-500 text-white rounded cursor-pointer' type="submit">Login</button>
              <p className="text-center mt-2">Don't have an account? <a href="#" className='text-blue-500 font-bold' onClick={toggleMode}>Sign up</a></p>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-center mb-4 font-bold text-[25px]">Sign up</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                className='px-2 py-2 border border-gray-200 rounded'
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                className='px-2 py-2 border border-gray-200 rounded'
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                className='px-2 py-2 border border-gray-200 rounded'
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button className='px-2 py-2 bg-blue-500 text-white rounded cursor-pointer' type="submit">Sign up</button>
              <p className="text-center mt-2">Already have an account? <a href="#" className='text-blue-500 font-bold' onClick={toggleMode}>Login</a></p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginSignupForm;
