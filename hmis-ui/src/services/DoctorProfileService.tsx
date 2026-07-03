import axiosInstance from "../intercepter/AxiosIntercepter";

const getDoctor = async (id: any) => {
  return axiosInstance
    .get(`/profile/doctor/${id}`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

const updateDoctor = async (doctorId: any, doctorData: any) => {
  return axiosInstance
    .put(`/profile/doctor/${doctorId}`, doctorData)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

// Separate multipart call — avatar goes through its own endpoint,
// not bundled into the JSON PatientDto payload.
const uploadDoctorAvatar = async (doctorId: any, file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return axiosInstance
    .post(`/profile/doctor/${doctorId}/avatar`, formData)
    .then((response: any) => response.data as { avatarUrl: string })
    .catch((error: any) => {
      throw error;
    });
};

const getDoctorsDropdown = async () => {
  return axiosInstance
    .get(`/profile/doctor/dropdown`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

export { getDoctor, updateDoctor, uploadDoctorAvatar, getDoctorsDropdown };