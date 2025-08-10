// src/components/Paginator/Paginator.jsx
export default function Paginator({ page, perPage, total, onPageChange }) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className='mt-6 flex justify-center items-center gap-2 text-sm bg-blue-700 p-4 rounded-lg border border-blue-800'>
      <button
        className={`border border-blue-800 rounded px-3 py-1 bg-blue-900 text-blue-100 hover:bg-blue-800 transition-colors ${
          page <= 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        &lsaquo; Prev
      </button>

      <span className='px-2 text-blue-100 font-semibold'>
        Page {page} of {totalPages}
      </span>

      <button
        className={`border border-blue-800 rounded px-3 py-1 bg-blue-900 text-blue-100 hover:bg-blue-800 transition-colors ${
          page * perPage >= total ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => onPageChange(page + 1)}
        disabled={page * perPage >= total}
      >
        Next &rsaquo;
      </button>
    </div>
  );
}
