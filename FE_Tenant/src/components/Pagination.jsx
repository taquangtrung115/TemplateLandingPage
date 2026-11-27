import { ChevronLeft, ChevronRight } from "lucide-react";
import { UiverseIconLabel as IconLabel } from "@oneportal/uiverse-ui";

export default function Pagination({ page, canGoNext, busy, onChange }) {
  return (
    <div className="pagination">
      <button type="button" className="portal-secondary" disabled={busy || page === 1} onClick={() => onChange(page - 1)}>
        <IconLabel icon={ChevronLeft}>Trước</IconLabel>
      </button>
      <span aria-live="polite">Trang {page}</span>
      <button type="button" className="portal-secondary" disabled={busy || !canGoNext} onClick={() => onChange(page + 1)}>
        <IconLabel icon={ChevronRight}>Sau</IconLabel>
      </button>
    </div>
  );
}
