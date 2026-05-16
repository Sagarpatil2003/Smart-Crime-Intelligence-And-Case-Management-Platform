import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
// console.log(API_URL)
// console.log(import.meta.env);
// const API_URL = "http://localhost:5000";

export const reportIncident = async (caseData, token) => {
  // Extract raw strings from FormData
  const lat = caseData.get('latitude');
  const lng = caseData.get('longitude');
  const address = caseData.get('address');

  // Convert to Numbers FIRST
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  // Validate for NaN
  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    throw new Error("Invalid location coordinates. Please lock your GPS location.");
  }


  // Structure for MongoDB (Longitude first for GeoJSON)
  const locationData = {
    type: 'Point',
    coordinates: [parsedLng, parsedLat],
    address: address
  };

  // 5. Package as a single stringified object for the backend
  caseData.append('location', JSON.stringify(locationData));

  // 6. Remove the flat fields to avoid duplicate data
  caseData.delete('latitude');
  caseData.delete('longitude');
  caseData.delete('address');

  const response = await axios.post(`${API_URL}/case/report`, caseData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true,
  });
  return response.data;
};

export const getMyCases = async (params = {}, token) => {
  // axios can handle the object and convert it to ?key=value automatically
  const response = await axios.get(`${API_URL}/case/my-cases`, {
    params: params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  });

  return response.data.data
}

export const getCaseById = async (id, token) => {
  const response = await axios.get(`${API_URL}/case/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true
  })
  console.log(response)
  return response.data
}

export const addEvidence = async (id, evidenceData, token) => {
  // console.log(evidenceData)
  const response = await axios.post(`${API_URL}/evidence/${id}/evidence`, evidenceData.formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"

    },
    withCredentials: true
  })

  return response.data
}

export const addWitness = async (id, witnessData, token) => {
  const response = await axios.post(`${API_URL}/evidence/${id}/witness`, witnessData, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true
  })
  return response.data
}

export const getCaseLogs = async (id, token) => {
  const response = await axios.get(`${API_URL}/case/${id}/logs`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true
  })
  return response.data
}

export const getCaseStates = async (token) => {
  const response = await axios.get(`${API_URL}/case/case-state`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true
  })
  return response.data
}

export const getTopCrimeTypesInRadius = async (token) => {
  const response = await axios.get(`${API_URL}/case/user-summary`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true
  })
  return response.data
}

export const getNearByCrime = async (lat, lng, page, limit, token) => {
  const response = await axios.get(`${API_URL}/case/nearBycases`, {
    params: { lat, lng, page, limit },
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  })
  return response.data
}

export const getHeatmap = async (token) => {
  const response = await axios.get(`${API_URL}/map/heatmap`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true
  })
  return response.data
}

// caseServices.js
export const getNearbyCaseForMap = async (lat, lng, radius, token) => {
  const response = await axios.get(`${API_URL}/map/nearby`, {
    // Ensure these keys (lng, lat) match the backend's req.query.lng and req.query.lat
    params: {
      lng: lng,
      lat: lat,
      radius: radius
    },
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
  return response.data;
};
