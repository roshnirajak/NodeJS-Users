import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [], // Array to hold fetched notifications
    notificationCount: 0,
    notificationEmpty: null,
  },
  reducers: {
    handleAddNotification(state, action) {
      state.notifications.push(action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
      state.notificationCount = 0;
      state.notificationEmpty = true;
    },
    handleCountNotification(state, action) {
      state.notificationCount = action.payload;
    },

  },
});

export const {
  handleAddNotification,
  clearNotifications,
  handleCountNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
