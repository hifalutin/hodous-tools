import React, { useState, useRef, useEffect } from 'react';

export default function DataTableActions({ actionMenuItems = [] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
      >
        <span className="text-xl leading-none">⋮</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {actionMenuItems.map(({ item, url, warningMessage }, idx) => (
              <button
                key={idx}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => {
                  const proceed = warningMessage ? confirm(warningMessage) : true;
                  if (proceed) {
                    window.location.href = url;
                  }
                  setOpen(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
