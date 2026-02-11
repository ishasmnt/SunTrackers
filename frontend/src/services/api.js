// src/services/api.js

const API_URL = "https://suntrackers.onrender.com/api";

export const calculateSolar = async (data) => {
  try {
    const res = await fetch(`${API_URL}/calculate-solar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const res = await fetch(`${API_URL}/projects`);
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};
