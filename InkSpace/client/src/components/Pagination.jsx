import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={17}/> Previous</button>
      <span>Page <strong>{page}</strong> of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next <ChevronRight size={17}/></button>
    </div>
  )
}
