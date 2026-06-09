import { configureStore } from '@reduxjs/toolkit';
import caseReducer from '../features/cases/slice/caseSlice'

export const store = configureStore({
  reducer: {
    cases: caseReducer,
  },
});