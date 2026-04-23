// services/license.service.ts

import api from "@/lib/api-client";

export const getLicenses = async () => {
  const res = await api.get("/licenses");
  return res.data.data;
};

export const createLicense = async (payload) => {
  const res = await api.post("/licenses", payload);
  return res.data.data;
};

export const assignLicense = async (payload) => {
  const res = await api.post("/licenses/assign", payload);
  return res.data.data;
};