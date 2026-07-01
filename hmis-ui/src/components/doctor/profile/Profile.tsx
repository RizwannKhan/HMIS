import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  TextInput,
  Select,
  Textarea,
  NumberInput,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconCamera,
  IconLock,
} from "@tabler/icons-react";
import {
  DEPARTMENTS,
  PHONE_PREFIX,
  SPECIALIZATIONS,
} from "../../../data/DropdownData";
import { useSelector } from "react-redux";
import {
  getDoctor,
  updateDoctor,
  uploadDoctorAvatar,
} from "../../../services/DoctorProfileService";
import { errorNotification, successNotification } from "../../../utility/NotificationUtil";

// Mirrors DoctorDto (backend).
interface DoctorDto {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  phone: string;
  address: string;
  licenseNo: string | null;
  specialization: string;
  department: string;
  totalExp: number | null;
  avatarUrl: string | null;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  phone: string; // raw 10 digits, no +91
  address: string;
  licenseNo: string | null;
  specialization: string;
  department: string;
  totalExp: number | null;
  avatarUrl: string;
}

const toDoctor = (dto: DoctorDto, fallbackAvatar = "/Avatar.png"): Doctor => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  dob: dto.dob,
  phone: dto.phone,
  address: dto.address,
  licenseNo: dto.licenseNo,
  specialization: dto.specialization,
  department: dto.department,
  totalExp: dto.totalExp,
  avatarUrl:
    dto.avatarUrl && dto.avatarUrl.trim() !== ""
      ? dto.avatarUrl
      : fallbackAvatar,
});

interface InfoRowProps {
  label: string;
  value?: string | number | null;
  editable?: boolean;
  locked?: boolean;
  isEditing?: boolean;
  inputType?: "text" | "select" | "textarea" | "date" | "phone" | "number";
  options?: string[];
  onChange?: (val: string | number) => void;
}

const InfoRow = ({
  label,
  value,
  editable = true,
  locked = false,
  isEditing = false,
  inputType = "text",
  options = [],
  onChange,
}: InfoRowProps) => {
  const canEditNow = editable && !locked;

  const renderReadOnly = () => {
    if (inputType === "phone") {
      return value && (value as string).trim() !== ""
        ? `${PHONE_PREFIX} ${value}`
        : "—";
    }
    if (inputType === "number") {
      return value !== null && value !== undefined && value !== ""
        ? `${value} ${Number(value) === 1 ? "year" : "years"}`
        : "—";
    }
    return value !== null && value !== undefined && `${value}`.trim() !== ""
      ? value
      : "—";
  };

  return (
    <>
      <div className="text-sm text-neutral-500 py-3 border-b border-neutral-100 flex items-center gap-1">
        {label}
        {locked && <IconLock size={12} className="text-neutral-400" />}
      </div>
      <div className="py-2 border-b border-neutral-100 flex items-center">
        {isEditing && canEditNow ? (
          inputType === "select" ? (
            <Select
              data={options}
              value={(value as string) ?? ""}
              onChange={(val) => onChange?.(val ?? "")}
              size="xs"
              className="w-full"
              searchable
            />
          ) : inputType === "textarea" ? (
            <Textarea
              value={(value as string) ?? ""}
              onChange={(e) => onChange?.(e.currentTarget.value)}
              size="xs"
              autosize
              minRows={1}
              className="w-full"
            />
          ) : inputType === "date" ? (
            <DateInput
              value={value ? dayjs(value as string).toDate() : null}
              onChange={(val) =>
                onChange?.(val ? dayjs(val).format("YYYY-MM-DD") : "")
              }
              size="xs"
              className="w-full"
              maxDate={dayjs().toDate()}
              placeholder="Select date of birth"
              popoverProps={{ withinPortal: true, zIndex: 1000 }}
            />
          ) : inputType === "phone" ? (
            <TextInput
              value={(value as string) ?? ""}
              onChange={(e) => {
                const digitsOnly = e.currentTarget.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
                onChange?.(digitsOnly);
              }}
              size="xs"
              className="w-full"
              maxLength={10}
              leftSection={
                <span className="text-sm text-neutral-500 pl-1">
                  {PHONE_PREFIX}
                </span>
              }
              leftSectionWidth={42}
            />
          ) : inputType === "number" ? (
            <NumberInput
              value={value as number}
              onChange={(val) => onChange?.(val === "" ? 0 : Number(val))}
              size="xs"
              className="w-full"
              min={0}
              max={60}
              suffix=" yrs"
            />
          ) : (
            <TextInput
              value={(value as string) ?? ""}
              onChange={(e) => onChange?.(e.currentTarget.value)}
              size="xs"
              className="w-full"
            />
          )
        ) : (
          <div className="text-sm text-neutral-900 font-medium flex items-center gap-2">
            {renderReadOnly()}
            {isEditing && locked && (
              <span className="text-xs text-neutral-400 font-normal">
                (locked after first entry)
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const formatDate = (dob?: string | null) => {
  if (!dob) return undefined;
  return new Date(dob).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Profile = () => {
  const LoginDoctor = useSelector((state: any) => state.user);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [draft, setDraft] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDoctor(LoginDoctor.profileId)
      .then((data: DoctorDto) => {
        const d = toDoctor(data);
        setDoctor(d);
        setDraft(d);
      })
      .catch((err: any) => {
        console.error("Error fetching doctor profile:", err);
        setError("Failed to load profile. Please try again later.");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !doctor || !draft) {
    return (
      <div className="p-10 max-w-4xl mx-auto flex items-center gap-3 text-neutral-500">
        <Loader size="sm" />
        {error ?? "Loading profile..."}
      </div>
    );
  }

  const dobLocked = !!doctor.dob && doctor.dob.trim() !== "";
  const licenseLocked = !!doctor.licenseNo && doctor.licenseNo.trim() !== "";

  const handleEditClick = () => {
    setDraft(doctor);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setDraft(doctor);
    setAvatarFile(null);
    setIsEditing(false);
    setError(null);
  };

  const update = (field: keyof Doctor) => (val: string | number) =>
    setDraft((prev) => (prev ? { ...prev, [field]: val } : prev));

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) =>
        prev ? { ...prev, avatarUrl: reader.result as string } : prev,
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      setIsSaving(true);
      setError(null);

      if (draft.phone && draft.phone.length !== 10) {
        setError("Phone number must be 10 digits.");
        setIsSaving(false);
        return;
      }

      // Avatar goes through its own multipart endpoint — upload it first
      // (if the user picked a new one) so we have the persisted URL before
      // saving the rest of the profile.
      let persistedAvatarUrl = draft.avatarUrl;
      if (avatarFile) {
        const { avatarUrl } = await uploadDoctorAvatar(
          LoginDoctor.profileId,
          avatarFile,
        );
        persistedAvatarUrl = avatarUrl;
      }

      // Matches DoctorDto shape. name/email/id are owned by UserDto and
      // aren't editable here.
      const payload: Record<string, string | number> = {
        phone: draft.phone,
        address: draft.address,
        specialization: draft.specialization,
        department: draft.department,
        totalExp: draft.totalExp ?? 0,
      };

      if (!dobLocked) {
        payload.dob = draft.dob ?? "";
      }
      if (!licenseLocked) {
        payload.licenseNo = draft.licenseNo ?? "";
      }

      const updatedDto: DoctorDto = await updateDoctor(
        LoginDoctor.profileId,
        payload,
      );

      const updated = toDoctor(updatedDto, persistedAvatarUrl);

      setDoctor(updated);
      setDraft(updated);
      setAvatarFile(null);
      setIsEditing(false);
      successNotification("Your profile details have been updated successfully.");
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong while saving. Please try again.");
      const errMsg = err.response?.data?.errorMessage;
      errorNotification(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const current = isEditing ? draft : doctor;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-5 items-center">
          <div className="relative">
            <Avatar
              variant="filled"
              src={current.avatarUrl}
              size={"150"}
              alt="Profile"
              onClick={handleAvatarClick}
              className={isEditing ? "cursor-pointer" : ""}
            />
            {isEditing && (
              <div
                onClick={handleAvatarClick}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              >
                <IconCamera size={28} color="white" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-3xl font-medium text-neutral-900">
              {doctor.name}
            </div>
            <div className="text-xl text-neutral-700">{doctor.email}</div>
            {doctor.specialization && (
              <Badge color="teal" variant="light" className="w-fit mt-1">
                {doctor.specialization}
              </Badge>
            )}
          </div>
        </div>

        {!isEditing ? (
          <Button
            variant="light"
            color="teal"
            leftSection={<IconEdit size={16} />}
            onClick={handleEditClick}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="default"
              leftSection={<IconX size={16} />}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              color="teal"
              leftSection={<IconCheck size={16} />}
              onClick={handleSave}
              loading={isSaving}
            >
              Save
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <Divider my={"xl"} />

      {/* Personal Information */}
      <div>
        <div className="text-2xl font-medium text-neutral-900 mb-4">
          Personal Information
        </div>
        <div
          className="grid bg-white rounded-lg border border-neutral-200 p-6 gap-x-10"
          style={{ gridTemplateColumns: "max-content 1fr max-content 1fr" }}
        >
          <InfoRow
            label="Date of Birth"
            value={
              dobLocked && current.dob ? formatDate(current.dob) : current.dob
            }
            isEditing={isEditing}
            locked={dobLocked}
            inputType="date"
            onChange={update("dob")}
          />
          <InfoRow
            label="Address"
            value={current.address}
            isEditing={isEditing}
            inputType="textarea"
            onChange={update("address")}
          />
          <InfoRow
            label="Phone"
            value={current.phone}
            isEditing={isEditing}
            inputType="phone"
            onChange={update("phone")}
          />
          <InfoRow
            label="License No."
            value={current.licenseNo}
            isEditing={isEditing}
            locked={licenseLocked}
            onChange={update("licenseNo")}
          />
        </div>
      </div>

      <Divider my={"xl"} />

      {/* Professional Information */}
      <div>
        <div className="text-2xl font-medium text-neutral-900 mb-4">
          Professional Information
        </div>
        <div
          className="grid bg-white rounded-lg border border-neutral-200 p-6 gap-x-10"
          style={{ gridTemplateColumns: "max-content 1fr max-content 1fr" }}
        >
          <InfoRow
            label="Specialization"
            value={current.specialization}
            isEditing={isEditing}
            inputType="select"
            options={SPECIALIZATIONS}
            onChange={update("specialization")}
          />
          <InfoRow
            label="Department"
            value={current.department}
            isEditing={isEditing}
            inputType="select"
            options={DEPARTMENTS}
            onChange={update("department")}
          />
          <InfoRow
            label="Total Experience"
            value={current.totalExp}
            isEditing={isEditing}
            inputType="number"
            onChange={update("totalExp")}
          />
          <InfoRow label="" value="" editable={false} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
