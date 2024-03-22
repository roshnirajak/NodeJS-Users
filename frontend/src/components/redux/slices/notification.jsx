import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notificationCount: 0,
    notificationEmpty: null,
    notificationAdd: [],
  },
  reducers: {
    handleAddNotification(state, action) {
      state.notificationAdd.push(action.payload); // Push the new notification to the array
    },
    handleEmptyNotification(state, action) {
      state.notificationEmpty = action.payload;
    },
    handleCountNotification(state, action) {
      state.notificationCount += action.payload;
    },
  },
});

export const {
  handleAddNotification,
  handleEmptyNotification,
  handleCountNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
