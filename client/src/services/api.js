const API_URL = "http://localhost:4000/api";

const jsonHeaders = {
  "Content-Type": "application/json",
};

// ==================== AUTH & USER PROFILE ====================

export const signup = async (userData) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const login = async (loginData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(loginData),
  });
  return response.json();
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}/user/profile`, {
    credentials: "include",
  });
  return response.json();
};

export const updateUserProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: "PUT",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(profileData),
  });
  return response.json();
};

export const changePassword = async (passwordData) => {
  const response = await fetch(`${API_URL}/user/change-password`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(passwordData),
  });
  return response.json();
};

// ==================== COMPLAINTS ====================

export const createComplaint = async (complaintData) => {
  const response = await fetch(`${API_URL}/complaint`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(complaintData),
  });
  return response.json();
};

export const getComplaints = async () => {
  const response = await fetch(`${API_URL}/complaints`, {
    credentials: "include",
  });
  return response.json();
};

export const getComplaintById = async (id) => {
  const response = await fetch(`${API_URL}/complaints/${id}`, {
    credentials: "include",
  });
  return response.json();
};

// Lifecycle
export const cancelComplaint = async (id, reason) => {
  const response = await fetch(`${API_URL}/complaints/${id}/cancel`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  return response.json();
};

export const reopenComplaint = async (id, reason) => {
  const response = await fetch(`${API_URL}/complaints/${id}/reopen`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  return response.json();
};

export const closeComplaint = async (id) => {
  const response = await fetch(`${API_URL}/complaints/${id}/close`, {
    method: "PATCH",
    credentials: "include",
  });
  return response.json();
};

// Feedback
export const submitFeedback = async (id, feedbackData) => {
  const response = await fetch(`${API_URL}/complaints/${id}/feedback`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(feedbackData),
  });
  return response.json();
};

export const getComplaintFeedback = async (id) => {
  const response = await fetch(`${API_URL}/complaints/${id}/feedback`, {
    credentials: "include",
  });
  return response.json();
};

// Comments & Timeline
export const addComment = async (id, commentData) => {
  const response = await fetch(`${API_URL}/complaints/${id}/comments`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(commentData),
  });
  return response.json();
};

export const getTimeline = async (id) => {
  const response = await fetch(`${API_URL}/complaints/${id}/timeline`, {
    credentials: "include",
  });
  return response.json();
};

// ==================== TECHNICIAN ====================

export const getTechnicianComplaints = async () => {
  const response = await fetch(`${API_URL}/technician/complaints`, {
    credentials: "include",
  });
  return response.json();
};

export const getTechnicianProfile = async () => {
  const response = await fetch(`${API_URL}/technician/profile`, {
    credentials: "include",
  });
  return response.json();
};

export const updateComplaintStatus = async (data) => {
  const response = await fetch(`${API_URL}/technician/status`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(data),
  });
  return response.json();
};

export const acceptComplaint = async (id) => {
  const response = await fetch(`${API_URL}/technician/complaints/${id}/accept`, {
    method: "PATCH",
    credentials: "include",
  });
  return response.json();
};

export const rejectComplaint = async (id, reason) => {
  const response = await fetch(`${API_URL}/technician/complaints/${id}/reject`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  return response.json();
};

export const resolveComplaint = async (id, resolutionData) => {
  const response = await fetch(`${API_URL}/technician/complaints/${id}/resolve`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(resolutionData),
  });
  return response.json();
};

export const updateTechnicianAvailability = async (status) => {
  const response = await fetch(`${API_URL}/technician/availability`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return response.json();
};

// ==================== ADMIN ====================

export const getAdminOverviewStats = async () => {
  const response = await fetch(`${API_URL}/admin/stats/overview`, {
    credentials: "include",
  });
  return response.json();
};

export const getAdminComplaints = async () => {
  const response = await fetch(`${API_URL}/admin/complaints`, {
    credentials: "include",
  });
  return response.json();
};

export const getAdminTechnicians = async () => {
  const response = await fetch(`${API_URL}/admin/technicians`, {
    credentials: "include",
  });
  return response.json();
};

export const getAdminCustomers = async () => {
  const response = await fetch(`${API_URL}/admin/customers`, {
    credentials: "include",
  });
  return response.json();
};

export const createTechnician = async (technicianData) => {
  const response = await fetch(`${API_URL}/admin/technician-signup`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(technicianData),
  });
  return response.json();
};

export const assignTechnician = async (data) => {
  const response = await fetch(`${API_URL}/admin/technician-assigned`, {
    method: "PATCH",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify(data),
  });
  return response.json();
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async (unreadOnly = false) => {
  const url = unreadOnly
    ? `${API_URL}/notifications?unread=true`
    : `${API_URL}/notifications`;
  const response = await fetch(url, {
    credentials: "include",
  });
  return response.json();
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  return response.json();
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    credentials: "include",
  });
  return response.json();
};
