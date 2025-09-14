import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import SuccessModal from './SuccessModal';
import ConfirmationModal from './ConfirmationModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  // Sample data - in a real app, this would come from the backend
  const vacationBalance = 15.000;
  const sickBalance = 12.000;

  // State for recent leave requests
  const [recentLeaveRequests, setRecentLeaveRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disapproved':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'disapproved':
        return 'Disapproved';
      case 'recommended':
        return 'Recommended';
      case 'hr_approved':
        return 'HR Approved';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Quick Leave Request State
  const [quickLeaveData, setQuickLeaveData] = useState({
    step: 1,
    leaveType: '',
    vacationSubtype: '',
    vacationOtherSpecify: '',
    sickSubtype: '',
    sickOtherSpecify: '',
    startDate: '',
    endDate: '',
    numberOfDays: 1,
    locationType: '',
    locationSpecify: '',
    commutation: false
  });

  const [quickLeaveErrors, setQuickLeaveErrors] = useState({});
  const [dateWarning, setDateWarning] = useState('');
  const [minStartDate, setMinStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch recent leave requests
  useEffect(() => {
    const fetchRecentLeaveRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/leave-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          // Limit to 5 most recent requests
          const recentRequests = response.data.data.slice(0, 5);
          setRecentLeaveRequests(recentRequests);
        }
      } catch (error) {
        console.error('Error fetching recent leave requests:', error);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRecentLeaveRequests();
  }, []);

  // Set minimum start date based on today
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    setMinStartDate(formattedToday);
    
    // Set default dates to today
    setQuickLeaveData(prev => ({
      ...prev,
      startDate: formattedToday,
      endDate: formattedToday
    }));
  }, []);

  // Handle input changes
  const handleQuickLeaveChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setQuickLeaveData({
      ...quickLeaveData,
      [name]: newValue
    });

    // Clear error for this field
    if (quickLeaveErrors[name]) {
      setQuickLeaveErrors({
        ...quickLeaveErrors,
        [name]: ''
      });
    }

    // Special handling for certain fields
    if (name === 'leaveType') {
      // Reset subtype fields when leave type changes
      if (value === 'vacation') {
        setQuickLeaveData(prev => ({
          ...prev,
          leaveType: value,
          vacationSubtype: '',
          sickSubtype: '',
          locationType: 'philippines'
        }));
      } else if (value === 'sick') {
        setQuickLeaveData(prev => ({
          ...prev,
          leaveType: value,
          vacationSubtype: '',
          sickSubtype: '',
          locationType: 'hospital'
        }));
      }
    } else if (name === 'startDate' || name === 'endDate') {
      // Recalculate days when dates change
      setTimeout(() => {
        calculateDays({ ...quickLeaveData, [name]: newValue });
      }, 0);
    }
  };

  // Calculate number of days between start and end dates
  const calculateDays = (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
      const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      setQuickLeaveData(prev => ({
        ...prev,
        numberOfDays: daysDiff
      }));
    }
  };

  // Validate quick leave step
  const validateQuickStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!quickLeaveData.leaveType) {
        errors.leaveType = 'Please select a leave type';
      } else if (quickLeaveData.leaveType === 'vacation') {
        if (!quickLeaveData.vacationSubtype) {
          errors.vacationSubtype = 'Please select a vacation leave subtype';
        } else if (quickLeaveData.vacationSubtype === 'other' && !quickLeaveData.vacationOtherSpecify.trim()) {
          errors.vacationOtherSpecify = 'Please specify the other purpose';
        }
      } else if (quickLeaveData.leaveType === 'sick') {
        if (!quickLeaveData.sickSubtype) {
          errors.sickSubtype = 'Please select a sick leave subtype';
        } else if (quickLeaveData.sickSubtype === 'other' && !quickLeaveData.sickOtherSpecify.trim()) {
          errors.sickOtherSpecify = 'Please specify the other details';
        }
      }
    } else if (step === 2) {
      if (!quickLeaveData.startDate) {
        errors.startDate = 'Please select a start date';
      }
      if (!quickLeaveData.endDate) {
        errors.endDate = 'Please select an end date';
      }
      
      if (quickLeaveData.startDate && quickLeaveData.endDate) {
        const start = new Date(quickLeaveData.startDate);
        const end = new Date(quickLeaveData.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (end < start) {
          errors.endDate = 'End date cannot be earlier than start date';
        }
        
        // Vacation leave specific validation
        if (quickLeaveData.leaveType === 'vacation') {
          const daysDifference = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
          if (daysDifference < 5) {
            errors.startDate = 'Vacation leave must be applied at least 5 days before the start date';
            setDateWarning(`(${daysDifference} days notice - requires 5 days minimum)`);
          } else {
            setDateWarning(`(${daysDifference} days notice - OK)`);
          }
        }
      }
    } else if (step === 3) {
      if (!quickLeaveData.locationType) {
        errors.locationType = 'Please select where the leave will be spent';
      }
      
      if (quickLeaveData.locationType === 'abroad' && !quickLeaveData.locationSpecify.trim()) {
        errors.locationSpecify = 'Please specify the country';
      } else if (quickLeaveData.locationType === 'outpatient' && !quickLeaveData.locationSpecify.trim()) {
        errors.locationSpecify = 'Please specify the location';
      }
    }

    setQuickLeaveErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigate to next step
  const nextQuickStep = (currentStep) => {
    if (validateQuickStep(currentStep)) {
      setQuickLeaveData({
        ...quickLeaveData,
        step: currentStep + 1
      });
      setQuickLeaveErrors({});
      setDateWarning('');
    }
  };

  // Navigate to previous step
  const prevQuickStep = (currentStep) => {
    setQuickLeaveData({
      ...quickLeaveData,
      step: currentStep - 1
    });
    setQuickLeaveErrors({});
    setDateWarning('');
  };

  // Show location options based on leave type
  const showLocationOptions = () => {
    if (quickLeaveData.leaveType === 'vacation') {
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="locationType" 
              value="philippines" 
              className="radio radio-sm radio-primary"
              checked={quickLeaveData.locationType === 'philippines'}
              onChange={handleQuickLeaveChange}
            />
            <span>Within the Philippines</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="locationType" 
              value="abroad" 
              className="radio radio-sm radio-primary"
              checked={quickLeaveData.locationType === 'abroad'}
              onChange={handleQuickLeaveChange}
            />
            <span>Abroad (specify)</span>
          </label>
          {quickLeaveData.locationType === 'abroad' && (
            <div className="pl-6">
              <input 
                type="text" 
                name="locationSpecify" 
                className="input input-bordered input-sm w-full" 
                placeholder="Country"
                value={quickLeaveData.locationSpecify}
                onChange={handleQuickLeaveChange}
              />
              {quickLeaveErrors.locationSpecify && (
                <div className="text-red-500 text-sm mt-1">{quickLeaveErrors.locationSpecify}</div>
              )}
            </div>
          )}
        </div>
      );
    } else if (quickLeaveData.leaveType === 'sick') {
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="locationType" 
              value="hospital" 
              className="radio radio-sm radio-primary"
              checked={quickLeaveData.locationType === 'hospital'}
              onChange={handleQuickLeaveChange}
            />
            <span>In Hospital</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="locationType" 
              value="outpatient" 
              className="radio radio-sm radio-primary"
              checked={quickLeaveData.locationType === 'outpatient'}
              onChange={handleQuickLeaveChange}
            />
            <span>Outpatient (specify)</span>
          </label>
          {quickLeaveData.locationType === 'outpatient' && (
            <div className="pl-6">
              <input 
                type="text" 
                name="locationSpecify" 
                className="input input-bordered input-sm w-full" 
                placeholder="Location"
                value={quickLeaveData.locationSpecify}
                onChange={handleQuickLeaveChange}
              />
              {quickLeaveErrors.locationSpecify && (
                <div className="text-red-500 text-sm mt-1">{quickLeaveErrors.locationSpecify}</div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Update end date min when start date changes
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    handleQuickLeaveChange(e);
    
    // Update end date if it's before the new start date
    if (quickLeaveData.endDate && newStartDate > quickLeaveData.endDate) {
      setQuickLeaveData(prev => ({
        ...prev,
        startDate: newStartDate,
        endDate: newStartDate
      }));
    }
  };

  // Set vacation leave date restrictions
  const getMinStartDateForVacation = () => {
    if (quickLeaveData.leaveType === 'vacation') {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 5);
      return minDate.toISOString().split('T')[0];
    }
    return minStartDate;
  };

  // Handle leave request submission
  const submitLeaveRequest = async () => {
    // Close confirmation modal
    setShowConfirmModal(false);
    setLoading(true);
    setErrorMessage('');

    try {
      // Prepare data for submission
      const requestData = {
        leave_type: quickLeaveData.leaveType,
        subtype: quickLeaveData.leaveType === 'vacation' 
          ? quickLeaveData.vacationSubtype === 'other' 
            ? quickLeaveData.vacationOtherSpecify 
            : quickLeaveData.vacationSubtype
          : quickLeaveData.sickSubtype === 'other' 
            ? quickLeaveData.sickOtherSpecify 
            : quickLeaveData.sickSubtype,
        start_date: quickLeaveData.startDate,
        end_date: quickLeaveData.endDate,
        number_of_days: quickLeaveData.numberOfDays,
        where_spent: quickLeaveData.locationType,
        commutation: quickLeaveData.commutation,
        location_specify: quickLeaveData.locationSpecify
      };

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Make API call
      const response = await axios.post('http://localhost:5000/api/leave-requests', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Show success modal
        setShowSuccessModal(true);
        
        // Reset form after a delay
        setTimeout(() => {
          const today = new Date().toISOString().split('T')[0];
          setQuickLeaveData({
            step: 1,
            leaveType: '',
            vacationSubtype: '',
            vacationOtherSpecify: '',
            sickSubtype: '',
            sickOtherSpecify: '',
            startDate: today,
            endDate: today,
            numberOfDays: 1,
            locationType: '',
            locationSpecify: '',
            commutation: false
          });
          setShowSuccessModal(false);
        }, 3000); // Auto-close after 3 seconds
      } else {
        setErrorMessage(response.data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to submit leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Leave Credits Container */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Credits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
            {/* Vacation Leave Card - Better centered design */}
            <div className="bg-blue-50 rounded-lg flex flex-col h-full">
              <div className="p-4 flex flex-col items-center justify-center flex-grow text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-3">
                  <i className="fas fa-umbrella-beach text-blue-600 text-2xl"></i>
                </div>
                <div className="text-blue-800 mb-1">
                  <div className="text-sm font-medium">Vacation Leave</div>
                  <div className="text-3xl font-semibold mt-1">{vacationBalance.toFixed(3)}</div>
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  Days available
                </div>
              </div>
            </div>

            {/* Sick Leave Card - Better centered design */}
            <div className="bg-green-50 rounded-lg flex flex-col h-full">
              <div className="p-4 flex flex-col items-center justify-center flex-grow text-center">
                <div className="bg-green-100 p-4 rounded-full mb-3">
                  <i className="fas fa-thermometer-half text-green-600 text-2xl"></i>
                </div>
                <div className="text-green-800 mb-1">
                  <div className="text-sm font-medium">Sick Leave</div>
                  <div className="text-3xl font-semibold mt-1">{sickBalance.toFixed(3)}</div>
                </div>
                <div className="text-xs text-green-700 mt-2">
                  Days available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Leave Request */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <i className="fas fa-calendar-plus text-blue-500 mr-2"></i>
            Quick Leave Request
          </h3>
          
          {/* Step Indicator */}
          <div className="w-full py-2 mb-3">
            <ul className="steps steps-horizontal w-full steps-sm">
              <li className={`step ${quickLeaveData.step >= 1 ? 'step-primary' : ''}`}>Type</li>
              <li className={`step ${quickLeaveData.step >= 2 ? 'step-primary' : ''}`}>Dates</li>
              <li className={`step ${quickLeaveData.step >= 3 ? 'step-primary' : ''}`}>Details</li>
            </ul>
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* Step 1: Leave Type */}
          {quickLeaveData.step === 1 && (
            <div className="space-y-3">
              {quickLeaveErrors.leaveType && (
                <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  <span>{quickLeaveErrors.leaveType}</span>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="leaveType" 
                    value="vacation" 
                    className="radio radio-sm radio-primary"
                    checked={quickLeaveData.leaveType === 'vacation'}
                    onChange={handleQuickLeaveChange}
                  />
                  <span>Vacation Leave</span>
                </label>
                
                {/* Vacation Subtypes */}
                {quickLeaveData.leaveType === 'vacation' && (
                  <div className="pl-6 space-y-2">
                    <div className="alert bg-blue-100 border border-blue-300 text-blue-700 px-4 py-2 rounded mb-2">
                      <i className="fas fa-info-circle mr-2"></i>
                      <span className="text-xs">Vacation leave must be applied at least 5 days before the start date</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="vacationSubtype" 
                        value="employment" 
                        className="radio radio-xs radio-primary"
                        checked={quickLeaveData.vacationSubtype === 'employment'}
                        onChange={handleQuickLeaveChange}
                      />
                      <span className="text-sm">To seek employment</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="vacationSubtype" 
                        value="other" 
                        className="radio radio-xs radio-primary"
                        checked={quickLeaveData.vacationSubtype === 'other'}
                        onChange={handleQuickLeaveChange}
                      />
                      <span className="text-sm">Other purpose (specify)</span>
                    </label>
                    {quickLeaveData.vacationSubtype === 'other' && (
                      <div className="pl-6">
                        <input 
                          type="text" 
                          name="vacationOtherSpecify" 
                          className="input input-bordered input-sm w-full" 
                          placeholder="Please specify"
                          value={quickLeaveData.vacationOtherSpecify}
                          onChange={handleQuickLeaveChange}
                        />
                        {quickLeaveErrors.vacationOtherSpecify && (
                          <div className="text-red-500 text-sm mt-1">{quickLeaveErrors.vacationOtherSpecify}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="leaveType" 
                    value="sick" 
                    className="radio radio-sm radio-primary"
                    checked={quickLeaveData.leaveType === 'sick'}
                    onChange={handleQuickLeaveChange}
                  />
                  <span>Sick Leave</span>
                </label>
                
                {/* Sick Leave Subtypes */}
                {quickLeaveData.leaveType === 'sick' && (
                  <div className="pl-6 space-y-2">
                    <div className="alert bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-2">
                      <i className="fas fa-check-circle mr-2"></i>
                      <span className="text-xs">Sick leave can be applied after the leave period</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sickSubtype" 
                        value="maternity" 
                        className="radio radio-xs radio-primary"
                        checked={quickLeaveData.sickSubtype === 'maternity'}
                        onChange={handleQuickLeaveChange}
                      />
                      <span className="text-sm">Maternity</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sickSubtype" 
                        value="other" 
                        className="radio radio-xs radio-primary"
                        checked={quickLeaveData.sickSubtype === 'other'}
                        onChange={handleQuickLeaveChange}
                      />
                      <span className="text-sm">Other (specify)</span>
                    </label>
                    {quickLeaveData.sickSubtype === 'other' && (
                      <div className="pl-6">
                        <input 
                          type="text" 
                          name="sickOtherSpecify" 
                          className="input input-bordered input-sm w-full" 
                          placeholder="Please specify"
                          value={quickLeaveData.sickOtherSpecify}
                          onChange={handleQuickLeaveChange}
                        />
                        {quickLeaveErrors.sickOtherSpecify && (
                          <div className="text-red-500 text-sm mt-1">{quickLeaveErrors.sickOtherSpecify}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-3">
                <button 
                  className="btn btn-sm btn-primary inline-flex items-center"
                  onClick={() => nextQuickStep(1)}
                >
                  Next
                  <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Date Selection */}
          {quickLeaveData.step === 2 && (
            <div className="space-y-3">
              {quickLeaveErrors.startDate && (
                <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  <span>{quickLeaveErrors.startDate}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium">Start Date</span>
                    {dateWarning && (
                      <span className="label-text-alt text-warning">{dateWarning}</span>
                    )}
                  </label>
                  <input 
                    type="date" 
                    name="startDate" 
                    className="input input-bordered input-sm w-full" 
                    required 
                    value={quickLeaveData.startDate}
                    onChange={handleStartDateChange}
                    min={quickLeaveData.leaveType === 'vacation' ? getMinStartDateForVacation() : minStartDate}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium">End Date</span>
                  </label>
                  <input 
                    type="date" 
                    name="endDate" 
                    className="input input-bordered input-sm w-full" 
                    required 
                    value={quickLeaveData.endDate}
                    onChange={handleQuickLeaveChange}
                    min={quickLeaveData.startDate || minStartDate}
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Number of Days</span>
                </label>
                <input 
                  type="text" 
                  name="numberOfDays" 
                  className="input input-bordered input-sm w-full" 
                  readOnly 
                  value={quickLeaveData.numberOfDays}
                />
              </div>
              
              <div className="flex justify-between mt-3">
                <button 
                  className="btn btn-sm btn-outline inline-flex items-center"
                  onClick={() => prevQuickStep(2)}
                >
                  <i className="fas fa-arrow-left mr-1"></i>
                  Back
                </button>
                <button 
                  className="btn btn-sm btn-primary inline-flex items-center"
                  onClick={() => nextQuickStep(2)}
                >
                  Next
                  <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Additional Details */}
          {quickLeaveData.step === 3 && (
            <div className="space-y-3">
              {quickLeaveErrors.locationType && (
                <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  <span>{quickLeaveErrors.locationType}</span>
                </div>
              )}
              
              {/* Where to spend leave */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Where will leave be spent?</span>
                </label>
                <div className="flex flex-col space-y-2">
                  {showLocationOptions()}
                </div>
              </div>
              
              {/* Commutation Request */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2 py-1">
                  <input 
                    type="checkbox" 
                    name="commutation" 
                    value="1" 
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={quickLeaveData.commutation}
                    onChange={handleQuickLeaveChange}
                  />
                  <span className="label-text">Request for commutation of leave credits</span>
                </label>
              </div>
              
              <div className="flex justify-between mt-3">
                <button 
                  className="btn btn-sm btn-outline inline-flex items-center"
                  onClick={() => prevQuickStep(3)}
                >
                  <i className="fas fa-arrow-left mr-1"></i>
                  Back
                </button>
                <button 
                  className="btn btn-sm btn-primary inline-flex items-center"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit
                      <i className="fas fa-paper-plane ml-1"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Leave History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Leave Requests</h3>
        </div>
        <div className="p-6">
          {loadingRequests ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-md"></span>
              <span className="ml-2">Loading recent requests...</span>
            </div>
          ) : recentLeaveRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-inbox text-3xl mb-2"></i>
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Days
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentLeaveRequests.map((request) => (
                    <tr 
                      key={request._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/employee/leave-request/${request._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.leave_type === 'vacation' ? 'Vacation Leave' : 'Sick Leave'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.number_of_days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Leave Request Submitted"
        message="Your leave request has been submitted successfully and is pending approval."
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={submitLeaveRequest}
        title="Confirm Leave Request"
        message="Are you sure you want to submit this leave request?"
        confirmText="Submit"
      />
    </Layout>
  );
};

export default EmployeeDashboard;