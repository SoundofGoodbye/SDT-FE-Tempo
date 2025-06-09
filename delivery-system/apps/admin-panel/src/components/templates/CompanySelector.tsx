import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Company {
  id: string;
  name: string;
}

// Mock company data
const mockCompanies: Company[] = [
  { id: "company-1", name: "Acme Corporation" },
  { id: "company-2", name: "Global Logistics Inc" },
  { id: "company-3", name: "Supply Chain Solutions" },
];

interface CompanySelectorProps {
  selectedCompanyId?: string;
  onCompanyChange: (companyId: string) => void;
}

export default function CompanySelector({
  selectedCompanyId,
  onCompanyChange,
}: CompanySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="company-select">Select Company</Label>
      <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Choose a company" />
        </SelectTrigger>
        <SelectContent>
          {mockCompanies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
