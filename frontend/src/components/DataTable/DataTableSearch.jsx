
import React, { useState, useEffect } from 'react';

const dateFormat = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const [month, day, year] = dateStr.split('/');
  if (!month || !day || !year) return dateStr;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const fuzzyMatch = (value, query) => {
  const normalizedQuery = query.toLowerCase();
  return value?.toString().toLowerCase().includes(normalizedQuery);
};

const dateFormat = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const [month, day, year] = dateStr.split('/');
  if (!month || !day || !year) return dateStr;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const DataTableSearch = ({ data = [], keys = [], onSearch }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query) {
        onSearch?.(data);
        return;
      }

      const filtered = data.filter((item) =>
        keys.some((key) => {
          let value = item[key];
          if (item.dateFormat?.includes(key)) {
            value = dateFormat(value);
          }
          return fuzzyMatch(value, query);
        })
      );
      onSearch?.(filtered);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, data, keys, onSearch]);

  return (
    <div className="mb-4 w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default DataTableSearch;
