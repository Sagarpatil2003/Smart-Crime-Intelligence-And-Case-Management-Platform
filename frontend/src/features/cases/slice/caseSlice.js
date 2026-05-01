import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import {
  reportIncident,
  getMyCases,
  getCaseById,
  addEvidence,
  addWitness,
  getCaseLogs
} from '../services/caseServices';
import axios from 'axios';


export const submitCase = createAsyncThunk(
  'cases/submit',
  async (caseData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }

      const result = await reportIncident(caseData, token);
      return result;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Error reporting incident'
      );
    }
  }
)

export const fetchMyCases = createAsyncThunk(
  "cases/fetchMyCases",
  // Accept a filters object (e.g., { page, limit, search, status })
  async (filters = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found. Please log in again.");
      }
      // Pass the entire filters object to the service
      const result = await getMyCases(filters, token);

      // console.log("Fetched Cases:", result)
      return result;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch cases"
      );
    }
  }
)

export const fetchCaseDetails = createAsyncThunk(
  "cases/caseDetails",
  async (caseId, { rejectWithValue }) => {
    try {
      //console.log("Slice trigger")
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No access token found. Please log in again.")
      }
      const result = await getCaseById(caseId, token)
      console.log("Fetched Cases:", result)
      return result
    } catch (error) {
      console.log(error)
      return rejectWithValue(
        error.response?.message || "Failed to get case"
      )
    }
  }
)

export const submitEvidence = createAsyncThunk(
  "case/submitEvidence",
  async (evidenceData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        throw new Error("No access token found. Please log in again.")
      }
      const result = await addEvidence(evidenceData.caseId, evidenceData, token)
      return result
    } catch (error) {
      console.log(error)
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to get evidence"
      )
    }
  }
)

export const submitWitnessEvidence = createAsyncThunk(
  "case/submitWitnessEvidence",
  async ({ caseId, witnessData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No access token found, please login again.")
      }
      const result = await addWitness(caseId, witnessData, token)
      return result
    } catch (error) {
      //  console.log(error)
      return rejectWithValue(error.response?.data?.message || "Failed to add witness")
    }
  }
)

export const fetchCaseLog = createAsyncThunk(
  "case/getCaseLog",
  async (caseId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No access token found, please login again")
      }
      const result = await getCaseLogs(caseId, token)
      return result
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.response?.data?.message || error.message || "Faile to fetch case logs")
    }
  }
)


const initialState = {
  items: [],
  logs: [],
  logsPagination: null,
  currentCase: null,
  loading: false,
  error: null,
  success: false,
  pagination: null
}


const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    resetCaseStatus: (state) => {
      state.success = false;
      state.error = null;
      state.currentCase = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Case
      .addCase(submitCase.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitCase.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items.unshift(action.payload.data);
      })
      .addCase(submitCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Cases
      .addCase(fetchMyCases.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyCases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cases || action.payload;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Case Detaile
      .addCase(fetchCaseDetails.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(fetchCaseDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCase = action.payload
      })
      .addCase(fetchCaseDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add evidence (.IMG, .VIDEO, .DOC)
      .addCase(submitEvidence.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitEvidence.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitEvidence.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add witness (evidence)
      .addCase(submitWitnessEvidence.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitWitnessEvidence.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
      })
      .addCase(submitWitnessEvidence.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Case Logs
      .addCase(fetchCaseLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCaseLog.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data
        state.logsPagination = action.payload.pagination
      })
      .addCase(fetchCaseLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
});

export const { resetCaseStatus } = caseSlice.actions
export default caseSlice.reducer; 