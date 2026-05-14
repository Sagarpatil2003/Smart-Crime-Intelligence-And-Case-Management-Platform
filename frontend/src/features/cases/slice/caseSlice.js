import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import {
  reportIncident,
  getMyCases,
  getCaseById,
  addEvidence,
  addWitness,
  getCaseLogs,
  getCaseStates,
  getTopCrimeTypesInRadius,
  getNearByCrime,
  getHeatmap,
  getNearbyCaseForMap
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

export const fetchCaseState = createAsyncThunk(
  "case/getCaseState",
  async (_, { rejectWithValue }) => {
    try {

      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No access token found, please login again")
      }
      const result = await getCaseStates(token)
      // console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.message?.data?.message || error.message || "Faile to fetch case states")
    }
  }
)

export const fetchTopCrimeTypesInRadius = createAsyncThunk(
  "case/getUserDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No access token found, please login again")
      }
      const result = await getTopCrimeTypesInRadius(token)
      // console.log(result)
      return result
    } catch (error) {
      console.log(error)
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch dashboard"
      );
    }
  }
)

export const fetchNearbyCases = createAsyncThunk(
  "case/getNearByCases",
  async ({ lat, lng, page, limit }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("No access token found, please login again")
      let result = await getNearByCrime(lat, lng, page, limit, token)
      return result
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || data?.message || "Failed to fetch nearby cases")
    }
  }
)

export const fetchHeatMap = createAsyncThunk(
  "case/getHeatMap",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No access token found, please login again")
      }
      const result = await getHeatmap(token)
      return result
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch heatmap")
    }
  }
)

export const fetchNearbyCasesForMap = createAsyncThunk(
  "case/nearByCase",
  async ({ lat, lng, radius }, { rejectWithValue }) => {

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error('No access token found, please login again')
      }

      const result = await getNearbyCaseForMap(lat, lng, radius, token)
      console.log(result)
      return result
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch NearbyCaseForMap")
    }
  }
)



const initialState = {
  items: [],
  logs: [],
  cityCrimeGraph: [],
  nearbyCases: [],
  heatMap: [],
  nearbyCasesForMap: [],
  mtrix: {
    totalReports: 0,
    activeCases: 0,
    resolvedCases: 0
  },
  totalSubmitted: 0,
  activeCases: 0,
  resolvedCases: 0,
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

      .addCase(fetchTopCrimeTypesInRadius.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopCrimeTypesInRadius.fulfilled, (state, action) => {
        console.log("SERVER PAYLOAD:", action.payload)
        state.loading = false;
        state.mtrix = action.payload.data.userMetrics;
        state.cityCrimeGraph = action.payload.data.cityCrimeGraph;
      })
      .addCase(fetchTopCrimeTypesInRadius.rejected, (state, action) => {
        console.log("Full Payload:", action.payload); 
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      .addCase(fetchCaseState.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCaseState.fulfilled, (state, action) => {
        state.loading = false
        state.activeCases = action.payload.data.activeCases
        state.totalSubmitted = action.payload.data.totalSubmitted
        state.resolvedCases = action.payload.data.resolvedCases
      })
      .addCase(fetchCaseState.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchNearbyCases.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNearbyCases.fulfilled, (state, action) => {
        state.loading = false
        state.nearbyCases = action.payload.data?.cases
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNearbyCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchHeatMap.pending, (state,) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHeatMap.fulfilled, (state, action) => {
        state.loading = false
        state.heatMap = action.payload.data
      })
      .addCase(fetchHeatMap.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchNearbyCasesForMap.pending, (state,) => {
        state.loading = true
        state.error = null
        state.nearbyCasesForMap = []
      })
      .addCase(fetchNearbyCasesForMap.fulfilled, (state, action) => {
        state.loading = false;
        // This correctly pulls the Array(3) from your logged object
        state.nearbyCasesForMap = action.payload.data || []
      })

      .addCase(fetchNearbyCasesForMap.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

  },
});

export const { resetCaseStatus } = caseSlice.actions
export default caseSlice.reducer; 