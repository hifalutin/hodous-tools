import { format as formatDateFns, parseISO } from 'date-fns';
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
  'px-4 py-2 text-sm whitespace-nowrap align-middle font-sans';
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

  const [data, setData] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDropdownRowId, setOpenDropdownRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
          }}
        />
      </div>
      <div className='overflow-x-auto max-w-full'>
        <table className='w-full border-separate border-spacing-0 text-sm text-white bg-[#1C1C1E] font-display'>
          <thead>
            <tr>
              {isSelectable && (
                <th className={`${headerBaseClass} text-left`}>
                  <input
                    type='checkbox'
                    checked={
                      selectedRows.length === data.length && data.length > 0
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
                    className={`${headerBaseClass} text-${
                      col.headerAlign || 'left'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              {hasActions && (
                <th className={`${headerBaseClass} text-center`}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              return (
                <tr
                  key={row[rowId]}
                  className='hover:bg-blue-500/5 cursor-pointer border-b border-white/10 transition-colors'
                  onClick={() => setOpenDropdownRowId(null)}
                >
                  {isSelectable && (
                    <td className={`${cellBaseClass}`}>
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
                            col.key === 'status'
                              ? row[col.key]?.toLowerCase() === 'paid'
                                ? 'text-green-500 font-medium'
                                : row[col.key]?.toLowerCase() === 'overdue'
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
                                {col.isFinancial
                                  ? Number(displayValue).toLocaleString(
                                      'en-US',
                                      {
                                        style: 'currency',
                                        currency: 'USD',
                                      }
                                    )
                                  : displayValue}
                              </div>
                            </a>
                          ) : (
                            <div className='break-words whitespace-normal'>
                              {col.isFinancial
                                ? Number(displayValue).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                  })
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
  );
}
