import axiosInstance from "../intercepter/AxiosIntercepter";

const getPatient = async (id: any) => {
  return axiosInstance
    .get(`/profile/patient/${id}`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

const updatePatient = async (patientId: any, patientData: any) => {
  return axiosInstance
    .put(`/profile/patient/${patientId}`, patientData)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

// Separate multipart call — avatar goes through its own endpoint,
// not bundled into the JSON PatientDto payload.
const uploadPatientAvatar = async (patientId: any, file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return axiosInstance
    .post(`/profile/patient/${patientId}/avatar`, formData)
    .then((response: any) => response.data as { avatarUrl: string })
    .catch((error: any) => {
      throw error;
    });
};

export { getPatient, updatePatient, uploadPatientAvatar };
