import axios from 'axios';
const BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export async function getMe() {
  return (await axios.get(`${BASE}/auth/me`, { withCredentials: true })).data;
}
export async function parseSegment(text) {
  return (await axios.post(`${BASE}/api/ai/parse_segment`, { text })).data;
}
export async function createSegment(payload) {
  return (await axios.post(`${BASE}/api/segments`, payload, { withCredentials: true })).data;
}
export async function previewSegment(id) {
  return (await axios.get(`${BASE}/api/segments/${id}/preview`, { withCredentials: true })).data;
}
export async function createCampaign(payload) {
  return (await axios.post(`${BASE}/api/campaigns`, payload, { withCredentials: true })).data;
}
export async function getCampaigns() {
  return (await axios.get(`${BASE}/api/campaigns`, { withCredentials: true })).data;
}
export async function getMessageSuggestions(body) {
  return (await axios.post(`${BASE}/api/ai/message_suggestions`, body, { withCredentials: true })).data;
}
