import axiosInstance from "../intercepter/AxiosIntercepter";

const getAppointmentsByPatientId = async (id: any) => {
  return axiosInstance
    .get(`/appointments/patient/${id}`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

const scheduleAppointment = async (appointmentData: any) => {
  return axiosInstance
    .post("/appointments/schedule", appointmentData)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

export { getAppointmentsByPatientId, scheduleAppointment };