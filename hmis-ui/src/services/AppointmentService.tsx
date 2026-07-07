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

const cancelAppointment = async (appointmentId: any) => {
  return axiosInstance
    .put(`/appointments/cancel/${appointmentId}`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

const getAppointmentDetailsById = async (appointmentId: any) => {
  return axiosInstance
    .get(`/appointments/get/details/${appointmentId}`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

const getAppointmentById = async (appointmentId: any) => {
  return axiosInstance
    .get(`/appointments/${appointmentId}`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

const getAppointmentsByDoctorId = async (id: any) => {
  return axiosInstance
    .get(`/appointments/doctor/${id}`)
    .then((response: any) => response.data)
    .catch((error: any) => {
      throw error;
    });
};

const updateAppointmentStatus = async (appointmentId: any, status: any) => {
  return axiosInstance.put(`/appointments/update/status/${appointmentId}`, {
    status,
  });
};

export {
  getAppointmentsByPatientId,
  scheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  getAppointmentDetailsById,
  getAppointmentById,
  getAppointmentsByDoctorId,
};
