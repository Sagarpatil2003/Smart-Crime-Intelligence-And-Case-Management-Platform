import axios from 'axios';

const API_URL = 'http://localhost:5000'

export const reportIncident = async (caseData, token) => {
  //  Extract values from the incoming FormData
  const lat = caseData.get('latitude');
  const lng = caseData.get('longitude');
  const address = caseData.get('address');

  // Create the GeoJSON 'location' object for Mongoose
  const locationData = {
    type: 'Point',
    coordinates: [parseFloat(lng), parseFloat(lat)], // Longitude first for GeoJSON
    address: address
  };

  // Append the formatted location to the existing FormData
  //  FormData stores everything as strings, so we stringify the object
  caseData.append('location', JSON.stringify(locationData));

  // Clean up: Remove the flat latitude/longitude/address so they don't double up
  caseData.delete('latitude');
  caseData.delete('longitude');
  caseData.delete('address');


  const response = await axios.post(`${API_URL}/case/report`, caseData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}` // Add the token here
    },
    withCredentials: true,
  });
  return response.data;
}

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
    withCredentials:true
  })
  return response.data
}

export const getCaseLogs = async(id, token) => {
  const response = await axios.get(`${API_URL}/case/${id}/logs`, {
    headers:{
      Authorization: `Bearer ${token}`
    },
    withCredentials:true
  })
  return response.data
}
