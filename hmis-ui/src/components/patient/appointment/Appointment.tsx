import { Fragment, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TextInput,
  Select,
  Textarea,
  Badge,
  Button,
  ActionIcon,
  Modal,
  Pagination,
  Group,
  Stack,
  Paper,
  Title,
  Collapse,
  Text,
  Loader,
  Center,
  ScrollArea,
  Menu,
} from "@mantine/core";
import { DateTimePicker, DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconFilterOff,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconSelector,
  IconPencil,
  IconX,
  IconCalendarPlus,
  IconDotsVertical,
} from "@tabler/icons-react";
import { getDoctorsDropdown } from "../../../services/DoctorProfileService";
import { errorNotification } from "../../../utility/NotificationUtil";
import {
  getAppointmentsByPatientId,
  scheduleAppointment,
} from "../../../services/AppointmentService";
import { getPatient } from "../../../services/PatientProfileService";

// ---------- Types (mirrors AppointmentDetails.java exactly) ----------
export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
  RESCHEDULED = "RESCHEDULED",
}

export enum AppointmentType {
  NEW = "NEW",
  FOLLOW_UP = "FOLLOW_UP",
  EMERGENCY = "EMERGENCY",
}

// Field names match the Java DTO 1:1. LocalDateTime serializes as an ISO
// string ("2026-07-10T09:30:00") by default with Jackson, so appointmentDateTime
// is typed as `string` here.
export interface AppointmentDetails {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: number;
  doctorName: string;
  doctorDepartment: string;
  appointmentDateTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reasonForVisit: string;
  notes: string;
}

// Mirrors DoctorDto.java exactly. LocalDate serializes as "yyyy-MM-dd" with
// Jackson by default, so dob is typed as `string` here.
export interface DoctorDropdown {
  id: number;
  name: string;
  department: string;
}

// Shape returned by GET /profile/patient/{id} (getPatient service). Adjust
// field names here if your backend's patient DTO differs — this only needs
// enough to prefill the Schedule dialog.
export interface PatientProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
}

// Mirrors AppointmentDto.java — the shape the server expects on
// POST /appointments. Note this is intentionally leaner than
// AppointmentDetails (no patientName/doctorName/etc — the server resolves
// those from patientId/doctorId).
interface AppointmentDto {
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reasonForVisit: string;
  notes: string;
}

// ---------- Status/Type badge configs ----------
const statusColor: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: "blue",
  [AppointmentStatus.CONFIRMED]: "green",
  [AppointmentStatus.IN_PROGRESS]: "yellow",
  [AppointmentStatus.COMPLETED]: "teal",
  [AppointmentStatus.CANCELLED]: "red",
  [AppointmentStatus.NO_SHOW]: "red",
  [AppointmentStatus.RESCHEDULED]: "orange",
};

const statusOptions = Object.values(AppointmentStatus);
const typeOptions = Object.values(AppointmentType);

type SortField =
  | "patientName"
  | "doctorName"
  | "doctorDepartment"
  | "appointmentDateTime"
  | "type"
  | "status"
  | null;
type SortOrder = "asc" | "desc" | null;

interface ColumnFilters {
  patientName: string;
  doctorName: string;
  doctorDepartment: string;
  status: AppointmentStatus | null;
  type: AppointmentType | null;
  date: Date | null;
}

const defaultColumnFilters: ColumnFilters = {
  patientName: "",
  doctorName: "",
  doctorDepartment: "",
  status: null,
  type: null,
  date: null,
};

// ---------- Dummy data ----------
// Swap fetchAppointments() below for a real call once appointment-ms is
// ready; the shape here matches AppointmentDetails exactly so nothing else
// needs to change.
const DUMMY_PATIENTS = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
  },
  {
    id: 2,
    name: "Priya Mehta",
    email: "priya.mehta@example.com",
    phone: "+91 98123 45678",
  },
  {
    id: 3,
    name: "Rohan Kapoor",
    email: "rohan.kapoor@example.com",
    phone: "+91 99887 76655",
  },
  {
    id: 4,
    name: "Ishita Verma",
    email: "ishita.verma@example.com",
    phone: "+91 91234 56789",
  },
  {
    id: 5,
    name: "Kabir Nair",
    email: "kabir.nair@example.com",
    phone: "+91 90909 80808",
  },
  {
    id: 6,
    name: "Sanya Gupta",
    email: "sanya.gupta@example.com",
    phone: "+91 97531 08642",
  },
  {
    id: 7,
    name: "Vivaan Joshi",
    email: "vivaan.joshi@example.com",
    phone: "+91 96385 27419",
  },
  {
    id: 8,
    name: "Ananya Reddy",
    email: "ananya.reddy@example.com",
    phone: "+91 93456 78901",
  },
];

// Used only to seed the dummy appointment rows below until appointment-ms
// is live. The doctor *picker* in the Schedule dialog uses real data from
// doctor-ms (see `doctors` state + fetchDoctors()) — this array is unrelated
// to that and can be deleted once fetchAppointments() hits a real endpoint.
const DUMMY_DOCTORS = [
  { id: 101, name: "Dr. Neha Rao", department: "Cardiology" },
  { id: 102, name: "Dr. Arjun Malhotra", department: "Orthopedics" },
  { id: 103, name: "Dr. Simran Kaur", department: "Dermatology" },
  { id: 104, name: "Dr. Vikram Iyer", department: "General Medicine" },
  { id: 105, name: "Dr. Fatima Sheikh", department: "Pediatrics" },
];

const REASONS = [
  "Fever and body ache",
  "Routine check-up",
  "Follow-up on blood test results",
  "Persistent headache",
  "Skin rash consultation",
  "Post-surgery review",
  "Vaccination",
  "Chest pain evaluation",
  "Prenatal check-up",
  "Diabetes management",
];

function generateDummyAppointments(count: number): AppointmentDetails[] {
  const statuses = statusOptions;
  const types = typeOptions;
  const appointments: AppointmentDetails[] = [];

  for (let i = 0; i < count; i++) {
    const patient = DUMMY_PATIENTS[i % DUMMY_PATIENTS.length];
    const doctor = DUMMY_DOCTORS[i % DUMMY_DOCTORS.length];
    const status = statuses[i % statuses.length];
    const type = types[i % types.length];
    const reason = REASONS[i % REASONS.length];

    // Spread appointments across the next 20 days, business hours only.
    const dayOffset = Math.floor(i / 2) - 5;
    const hour = 9 + (i % 8);
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, i % 2 === 0 ? 0 : 30, 0, 0);

    appointments.push({
      id: i + 1,
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorDepartment: doctor.department,
      appointmentDateTime: date.toISOString(),
      status,
      type,
      reasonForVisit: reason,
      notes:
        status === AppointmentStatus.COMPLETED
          ? "Patient responded well to treatment. Follow-up in 2 weeks if symptoms persist."
          : status === AppointmentStatus.CANCELLED
            ? "Cancelled by patient — rescheduling requested."
            : status === AppointmentStatus.RESCHEDULED
              ? "Original slot moved at patient's request."
              : "",
    });
  }

  return appointments;
}

const emptyForm = {
  doctorId: null as number | null,
  type: null as AppointmentType | null,
  appointmentDateTime: null as Date | string | null,
  reasonForVisit: "",
  notes: "",
};

const ROWS_PER_PAGE_OPTIONS = ["10", "25", "50"];

const Appointment = () => {
  const user = useSelector((state: any) => state.user);
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const [doctors, setDoctors] = useState<DoctorDropdown[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // The logged-in patient's own profile — fetched once, used to prefill and
  // lock the "Patient" fields in the Schedule dialog. No dropdown needed:
  // a patient on their own dashboard can only ever book for themselves.
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] =
    useState<ColumnFilters>(defaultColumnFilters);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyForm);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatient();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);

    // ---- DUMMY DATA (remove this block once appointment-ms is live) ----
    /* setTimeout(() => {
      setAppointments(generateDummyAppointments(24));
      setLoading(false);
    }, 400);
    return; */

    getAppointmentsByPatientId(user?.profileId)
      .then((data: AppointmentDetails[]) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error fetching appointments:", err);
        errorNotification("Failed to load appointments.");
      })
      .finally(() => setDoctorsLoading(false));

    // ---- Real API call — uncomment when the endpoint is ready ----
    // try {
    //   const res = await fetch("http://localhost:9090/appointment-ms/api/appointments");
    //   if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    //   const data: AppointmentDetails[] = await res.json();
    //   setAppointments(data);
    // } catch (err) {
    //   console.error("Failed to load appointments", err);
    //   notifications.show({
    //     color: "red",
    //     title: "Load failed",
    //     message: "Could not fetch appointments. Showing no data.",
    //   });
    //   setAppointments([]);
    // } finally {
    //   setLoading(false);
    // }
  };

  // Doctor list is live — powers the "Doctor" picker in the Schedule dialog.
  // Adjust the URL to wherever doctor-ms is actually exposed for you.
  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    getDoctorsDropdown()
      .then((data: DoctorDropdown[]) => {
        setDoctors(data);
      })
      .catch((err: any) => {
        console.error("Error fetching doctors: ", err);
        errorNotification("Failed to load doctors.");
      })
      .finally(() => setDoctorsLoading(false));
  };

  // The logged-in patient's own record — used to prefill the Schedule
  // dialog. user.profileId is the same id already used above for
  // getAppointmentsByPatientId, so this stays consistent with that pattern.
  const fetchPatient = async () => {
    setPatientLoading(true);
    getPatient(user?.profileId)
      .then((data: PatientProfile) => {
        setPatient(data);
      })
      .catch((err: any) => {
        console.error("Error fetching patient profile:", err);
        errorNotification("Failed to load your patient profile.");
      })
      .finally(() => setPatientLoading(false));
  };

  // ---------- Filtering ----------
  const filteredAppointments = useMemo(() => {
    const search = globalFilter.trim().toLowerCase();

    return appointments.filter((row) => {
      if (search) {
        const haystack =
          `${row.patientName} ${row.doctorName} ${row.doctorDepartment} ${row.reasonForVisit}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (
        columnFilters.patientName &&
        !row.patientName
          .toLowerCase()
          .includes(columnFilters.patientName.toLowerCase())
      )
        return false;
      if (
        columnFilters.doctorName &&
        !row.doctorName
          .toLowerCase()
          .includes(columnFilters.doctorName.toLowerCase())
      )
        return false;
      if (
        columnFilters.doctorDepartment &&
        !row.doctorDepartment
          .toLowerCase()
          .includes(columnFilters.doctorDepartment.toLowerCase())
      )
        return false;
      if (columnFilters.status && row.status !== columnFilters.status)
        return false;
      if (columnFilters.type && row.type !== columnFilters.type) return false;
      if (columnFilters.date) {
        const rowDate = new Date(row.appointmentDateTime);
        const filterDate = columnFilters.date;
        if (
          rowDate.getFullYear() !== filterDate.getFullYear() ||
          rowDate.getMonth() !== filterDate.getMonth() ||
          rowDate.getDate() !== filterDate.getDate()
        )
          return false;
      }
      return true;
    });
  }, [appointments, globalFilter, columnFilters]);

  // ---------- Sorting ----------
  const sortedAppointments = useMemo(() => {
    if (!sortField || !sortOrder) return filteredAppointments;
    const dir = sortOrder === "asc" ? 1 : -1;

    return [...filteredAppointments].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortField === "appointmentDateTime") {
        return (new Date(aVal).getTime() - new Date(bVal).getTime()) * dir;
      }
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  }, [filteredAppointments, sortField, sortOrder]);

  // ---------- Pagination ----------
  const rows = Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(sortedAppointments.length / rows));
  const pagedAppointments = useMemo(() => {
    const start = (page - 1) * rows;
    return sortedAppointments.slice(start, start + rows);
  }, [sortedAppointments, page, rows]);

  useEffect(() => {
    // Reset to page 1 whenever filters, sort, or page size change the result set.
    setPage(1);
  }, [globalFilter, columnFilters, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortField(null);
      setSortOrder(null);
    } else {
      setSortOrder("asc");
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field)
      return <IconSelector size={14} className="opacity-40" />;
    if (sortOrder === "asc") return <IconChevronUp size={14} />;
    return <IconChevronDown size={14} />;
  };

  const clearFilters = () => {
    setColumnFilters(defaultColumnFilters);
    setGlobalFilter("");
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openScheduleDialog = () => {
    setScheduleForm(emptyForm);
    setScheduleDialogOpen(true);
  };

  const closeScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setScheduleForm(emptyForm);
  };

  const handleScheduleSubmit = async () => {
    const { doctorId, type, appointmentDateTime, reasonForVisit, notes } =
      scheduleForm;
    const appointmentDate = toDate(appointmentDateTime);

    if (!patient || !doctorId || !type || !appointmentDate || !reasonForVisit) {
      notifications.show({
        color: "yellow",
        title: "Missing details",
        message: patient
          ? "Please fill in doctor, type, date & time, and reason for visit."
          : "Still loading your patient profile — try again in a moment.",
      });
      return;
    }

    setScheduleSubmitting(true);

    const doctor = doctors.find((d) => d.id === doctorId);

    // Payload matches AppointmentDto.java exactly — server resolves
    // doctorName/doctorDepartment etc from doctorId on its side.
    const payload: AppointmentDto = {
      patientId: patient.id,
      doctorId,
      appointmentDateTime: toLocalDateTimeString(appointmentDate),
      status: AppointmentStatus.SCHEDULED,
      type,
      reasonForVisit,
      notes,
    };

    try {
      const created: AppointmentDto & Partial<AppointmentDetails> =
        await scheduleAppointment(payload);

      // The server may return either the full enriched AppointmentDetails
      // shape or just the lean AppointmentDto it was given back with an id.
      // Either way, backfill the display-only fields from data we already
      // have locally so the table row renders correctly right away.
      const newAppointment: AppointmentDetails = {
        id: created.id ?? Math.max(0, ...appointments.map((a) => a.id)) + 1,
        patientId: patient.id,
        patientName: created.patientName ?? patient.name,
        patientEmail: created.patientEmail ?? patient.email,
        patientPhone: created.patientPhone ?? patient.phone,
        doctorId,
        doctorName: created.doctorName ?? doctor?.name ?? "",
        doctorDepartment: created.doctorDepartment ?? doctor?.department ?? "",
        appointmentDateTime:
          created.appointmentDateTime ?? payload.appointmentDateTime,
        status: created.status ?? AppointmentStatus.SCHEDULED,
        type: created.type ?? type,
        reasonForVisit: created.reasonForVisit ?? reasonForVisit,
        notes: created.notes ?? notes,
      };

      setAppointments((prev) => [newAppointment, ...prev]);
      closeScheduleDialog();
      notifications.show({
        color: "green",
        title: "Appointment scheduled",
        message: `Booked with ${newAppointment.doctorName} on ${new Date(
          newAppointment.appointmentDateTime,
        ).toLocaleString("en-IN")}`,
      });
    } catch (err) {
      console.error("Failed to schedule appointment", err);
      notifications.show({
        color: "red",
        title: "Booking failed",
        message: "Please try again.",
      });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Newer @mantine/dates versions can hand back either a Date or an ISO
  // string from DateTimePicker's onChange depending on version/config —
  // this normalizes either shape before we call .toISOString() on it.
  const toDate = (value: Date | string | null): Date | null => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  };

  // IMPORTANT: do NOT use date.toISOString() for this payload.
  // toISOString() converts to UTC (e.g. 11:30 AM IST -> "06:00:00.000Z"),
  // but the backend's appointmentDateTime field is a Java LocalDateTime,
  // which has no timezone concept — Jackson deserializes the numbers
  // literally as wall-clock time, so a UTC string silently shifts the
  // appointment by your UTC offset (5.5h for IST) and can land in the
  // past even though a future slot was picked. This formats the *local*
  // wall-clock time the user actually selected, unconverted.
  const toLocalDateTimeString = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
  };

  const sortableHeader = (label: string, field: SortField) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-semibold text-sm text-gray-700 hover:text-gray-900"
    >
      {label}
      {sortIcon(field)}
    </button>
  );

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Title order={2} className="!m-0">
          Appointments
        </Title>
        <Button
          leftSection={<IconCalendarPlus size={18} />}
          onClick={openScheduleDialog}
        >
          Schedule Appointment
        </Button>
      </div>

      <Paper withBorder radius="md" p="md" className="w-full min-w-0">
        {/* Header: search + clear filters */}
        <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
          <Button
            variant="outline"
            leftSection={<IconFilterOff size={16} />}
            onClick={clearFilters}
          >
            Clear
          </Button>
          <TextInput
            placeholder="Search patient, doctor, department..."
            leftSection={<IconSearch size={16} />}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.currentTarget.value)}
            className="w-72 max-w-full"
          />
        </div>

        {/* Column filter row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
          <TextInput
            placeholder="Filter patient"
            size="xs"
            value={columnFilters.patientName}
            onChange={(e) =>
              setColumnFilters((f) => ({
                ...f,
                patientName: e.currentTarget.value,
              }))
            }
          />
          <TextInput
            placeholder="Filter doctor"
            size="xs"
            value={columnFilters.doctorName}
            onChange={(e) =>
              setColumnFilters((f) => ({
                ...f,
                doctorName: e.currentTarget.value,
              }))
            }
          />
          <TextInput
            placeholder="Filter department"
            size="xs"
            value={columnFilters.doctorDepartment}
            onChange={(e) =>
              setColumnFilters((f) => ({
                ...f,
                doctorDepartment: e.currentTarget.value,
              }))
            }
          />
          <DatePickerInput
            placeholder="Filter date"
            size="xs"
            clearable
            value={columnFilters.date}
            onChange={(v) =>
              setColumnFilters((f) => ({ ...f, date: v as Date | null }))
            }
          />
          <Select
            placeholder="Any type"
            size="xs"
            data={typeOptions.map((t) => ({
              value: t,
              label: t.replace("_", " "),
            }))}
            value={columnFilters.type}
            onChange={(v) =>
              setColumnFilters((f) => ({
                ...f,
                type: v as AppointmentType | null,
              }))
            }
            clearable
          />
          <Select
            placeholder="Any status"
            size="xs"
            data={statusOptions.map((s) => ({
              value: s,
              label: s.replace("_", " "),
            }))}
            value={columnFilters.status}
            onChange={(v) =>
              setColumnFilters((f) => ({
                ...f,
                status: v as AppointmentStatus | null,
              }))
            }
            clearable
          />
        </div>

        <ScrollArea>
          <Table
            striped
            highlightOnHover
            verticalSpacing="sm"
            style={{ minWidth: 900 }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40} />
                <Table.Th>{sortableHeader("Patient", "patientName")}</Table.Th>
                <Table.Th>{sortableHeader("Doctor", "doctorName")}</Table.Th>
                <Table.Th>
                  {sortableHeader("Department", "doctorDepartment")}
                </Table.Th>
                <Table.Th>
                  {sortableHeader("Date", "appointmentDateTime")}
                </Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>{sortableHeader("Type", "type")}</Table.Th>
                <Table.Th>{sortableHeader("Status", "status")}</Table.Th>
                <Table.Th>Reason for Visit</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={10}>
                    <Center py="xl">
                      <Loader size="sm" />
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : pagedAppointments.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={10}>
                    <Center py="xl">
                      <Text c="dimmed">No appointments found.</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                pagedAppointments.map((row) => (
                  <Fragment key={row.id}>
                    <Table.Tr>
                      <Table.Td>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => toggleRow(row.id)}
                        >
                          {expandedRows.has(row.id) ? (
                            <IconChevronDown size={16} />
                          ) : (
                            <IconChevronRight size={16} />
                          )}
                        </ActionIcon>
                      </Table.Td>
                      <Table.Td className="min-w-[10rem]">
                        {row.patientName}
                      </Table.Td>
                      <Table.Td className="min-w-[10rem]">
                        {row.doctorName}
                      </Table.Td>
                      <Table.Td className="min-w-[8rem]">
                        {row.doctorDepartment}
                      </Table.Td>
                      <Table.Td className="min-w-[8rem]">
                        {formatDate(row.appointmentDateTime)}
                      </Table.Td>
                      <Table.Td className="min-w-[6rem]">
                        {formatTime(row.appointmentDateTime)}
                      </Table.Td>
                      <Table.Td className="min-w-[7rem]">
                        {row.type.replace("_", " ")}
                      </Table.Td>
                      <Table.Td className="min-w-[7rem]">
                        <Badge color={statusColor[row.status]} variant="light">
                          {row.status.replace("_", " ")}
                        </Badge>
                      </Table.Td>
                      <Table.Td className="min-w-[12rem]">
                        {row.reasonForVisit}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            aria-label="Edit"
                            onClick={() => console.log("edit", row.id)}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            aria-label="Cancel"
                            disabled={
                              row.status === AppointmentStatus.CANCELLED
                            }
                            onClick={() => console.log("cancel", row.id)}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>

                    {/* Row expansion: surfaces patientEmail, patientPhone, notes */}
                    <Table.Tr>
                      <Table.Td colSpan={10} p={0} className="border-t-0">
                        <Collapse expanded={expandedRows.has(row.id)}>
                          <div className="bg-gray-50 px-4 py-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <Text size="xs" c="dimmed">
                                  Patient email
                                </Text>
                                <Text size="sm">{row.patientEmail}</Text>
                              </div>
                              <div>
                                <Text size="xs" c="dimmed">
                                  Patient phone
                                </Text>
                                <Text size="sm">{row.patientPhone}</Text>
                              </div>
                              <div className="sm:col-span-2 lg:col-span-1">
                                <Text size="xs" c="dimmed">
                                  Notes
                                </Text>
                                <Text
                                  size="sm"
                                  fs={row.notes ? undefined : "italic"}
                                  c={row.notes ? undefined : "dimmed"}
                                >
                                  {row.notes || "No notes yet."}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  </Fragment>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {/* Footer: pagination + page size */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <Text size="sm" c="dimmed">
            Showing{" "}
            {sortedAppointments.length === 0 ? 0 : (page - 1) * rows + 1} to{" "}
            {Math.min(page * rows, sortedAppointments.length)} of{" "}
            {sortedAppointments.length} appointments
          </Text>
          <Group gap="md">
            <Select
              size="xs"
              data={ROWS_PER_PAGE_OPTIONS}
              value={rowsPerPage}
              onChange={(v) => v && setRowsPerPage(v)}
              w={80}
              allowDeselect={false}
            />
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
              size="sm"
            />
          </Group>
        </div>
      </Paper>

      {/* Schedule Appointment dialog */}
      <Modal
        opened={scheduleDialogOpen}
        onClose={closeScheduleDialog}
        title="Schedule Appointment"
        size="lg"
        centered
      >
        <Stack gap="md" pt="xs">
          {/* Patient section: read-only, sourced from the logged-in user's
              own profile via getPatient(user.profileId) — no picker, since
              this is the patient's own dashboard. */}
          {patientLoading ? (
            <Group gap="xs">
              <Loader size="xs" />
              <Text size="sm" c="dimmed">
                Loading your profile...
              </Text>
            </Group>
          ) : patient ? (
            <>
              <TextInput label="Patient" value={patient.name} readOnly />
              <Group grow>
                <TextInput label="Email" value={patient.email} readOnly />
                <TextInput label="Phone" value={patient.phone} readOnly />
              </Group>
            </>
          ) : (
            <Text size="sm" c="red">
              Couldn't load your patient profile. Please refresh and try again.
            </Text>
          )}

          <Select
            label="Doctor"
            required
            placeholder={
              doctorsLoading ? "Loading doctors..." : "Select a doctor"
            }
            disabled={doctorsLoading}
            nothingFoundMessage={
              doctorsLoading ? "Loading..." : "No doctors found"
            }
            data={doctors.map((d) => ({
              value: String(d.id),
              label: `${d.name} — ${d.department}`,
            }))}
            value={scheduleForm.doctorId ? String(scheduleForm.doctorId) : null}
            onChange={(v) =>
              setScheduleForm({
                ...scheduleForm,
                doctorId: v ? Number(v) : null,
              })
            }
            searchable
          />

          <Group grow>
            <Select
              label="Type"
              required
              placeholder="Select type"
              data={typeOptions.map((t) => ({
                value: t,
                label: t.replace("_", " "),
              }))}
              value={scheduleForm.type}
              onChange={(v) =>
                setScheduleForm({
                  ...scheduleForm,
                  type: v as AppointmentType | null,
                })
              }
            />
            <DateTimePicker
              label="Date & time"
              required
              placeholder="Pick date & time"
              minDate={new Date()}
              value={toDate(scheduleForm.appointmentDateTime)}
              onChange={(v) =>
                setScheduleForm({
                  ...scheduleForm,
                  appointmentDateTime: v as Date | string | null,
                })
              }
            />
          </Group>

          <Textarea
            label="Reason for visit"
            required
            placeholder="e.g. Persistent headache for 3 days"
            autosize
            minRows={2}
            value={scheduleForm.reasonForVisit}
            onChange={(e) =>
              setScheduleForm({
                ...scheduleForm,
                reasonForVisit: e.currentTarget.value,
              })
            }
          />

          <Textarea
            label="Notes (optional)"
            placeholder="Anything the doctor should know beforehand"
            autosize
            minRows={2}
            value={scheduleForm.notes}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, notes: e.currentTarget.value })
            }
          />

          <Group justify="flex-end" mt="sm">
            <Button
              variant="outline"
              onClick={closeScheduleDialog}
              disabled={scheduleSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              loading={scheduleSubmitting}
              disabled={patientLoading || !patient}
            >
              Schedule
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default Appointment;