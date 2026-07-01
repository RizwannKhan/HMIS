import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  TextInput,
  Select,
  Textarea,
  TagsInput,
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
import { BLOOD_GROUPS, PHONE_PREFIX } from "../../../data/DropdownData";
import { useSelector } from "react-redux";
import {
  getPatient,
  updatePatient,
  uploadPatientAvatar,
} from "../../../services/PatientProfileService";
import { errorNotification, successNotification } from "../../../utility/NotificationUtil";

// Mirrors PatientDto (backend). allergies/chronicDisease are comma-separated
// strings on the wire — we convert to arrays for the UI and join back on save.
interface PatientDto {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  phone: string;
  address: string;
  aadhaarNo: string | null;
  bloodGroup: string;
  allergies: string; // comma-separated from backend
  chronicDisease: string; // comma-separated from backend
  avatarUrl: string | null;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  phone: string;
  address: string;
  aadhaarNo: string | null;
  bloodGroup: string;
  allergies: string[];
  chronicDisease: string[];
  avatarUrl: string;
}

const splitCsv = (val?: string | null): string[] =>
  val
    ? val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const joinCsv = (val: string[]): string => val.join(", ");

// Aadhaar is stored as a raw 12-digit string. formatAadhaarDigits adds
// dashes for readability while the user is typing (full number visible,
// since they're the one entering it). maskAadhaar is for read-only display
// once saved — only the last 4 digits are ever shown.
const formatAadhaarDigits = (digits: string): string =>
  digits.replace(/(\d{4})(?=\d)/g, "$1-");

const maskAadhaar = (raw?: string | null): string => {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 0) return "—";
  if (digits.length < 12) return formatAadhaarDigits(digits); // still being entered
  return `****-****-${digits.slice(-4)}`;
};

const toPatient = (
  dto: PatientDto,
  fallbackAvatar = "/Avatar.png",
): Patient => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  dob: dto.dob,
  phone: dto.phone,
  address: dto.address,
  aadhaarNo: dto.aadhaarNo,
  bloodGroup: dto.bloodGroup,
  allergies: splitCsv(dto.allergies),
  chronicDisease: splitCsv(dto.chronicDisease),
  avatarUrl:
    dto.avatarUrl && dto.avatarUrl.trim() !== ""
      ? dto.avatarUrl
      : fallbackAvatar,
});

interface InfoRowProps {
  label: string;
  value?: string | string[] | null;
  editable?: boolean;
  locked?: boolean;
  isEditing?: boolean;
  inputType?:
    | "text"
    | "select"
    | "textarea"
    | "date"
    | "phone"
    | "tags"
    | "aadhaar";
  options?: string[];
  onChange?: (val: string | string[]) => void;
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
    if (inputType === "aadhaar") {
      return maskAadhaar(value as string);
    }
    if (inputType === "tags") {
      const arr = (value as string[]) ?? [];
      if (arr.length === 0) return "—";
      return (
        <div className="flex flex-wrap gap-1.5">
          {arr.map((item) => (
            <Badge key={item} variant="light" color="gray" size="sm">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    return value && (value as string).trim() !== "" ? value : "—";
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
          ) : inputType === "aadhaar" ? (
            <TextInput
              value={formatAadhaarDigits(
                ((value as string) ?? "").replace(/\D/g, ""),
              )}
              onChange={(e) => {
                const digitsOnly = e.currentTarget.value
                  .replace(/\D/g, "")
                  .slice(0, 12);
                onChange?.(digitsOnly);
              }}
              size="xs"
              className="w-full"
              placeholder="XXXX-XXXX-XXXX"
              maxLength={14} // 12 digits + 2 dashes
            />
          ) : inputType === "tags" ? (
            <TagsInput
              value={(value as string[]) ?? []}
              onChange={(val) => onChange?.(val)}
              size="xs"
              className="w-full"
              placeholder="Type and press Enter"
              splitChars={[",", "\n"]}
              clearable
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
          <div className="text-sm text-neutral-900 font-medium flex items-center gap-2 flex-wrap">
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
  const LoginPatient = useSelector((state: any) => state.user);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [draft, setDraft] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPatient(LoginPatient.profileId)
      .then((data: PatientDto) => {
        const p = toPatient(data);
        setPatient(p);
        setDraft(p);
      })
      .catch((err: any) => {
        console.error("Error fetching patient profile:", err);
        setError("Failed to load profile. Please try again later.");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !patient || !draft) {
    return (
      <div className="p-10 max-w-4xl mx-auto flex items-center gap-3 text-neutral-500">
        <Loader size="sm" />
        {error ?? "Loading profile..."}
      </div>
    );
  }

  const dobLocked = !!patient.dob && patient.dob.trim() !== "";
  const aadhaarLocked = !!patient.aadhaarNo && patient.aadhaarNo.trim() !== "";

  const handleEditClick = () => {
    setDraft(patient);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setDraft(patient);
    setAvatarFile(null);
    setIsEditing(false);
    setError(null);
  };

  const update = (field: keyof Patient) => (val: string | string[]) =>
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
        const { avatarUrl } = await uploadPatientAvatar(
          LoginPatient.profileId,
          avatarFile,
        );
        persistedAvatarUrl = avatarUrl;
      }

      // Matches PatientDto shape. name/email/id are owned by UserDto and
      // aren't editable here.
      const payload: Record<string, any> = {
        phone: draft.phone,
        address: draft.address,
        bloodGroup: draft.bloodGroup,
        allergies: joinCsv(draft.allergies),
        chronicDisease: joinCsv(draft.chronicDisease),
      };

      if (!dobLocked) {
        payload.dob = draft.dob ?? null;
      }
      if (!aadhaarLocked) {
        payload.aadhaarNo = draft.aadhaarNo ?? null;
      }

      const updatedDto: PatientDto = await updatePatient(
        LoginPatient.profileId,
        payload,
      );

      const updated = toPatient(updatedDto, persistedAvatarUrl);

      setPatient(updated);
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

  const current = isEditing ? draft : patient;

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
              {patient.name}
            </div>
            <div className="text-xl text-neutral-700">{patient.email}</div>
            {patient.bloodGroup && (
              <Badge color="red" variant="light" className="w-fit mt-1">
                {patient.bloodGroup}
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
            label="Aadhaar No."
            value={current.aadhaarNo}
            isEditing={isEditing}
            locked={aadhaarLocked}
            inputType="aadhaar"
            onChange={update("aadhaarNo")}
          />
          <InfoRow
            label="Blood Group"
            value={current.bloodGroup}
            isEditing={isEditing}
            inputType="select"
            options={BLOOD_GROUPS}
            onChange={update("bloodGroup")}
          />
          <InfoRow label="" value="" editable={false} />
        </div>
      </div>

      <Divider my={"xl"} />

      {/* Medical Information */}
      <div>
        <div className="text-2xl font-medium text-neutral-900 mb-4">
          Medical Information
        </div>
        <div
          className="grid bg-white rounded-lg border border-neutral-200 p-6 gap-x-10"
          style={{ gridTemplateColumns: "max-content 1fr max-content 1fr" }}
        >
          <InfoRow
            label="Allergies"
            value={current.allergies}
            isEditing={isEditing}
            inputType="tags"
            onChange={update("allergies")}
          />
          <InfoRow
            label="Chronic Disease"
            value={current.chronicDisease}
            isEditing={isEditing}
            inputType="tags"
            onChange={update("chronicDisease")}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
