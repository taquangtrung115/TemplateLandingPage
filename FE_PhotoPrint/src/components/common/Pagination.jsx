import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalCount, pageSize, onPage }) {
  const end = Math.max(1, Math.ceil(totalCount / pageSize));
  if (end === 1 && page === 1) return null;
  return <nav className="pagination" aria-label="Phân trang">
    <button className="icon-button" type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Trang trước"><ChevronLeft size={18} /></button>
    <span>Trang {page} / {end}</span>
    <button className="icon-button" type="button" disabled={page >= end} onClick={() => onPage(page + 1)} aria-label="Trang sau"><ChevronRight size={18} /></button>
  </nav>;
}
