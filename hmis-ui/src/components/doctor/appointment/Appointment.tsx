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
  SegmentedControl,
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
import { getDoctor } from "../../../services/DoctorProfileService";
import { errorNotification } from "../../../utility/NotificationUtil";
import {
  getAppointmentsByDoctorId,
  scheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
} from "../../../services/AppointmentService";
import { getPatientsDropdown } from "../../../services/PatientProfileService";

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

// Mirrors PatientDto.java exactly — used to populate the patient picker in
// the "Add appointment for a patient" dialog below.
export interface PatientDropdown {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

// Shape returned by GET /profile/doctor/{id} (getDoctor service). This is
// the logged-in doctor's own profile — shown read-only in the schedule
// dialog and used to stamp doctorId/doctorName/doctorDepartment on new
// appointments created from this page. Adjust field names here if your
// backend's doctor DTO differs.
export interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
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

// Status transitions a doctor is allowed to make from the table's status
// menu. CANCELLED is deliberately excluded here — cancelling stays behind
// the dedicated Cancel action + confirmation dialog, so it can't be picked
// accidentally from a quick dropdown.
const STATUS_MENU_OPTIONS = statusOptions.filter(
  (s) => s !== AppointmentStatus.CANCELLED,
);

type SortField =
  | "patientName"
  | "doctorName"
  | "doctorDepartment"
  | "appointmentDateTime"
  | "type"
  | "status"
  | null;
type SortOrder = "asc" | "desc" | null;

// Quick toggle to narrow the table to today's, past, or upcoming
// appointments without touching the column filters.
type TimeRangeFilter = "all" | "today" | "upcoming" | "past";

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

// Common reasons for visit, grouped by category so the dropdown in the
// Schedule dialog can show them under labeled sections (Mantine Select
// supports grouped data via { group, items }). "Other" is a sentinel value —
// picking it reveals a free-text field so the reason isn't limited to this
// list.
const OTHER_REASON_VALUE = "OTHER";

const APPOINTMENT_REASONS: { category: string; reasons: string[] }[] = [
  {
    category: "General",
    reasons: [
      "Routine check-up",
      "Fever and body ache",
      "Vaccination",
      "Persistent headache",
      "Post-surgery review",
    ],
  },
  {
    category: "Cardiology",
    reasons: [
      "Chest pain evaluation",
      "High blood pressure follow-up",
      "Palpitations / irregular heartbeat",
    ],
  },
  {
    category: "Orthopedics",
    reasons: [
      "Joint pain evaluation",
      "Back pain consultation",
      "Fracture / injury follow-up",
    ],
  },
  {
    category: "Dermatology",
    reasons: ["Skin rash consultation", "Acne / skin condition follow-up"],
  },
  {
    category: "Pediatrics",
    reasons: ["Child wellness visit", "Vaccination — child"],
  },
  {
    category: "Gynecology",
    reasons: ["Prenatal check-up", "Postnatal follow-up"],
  },
  {
    category: "Endocrinology",
    reasons: ["Diabetes management", "Thyroid follow-up"],
  },
  {
    category: "Lab & Reports",
    reasons: ["Follow-up on blood test results", "Imaging report review"],
  },
];

// Grouped `data` shape for the reason <Select>, with "Other" pinned as its
// own trailing group.
const REASON_SELECT_DATA = [
  ...APPOINTMENT_REASONS.map((g) => ({
    group: g.category,
    items: g.reasons.map((r) => ({ value: r, label: r })),
  })),
  {
    group: "Other",
    items: [{ value: OTHER_REASON_VALUE, label: "Other (please specify)" }],
  },
];

const emptyForm = {
  patientId: null as number | null,
  type: null as AppointmentType | null,
  appointmentDateTime: null as Date | string | null,
  reasonForVisit: "", // holds a value from REASON_SELECT_DATA, or OTHER_REASON_VALUE
  customReason: "", // free text, only used when reasonForVisit === OTHER_REASON_VALUE
  notes: "",
};

const ROWS_PER_PAGE_OPTIONS = ["10", "25", "50"];

const Appointment = () => {
  const user = useSelector((state: any) => state.user);
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Patients live in the picker for "Add appointment for a patient" below.
  // Adjust the URL / import in PatientProfileService if your endpoint name
  // differs from getPatientsDropdown.
  const [patients, setPatients] = useState<PatientDropdown[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // The logged-in doctor's own profile — fetched once, shown read-only in
  // the Schedule dialog's "Doctor" section, and used to stamp doctorId on
  // new appointments (a doctor can only ever book under themselves).
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(
    null,
  );
  const [doctorProfileLoading, setDoctorProfileLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] =
    useState<ColumnFilters>(defaultColumnFilters);
  const [timeRangeFilter, setTimeRangeFilter] =
    useState<TimeRangeFilter>("all");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyForm);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  // Cancel-appointment confirmation dialog + per-row in-flight tracking.
  const [cancelTarget, setCancelTarget] = useState<AppointmentDetails | null>(
    null,
  );
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Per-row in-flight tracking for the "change status" menu.
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchAppointments();
    //fetchPatients();
    fetchDoctorProfile();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);

    getAppointmentsByDoctorId(user?.profileId)
      .then((data: AppointmentDetails[]) => {
        setAppointments(data);
      })
      .catch((err: any) => {
        console.error("Error fetching appointments:", err);
        errorNotification("Failed to load appointments.");
      })
      .finally(() => setLoading(false));
  };

  // Patient list is live — powers the "Patient" picker in the schedule
  // dialog. Adjust the URL to wherever patient-ms is actually exposed for
  // you if getPatientsDropdown doesn't already match.
  const fetchPatients = async () => {
    setPatientsLoading(true);
    getPatientsDropdown()
      .then((data: PatientDropdown[]) => {
        setPatients(data);
      })
      .catch((err: any) => {
        console.error("Error fetching patients: ", err);
        errorNotification("Failed to load patients.");
      })
      .finally(() => setPatientsLoading(false));
  };

  // The logged-in doctor's own record — used to prefill the read-only
  // "Doctor" section of the Schedule dialog. user.profileId is the same id
  // already used above for getAppointmentsByDoctorId.
  const fetchDoctorProfile = async () => {
    setDoctorProfileLoading(true);
    getDoctor(user?.profileId)
      .then((data: DoctorProfile) => {
        setDoctorProfile(data);
      })
      .catch((err: any) => {
        console.error("Error fetching doctor profile:", err);
        errorNotification("Failed to load your doctor profile.");
      })
      .finally(() => setDoctorProfileLoading(false));
  };

  // ---------- Filtering ----------
  const filteredAppointments = useMemo(() => {
    const search = globalFilter.trim().toLowerCase();

    // Today's boundaries, computed once per filter pass — used by the
    // Today/Upcoming/Past toggle below.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

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
      if (timeRangeFilter !== "all") {
        const rowDateTime = new Date(row.appointmentDateTime);
        if (timeRangeFilter === "today") {
          if (rowDateTime < startOfToday || rowDateTime >= startOfTomorrow)
            return false;
        } else if (timeRangeFilter === "upcoming") {
          if (rowDateTime < startOfTomorrow) return false;
        } else if (timeRangeFilter === "past") {
          if (rowDateTime >= startOfToday) return false;
        }
      }
      return true;
    });
  }, [appointments, globalFilter, columnFilters, timeRangeFilter]);

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
  }, [globalFilter, columnFilters, timeRangeFilter, rowsPerPage]);

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
    const { patientId, type, appointmentDateTime, reasonForVisit, customReason, notes } =
      scheduleForm;
    const appointmentDate = toDate(appointmentDateTime);

    // Resolve the actual reason text to send: the picked dropdown value,
    // or the typed-in text when "Other (please specify)" was selected.
    const finalReasonForVisit =
      reasonForVisit === OTHER_REASON_VALUE
        ? customReason.trim()
        : reasonForVisit;

    if (
      !doctorProfile ||
      !patientId ||
      !type ||
      !appointmentDate ||
      !reasonForVisit ||
      !finalReasonForVisit
    ) {
      notifications.show({
        color: "yellow",
        title: "Missing details",
        message: doctorProfile
          ? reasonForVisit === OTHER_REASON_VALUE && !customReason.trim()
            ? "Please describe the reason for visit."
            : "Please fill in patient, type, date & time, and reason for visit."
          : "Still loading your doctor profile — try again in a moment.",
      });
      return;
    }

    setScheduleSubmitting(true);

    const patient = patients.find((p) => p.id === patientId);

    // Payload matches AppointmentDto.java exactly — server resolves
    // patientName/doctorName/etc from patientId/doctorId on its side.
    const payload: AppointmentDto = {
      patientId,
      doctorId: doctorProfile.id,
      appointmentDateTime: toLocalDateTimeString(appointmentDate),
      status: AppointmentStatus.SCHEDULED,
      type,
      reasonForVisit: finalReasonForVisit,
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
        patientId,
        patientName: created.patientName ?? patient?.name ?? "",
        patientEmail: created.patientEmail ?? patient?.email ?? "",
        patientPhone: created.patientPhone ?? patient?.phone ?? "",
        doctorId: doctorProfile.id,
        doctorName: created.doctorName ?? doctorProfile.name,
        doctorDepartment: created.doctorDepartment ?? doctorProfile.department,
        appointmentDateTime:
          created.appointmentDateTime ?? payload.appointmentDateTime,
        status: created.status ?? AppointmentStatus.SCHEDULED,
        type: created.type ?? type,
        reasonForVisit: created.reasonForVisit ?? finalReasonForVisit,
        notes: created.notes ?? notes,
      };

      setAppointments((prev) => [newAppointment, ...prev]);
      closeScheduleDialog();
      notifications.show({
        color: "green",
        title: "Appointment scheduled",
        message: `Booked with ${newAppointment.patientName} on ${new Date(
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

  // Opens the confirm dialog for a given row — the actual API call only
  // fires once the user confirms in handleCancelAppointment below.
  const openCancelDialog = (row: AppointmentDetails) => {
    setCancelTarget(row);
  };

  const closeCancelDialog = () => {
    setCancelTarget(null);
  };

  const handleCancelAppointment = async () => {
    if (!cancelTarget) return;

    setCancellingId(cancelTarget.id);
    try {
      await cancelAppointment(cancelTarget.id);

      // cancelAppointment's PUT response shape isn't relied on here — we
      // just flip the row's status locally once the call succeeds.
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelTarget.id
            ? { ...a, status: AppointmentStatus.CANCELLED }
            : a,
        ),
      );

      notifications.show({
        color: "green",
        title: "Appointment cancelled",
        message: `Cancelled appointment with ${cancelTarget.patientName} on ${formatDate(
          cancelTarget.appointmentDateTime,
        )}.`,
      });
      setCancelTarget(null);
    } catch (err) {
      console.error("Failed to cancel appointment", err);
      errorNotification("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  // Doctor-only: change an appointment's status from the table (e.g. mark
  // Confirmed, In Progress, Completed, No-show). Cancelling stays behind
  // the dedicated Cancel action above, so it isn't in this list.
  const handleStatusChange = async (
    row: AppointmentDetails,
    newStatus: AppointmentStatus,
  ) => {
    if (newStatus === row.status) return;

    setUpdatingStatusId(row.id);
    try {
      await updateAppointmentStatus(row.id, newStatus);

      setAppointments((prev) =>
        prev.map((a) => (a.id === row.id ? { ...a, status: newStatus } : a)),
      );

      notifications.show({
        color: "green",
        title: "Status updated",
        message: `${row.patientName}'s appointment marked as ${newStatus.replace("_", " ")}.`,
      });
    } catch (err) {
      console.error("Failed to update appointment status", err);
      errorNotification("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatusId(null);
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
        <Button style={{ display: "none" }}
          leftSection={<IconCalendarPlus size={18} />}
          onClick={openScheduleDialog}
        >
          Add Appointment
        </Button>
      </div>

      <Paper withBorder radius="md" p="md" className="w-full min-w-0">
        {/* Header: quick time-range toggle + search + clear filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <SegmentedControl
            value={timeRangeFilter}
            onChange={(v) => setTimeRangeFilter(v as TimeRangeFilter)}
            color="teal"
            data={[
              { label: "All", value: "all" },
              { label: "Today", value: "today" },
              { label: "Upcoming", value: "upcoming" },
              { label: "Past", value: "past" },
            ]}
          />

          <Group gap="sm" wrap="wrap" justify="flex-end" className="flex-1">
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
          </Group>
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
                        {/* Clicking the badge opens the status-change menu
                            below; disabled once cancelled, a terminal state. */}
                        <Menu
                          shadow="md"
                          width={170}
                          position="bottom-start"
                          disabled={row.status === AppointmentStatus.CANCELLED}
                        >
                          <Menu.Target>
                            <Badge
                              color={statusColor[row.status]}
                              variant="light"
                              style={{
                                cursor:
                                  row.status === AppointmentStatus.CANCELLED
                                    ? "default"
                                    : "pointer",
                              }}
                              rightSection={
                                updatingStatusId === row.id ? (
                                  <Loader size={10} color={statusColor[row.status]} />
                                ) : row.status !==
                                  AppointmentStatus.CANCELLED ? (
                                  <IconChevronDown size={12} />
                                ) : undefined
                              }
                            >
                              {row.status.replace("_", " ")}
                            </Badge>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label>Change status</Menu.Label>
                            {STATUS_MENU_OPTIONS.map((s) => (
                              <Menu.Item
                                key={s}
                                disabled={s === row.status}
                                onClick={() => handleStatusChange(row, s)}
                              >
                                {s.replace("_", " ")}
                              </Menu.Item>
                            ))}
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                      <Table.Td className="min-w-[12rem]">
                        {row.reasonForVisit}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            style={{ display: "none" }}
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
                            loading={cancellingId === row.id}
                            onClick={() => openCancelDialog(row)}
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

      {/* Add appointment for a patient */}
      <Modal
        opened={scheduleDialogOpen}
        onClose={closeScheduleDialog}
        title="Add Appointment"
        size="lg"
        centered
      >
        <Stack gap="md" pt="xs">
          {/* Doctor section: read-only, sourced from the logged-in doctor's
              own profile via getDoctor(user.profileId) — no picker, since
              this is the doctor's own dashboard. */}
          {doctorProfileLoading ? (
            <Group gap="xs">
              <Loader size="xs" />
              <Text size="sm" c="dimmed">
                Loading your profile...
              </Text>
            </Group>
          ) : doctorProfile ? (
            <>
              <TextInput label="Doctor" value={doctorProfile.name} readOnly />
              <Group grow>
                <TextInput
                  label="Department"
                  value={doctorProfile.department}
                  readOnly
                />
                <TextInput label="Phone" value={doctorProfile.phone} readOnly />
              </Group>
            </>
          ) : (
            <Text size="sm" c="red">
              Couldn't load your doctor profile. Please refresh and try again.
            </Text>
          )}

          <Select
            label="Patient"
            required
            placeholder={
              patientsLoading ? "Loading patients..." : "Select a patient"
            }
            disabled={patientsLoading}
            nothingFoundMessage={
              patientsLoading ? "Loading..." : "No patients found"
            }
            data={patients.map((p) => ({
              value: String(p.id),
              label: p.phone ? `${p.name} — ${p.phone}` : p.name,
            }))}
            value={scheduleForm.patientId ? String(scheduleForm.patientId) : null}
            onChange={(v) =>
              setScheduleForm({
                ...scheduleForm,
                patientId: v ? Number(v) : null,
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

          <Select
            label="Reason for visit"
            required
            placeholder="Select a reason"
            data={REASON_SELECT_DATA}
            value={scheduleForm.reasonForVisit || null}
            onChange={(v) =>
              setScheduleForm({
                ...scheduleForm,
                reasonForVisit: v ?? "",
                // Clear any previously typed custom text if switching away
                // from "Other".
                customReason: v === OTHER_REASON_VALUE ? scheduleForm.customReason : "",
              })
            }
            searchable
            nothingFoundMessage="No matching reason"
          />

          {scheduleForm.reasonForVisit === OTHER_REASON_VALUE && (
            <Textarea
              label="Please describe the reason for visit"
              required
              placeholder="e.g. Persistent headache for 3 days"
              autosize
              minRows={2}
              value={scheduleForm.customReason}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  customReason: e.currentTarget.value,
                })
              }
            />
          )}

          <Textarea
            label="Notes (optional)"
            placeholder="Anything worth noting beforehand"
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
              disabled={doctorProfileLoading || !doctorProfile}
            >
              Add Appointment
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Cancel appointment confirmation dialog */}
      <Modal
        opened={!!cancelTarget}
        onClose={closeCancelDialog}
        title="Cancel appointment?"
        centered
        size="sm"
      >
        {cancelTarget && (
          <Stack gap="md">
            <Text size="sm">
              Are you sure you want to cancel the appointment with{" "}
              <b>{cancelTarget.patientName}</b> on{" "}
              {formatDate(cancelTarget.appointmentDateTime)} at{" "}
              {formatTime(cancelTarget.appointmentDateTime)}?
            </Text>
            <Group justify="flex-end">
              <Button
                variant="outline"
                onClick={closeCancelDialog}
                disabled={cancellingId === cancelTarget.id}
              >
                Keep appointment
              </Button>
              <Button
                color="red"
                onClick={handleCancelAppointment}
                loading={cancellingId === cancelTarget.id}
              >
                Yes, cancel it
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default Appointment;