import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export const instagramApi = {
  getAccount: (access_token: string) => api.post("/account", { access_token }),
  getMedia: (access_token: string) => api.post("/media", { access_token }),
  getMediaDetail: (mediaId: string) => api.get(`/media/${mediaId}`),
  replyToComment: (commentId: string, mediaId: string, message: string, access_token?: string) => 
    api.post("/reply", { comment_id: commentId, media_id: mediaId, message, access_token }),
};

export const configApi = {
  getConfig: () => api.get("/config"),
  saveConfig: (data: any) => api.post("/config", data),
  getStatus: () => api.get("/status"),
};

export const rulesApi = {
  getRules: () => api.get("/rules"),
  addRule: (keyword: string, reply: string) => api.post("/rules", { keyword, reply }),
  deleteRule: (ruleId: number) => api.delete(`/rules/${ruleId}`),
  toggleRule: (ruleId: number) => api.post(`/rules/${ruleId}/toggle`),
};

export const logsApi = {
  getLogs: () => api.get("/logs"),
  clearLogs: () => api.delete("/logs"),
};

export default api;
