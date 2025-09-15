import api from './api';

// Get user notifications
export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/api/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch('/api/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};