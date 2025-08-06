// src/components/Paginator/Paginator.jsx
export default function Paginator({ page, perPage, total, onPageChange }) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className='mt-6 flex justify-center items-center gap-2 text-sm text-gray-700'>
      <button
        className={`border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 ${
          page <= 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        &lsaquo; Prev
      </button>

      <span className='px-2 text-gray-600'>
        Page {page} of {totalPages}
      </span>

      <button
        className={`border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 ${
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
