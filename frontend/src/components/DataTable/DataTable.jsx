import { format as formatDateFns, parseISO } from 'date-fns';
import { Settings } from 'lucide-react';
function filterData(query, data) {
  const lowered = query.toLowerCase();
  return data.filter((row) =>
    Object.values(row).some((val) => {
      if (val == null) return false;
      return val.toString().toLowerCase().includes(lowered);
    })
  );
}

import { useEffect, useState } from 'react';
import DataTableActions from './DataTableActions';

const cellBaseClass =
  'px-4 py-2 text-sm whitespace-nowrap align-middle font-sans min-h-[4em]';
const headerBaseClass =
  'px-4 py-3 font-medium text-gray-400 border-b border-white/10 font-sans';

export default function DataTable({
  tableInfo,
  rowId = 'id',
  isSelectable = tableInfo.isSelectable || false,
  hasActions = tableInfo.hasActions || false,
  onSelect = () => {}, // new optional callback
}) {
  const highlightFields = tableInfo.highlightFields || [];
  const financialFields = tableInfo.financialFields || [];

  const [data, setData] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDropdownRowId, setOpenDropdownRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${tableInfo.apiUrl}`);
        const json = await res.json();
        const rows = Array.isArray(json?.data?.invoices)
          ? json.data.invoices
          : [];
        setMasterData(rows);
        setData(rows);
        if (rows.length > 0) {
          console.log('Sample invoice row:', rows[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [tableInfo.apiUrl]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setData(masterData);
    } else {
      const filtered = filterData(searchQuery, masterData);
      setData(filtered);
    }
  }, [searchQuery, masterData]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allRowIds = data.map((row) => row[rowId]);
      setSelectedRows(allRowIds);
      onSelect(allRowIds);
    } else {
      setSelectedRows([]);
      onSelect([]);
    }
  };

  const handleSelectRow = (e, id) => {
    let updated;
    if (e.target.checked) {
      updated = [...selectedRows, id];
    } else {
      updated = selectedRows.filter((rowId) => rowId !== id);
    }
    setSelectedRows(updated);
    onSelect(updated);
  };

  // Stub handler for dropdown actions
  const handleActionClick = (action, row) => {
    return;
  };

  const columnCount =
    tableInfo.headers.length + (isSelectable ? 1 : 0) + (hasActions ? 1 : 0);

  const formatDate = (dateStr) => {
    console.log('formatDate called with:', dateStr);
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    try {
      console.log('Formatting', dateStr, 'with', tableInfo.dateFormat);
      const dateObj = parseISO(dateStr);
      const formatted = formatDateFns(
        dateObj,
        tableInfo.dateFormat || 'MM/dd/yyyy'
      );
      console.log('Formatted result using date-fns:', formatted);
      return formatted;
    } catch (err) {
      console.error('Date formatting error:', err);
      return dateStr;
    }
  };

  // Shared colgroup for perfect alignment across tables
  const renderColGroup = () => (
    <colgroup>
      {isSelectable && <col style={{ width: '36px' }} />}
      {tableInfo.headers
        .filter((col) => col.key !== 'select')
        .map((col, idx) => (
          <col key={idx} style={{ width: 'auto' }} />
        ))}
      {hasActions && <col style={{ width: '60px' }} />}
    </colgroup>
  );

  return (
    <div>
      <div className='mb-4 flex justify-end'>
        <input
          type='text'
          placeholder='Search...'
          className='w-full max-w-md ml-auto mr-4 px-4 py-2 rounded bg-neutral-800 text-white border border-white/10'
          value={searchQuery}
          onChange={(e) => {
            console.log('Search input:', e.target.value);
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      <div className='overflow-x-auto max-w-full'>
        <div className='overflow-y-auto max-h-[calc(100vh)] relative z-0 scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent'>
          <table className='w-full text-sm text-white bg-[#1C1C1E] font-display'>
            {renderColGroup()}
            {/* Sticky thead container */}
            <thead className='sticky top-0 z-10 bg-[#1C1C1E]'>
              {isLoadingPage ? (
                <tr>
                  {isSelectable && (
                    <th className={`${headerBaseClass} w-[24px] text-center`}>
                      <span className='invisible'>Select</span>
                    </th>
                  )}
                  {tableInfo.headers
                    .filter((col) => col.key !== 'select')
                    .map((col) => (
                      <th
                        key={col.key}
                        className={`${headerBaseClass} ${
                          col.headerAlign === 'right'
                            ? 'text-right'
                            : col.headerAlign === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        <span className='invisible'>{col.label}</span>
                      </th>
                    ))}
                  {hasActions && (
                    <th className={`${headerBaseClass} text-center w-[60px]`}>
                      <span className='invisible'>Actions</span>
                    </th>
                  )}
                </tr>
              ) : (
                <tr>
                  {isSelectable && (
                    <th className={`${headerBaseClass} w-[24px] text-center`}>
                      <input
                        type='checkbox'
                        checked={
                          data.length > 0 && selectedRows.length === data.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {tableInfo.headers
                    .filter((col) => col.key !== 'select')
                    .map((col) => (
                      <th
                        key={col.key}
                        className={`${headerBaseClass} ${
                          col.headerAlign === 'right'
                            ? 'text-right'
                            : col.headerAlign === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  {hasActions && (
                    <th
                      className={`${headerBaseClass} text-center w-[60px]`}
                    ></th>
                  )}
                </tr>
              )}
            </thead>
            <tbody>
              {isLoadingPage
                ? Array.from({ length: rowsPerPage }).map((_, i) => (
                    <tr
                      key={`placeholder-${i}`}
                      className='animate-pulse border-b border-white/5'
                    >
                      {/* Render placeholder columns with alignment */}
                      {isSelectable && (
                        <td className={`${cellBaseClass} w-[24px]`}>
                          <div className='bg-gray-500 bg-opacity-10 w-[16px] h-5 rounded-sm mx-auto' />
                        </td>
                      )}
                      {tableInfo.headers
                        .filter((col) => col.key !== 'select')
                        .map((col, j) => (
                          <td key={j} className={`${cellBaseClass}`}>
                            <div
                              className={`h-5 bg-gray-500 bg-opacity-10 rounded-full ${
                                col.columnAlign === 'right'
                                  ? 'ml-auto'
                                  : col.columnAlign === 'center'
                                  ? 'mx-auto'
                                  : 'mr-auto'
                              }`}
                              style={{ width: `${60 + Math.random() * 30}%` }}
                            />
                          </td>
                        ))}
                      {hasActions && (
                        <td className={`${cellBaseClass} text-center w-[60px]`}>
                          <div className='h-5 w-[60%] bg-gray-500 bg-opacity-10 rounded-full mx-auto' />
                        </td>
                      )}
                    </tr>
                  ))
                : paginatedData.map((row) => {
                    return (
                      <tr
                        key={row[rowId]}
                        className='hover:bg-blue-500/5 cursor-pointer transition-colors opacity-0 animate-[fade-in_1s_ease-in-out_forwards] border-b border-white/5'
                        onClick={() => setOpenDropdownRowId(null)}
                      >
                        {isSelectable && (
                          <td className={`${cellBaseClass} w-[24px]`}>
                            <input
                              type='checkbox'
                              checked={selectedRows.includes(row[rowId])}
                              onChange={(e) => handleSelectRow(e, row[rowId])}
                            />
                          </td>
                        )}
                        {tableInfo.headers
                          .filter((col) => col.key !== 'select')
                          .map((col) => {
                            let displayValue = row[col.key];
                            // Ensure tableInfo.dateFields contains correct keys that match invoice object field names exactly, e.g. 'date', 'due_date'
                            if (
                              Array.isArray(tableInfo.dateFields) &&
                              tableInfo.dateFields.includes(col.key)
                            ) {
                              const rawDate = row[col.key];
                              console.log(
                                'Trying to format date for key:',
                                col.key,
                                'value:',
                                rawDate
                              );
                              if (typeof rawDate === 'string') {
                                displayValue = formatDate(rawDate);
                              }
                            }
                            return (
                              <td
                                key={col.key}
                                className={`${cellBaseClass} max-w-[150px] break-words whitespace-normal ${
                                  col.columnAlign === 'right'
                                    ? 'text-right'
                                    : col.columnAlign === 'center'
                                    ? 'text-center'
                                    : 'text-left'
                                } ${
                                  col.key === 'status'
                                    ? row[col.key]?.toLowerCase() === 'paid'
                                      ? 'text-green-500 font-medium'
                                      : row[col.key]?.toLowerCase() ===
                                        'overdue'
                                      ? 'text-red-400 font-medium'
                                      : 'text-orange-400 font-medium'
                                    : highlightFields.includes(col.key)
                                    ? 'text-blue-500 font-medium'
                                    : ''
                                }`}
                              >
                                {col.key !== 'status' &&
                                highlightFields.includes(col.key) ? (
                                  <a href='#' className='hover:underline'>
                                    <div className='break-words whitespace-normal'>
                                      {typeof displayValue === 'number'
                                        ? `$${displayValue.toFixed(2)}`
                                        : displayValue}
                                    </div>
                                  </a>
                                ) : (
                                  <div className='break-words whitespace-normal'>
                                    {typeof displayValue === 'number'
                                      ? `$${displayValue.toFixed(2)}`
                                      : displayValue}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        {hasActions && (
                          <td className={`${cellBaseClass} text-center`}>
                            <DataTableActions
                              row={row}
                              rowId={row[rowId]}
                              openDropdownRowId={openDropdownRowId}
                              setOpenDropdownRowId={setOpenDropdownRowId}
                              actionMenuItems={tableInfo.actionMenuItems}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      <div className='sticky bottom-0 left-0 w-full z-10 bg-[#1C1C1E] border border-white/10 px-4 py-4 text-white text-sm flex justify-center'>
        <div className='flex rounded overflow-hidden divide-x divide-white/10 bg-neutral-800'>
          <div className='relative flex items-center px-3'>
            <Settings className='w-4 h-4 text-white mr-2' />
            <select
              className='bg-transparent py-2 pr-4 focus:outline-none appearance-none text-white'
              value={rowsPerPage}
              onChange={(e) => {
                setIsLoadingPage(true);
                setCurrentPage(1);
                setRowsPerPage(Number(e.target.value));
                setTimeout(() => setIsLoadingPage(false), 300);
              }}
            >
              {[10, 20, 30, 50].map((num) => (
                <option key={num} value={num}>
                  {num} per page
                </option>
              ))}
            </select>
          </div>

          <button
            className='px-4 py-2 disabled:opacity-50'
            onClick={() => {
              setIsLoadingPage(true);
              setCurrentPage((prev) => {
                const next = Math.max(prev - 1, 1);
                setTimeout(() => setIsLoadingPage(false), 300);
                return next;
              });
            }}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          <span className='px-4 py-2'>
            {`${(currentPage - 1) * rowsPerPage + 1} – ${Math.min(
              currentPage * rowsPerPage,
              data.length
            )}`}
          </span>

          <button
            className='px-4 py-2 disabled:opacity-50'
            onClick={() => {
              setIsLoadingPage(true);
              setCurrentPage((prev) => {
                const maxPage = Math.ceil(data.length / rowsPerPage);
                const next = prev < maxPage ? prev + 1 : prev;
                setTimeout(() => setIsLoadingPage(false), 300);
                return next;
              });
            }}
            disabled={currentPage >= Math.ceil(data.length / rowsPerPage)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
