import { useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  TextInput,
  Select,
  Textarea,
  TagsInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { IconEdit, IconCheck, IconX, IconCamera, IconLock } from "@tabler/icons-react";
import { BLOOD_GROUPS, PHONE_PREFIX } from "../../../data/DropdownData";
import { useSelector } from "react-redux";

interface Patient {
  id: number;
  name: string;
  email: string;
  dob: string | null;
  phone: string; // raw 10 digits, no +91
  address: string;
  aadhaarNo: string | null;
  bloodGroup: string;
  allergies: string[];        // now an array
  chronicDisease: string[];   // now an array
  avatarUrl: string;
}

interface InfoRowProps {
  label: string;
  value?: string | string[] | null;
  editable?: boolean;
  locked?: boolean;
  isEditing?: boolean;
  inputType?: "text" | "select" | "textarea" | "date" | "phone" | "tags";
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
                const digitsOnly = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
                onChange?.(digitsOnly);
              }}
              size="xs"
              className="w-full"
              maxLength={10}
              leftSection={
                <span className="text-sm text-neutral-500 pl-1">{PHONE_PREFIX}</span>
              }
              leftSectionWidth={42}
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

const dummyPatient: Patient = {
  id: 1024,
  name: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  dob: "2001-06-27",
  phone: "9876543210",
  address: "B-204, Shanti Nagar, Jaipur, Rajasthan - 302015",
  aadhaarNo: "XXXX-XXXX-4321",
  bloodGroup: "O+",
  allergies: ["Penicillin", "Dust"],
  chronicDisease: ["Type 2 Diabetes"],
  avatarUrl: "/Avatar.png",
};

const Profile = () => {
  const LoginPatient = useSelector((state: any) => state.user);
  const [patient, setPatient] = useState<Patient>(LoginPatient);
  const [draft, setDraft] = useState<Patient>(LoginPatient);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const update =
    (field: keyof Patient) => (val: string | string[]) =>
      setDraft((prev) => ({ ...prev, [field]: val }));

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (draft.phone && draft.phone.length !== 10) {
        setError("Phone number must be 10 digits.");
        setIsSaving(false);
        return;
      }

      const formData = new FormData();

      // Backend `allergies`/`chronicDisease` fields are comma-separated
      // Strings per your DTO — join the arrays back before sending.
      const patientPayload: Record<string, string> = {
        phone: draft.phone,
        address: draft.address,
        bloodGroup: draft.bloodGroup,
        allergies: draft.allergies.join(", "),
        chronicDisease: draft.chronicDisease.join(", "),
      };

      if (!dobLocked) {
        patientPayload.dob = draft.dob ?? "";
      }
      if (!aadhaarLocked) {
        patientPayload.aadhaarNo = draft.aadhaarNo ?? "";
      }

      formData.append(
        "patient",
        new Blob([JSON.stringify(patientPayload)], { type: "application/json" })
      );

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      /* const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to update profile (${res.status})`);
      }

      const updatedRaw = await res.json();

      // Backend returns allergies/chronicDisease as comma-separated strings —
      // split back into arrays for the UI.
      const updated: Patient = {
        ...updatedRaw,
        allergies: updatedRaw.allergies
          ? updatedRaw.allergies.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        chronicDisease: updatedRaw.chronicDisease
          ? updatedRaw.chronicDisease.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
      };

      setPatient(updated);
      setDraft(updated);
      setAvatarFile(null); */
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving. Please try again.");
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

const formatDate = (dob?: string | null) => {
  if (!dob) return undefined;
  return new Date(dob).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default Profile;