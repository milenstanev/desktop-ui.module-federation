import { createSlice } from '@reduxjs/toolkit';

interface FeatureState {
  value: number;
}

const initialState: FeatureState = {
  value: 0,
};

const featureSlice = createSlice({
  name: 'Counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = featureSlice.actions;
export default featureSlice.reducer;
