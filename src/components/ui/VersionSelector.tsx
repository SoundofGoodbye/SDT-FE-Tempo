import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";
import type { Version } from "@/types/delivery";

interface VersionSelectorProps {
  label: string;
  versions: Version[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function VersionSelector({
  label,
  versions,
  value,
  onChange,
  disabled = false,
}: VersionSelectorProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={`version-selector-${label}`}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={`version-selector-${label}`} className="w-full">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((version) => (
            <SelectItem key={version.id} value={version.id}>
              {`${version.stepType} – ${new Date(version.timestamp).toLocaleString()}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
