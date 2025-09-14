import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setError(response.data.message || 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.response?.data?.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <Layout>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              No profile data available
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    const firstInitial = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
    const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : 'S';
    return `${firstInitial}${lastInitial}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return '₱0.00';
    return `₱${parseFloat(salary).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <Layout>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture Card */}
            <div className="card bg-white shadow-md">
              <div className="card-body flex flex-col items-center">
                <h2 className="card-title text-xl font-bold text-gray-800 mb-6 self-start">
                  <i className="fas fa-user text-blue-500 mr-2"></i>
                  Profile Picture
                </h2>
                
                <div className="avatar mb-6">
                  <div className="w-40 h-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-blue-500 flex items-center justify-center overflow-hidden">
                    <span className="text-4xl font-bold text-white flex items-center justify-center w-full h-full">
                      {getUserInitials()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 w-full">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Update Profile Picture</span>
                    </label>
                    <input 
                      type="file" 
                      className="file-input file-input-bordered w-full" 
                      accept="image/*" 
                      disabled
                    />
                  </div>
                  
                  <button className="btn btn-primary w-full" disabled>
                    <i className="fas fa-upload mr-2"></i>
                    Upload New Picture
                  </button>
                </div>
              </div>
            </div>
            
            {/* Personal Information Card */}
            <div className="card bg-white shadow-md lg:col-span-2">
              <div className="card-body">
                <h2 className="card-title text-xl font-bold text-gray-800 mb-6">
                  <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.first_name} {user.middle_initial ? user.middle_initial + '.' : ''} {user.last_name}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.user_id || 'Not available'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Position</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.position || 'Not available'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Office/Agency</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.department_id?.name || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date Hired</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatDate(user.start_date)}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Salary</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatSalary(user.salary)}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Profile;