import apiClient from "./ApiClient";

export const subirExcel = (url, file, empresa) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post(url, formData, {
    params: empresa ? { empresa } : {},
    headers: { "Content-Type": "multipart/form-data" },
  });
};
