import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function DataTableActions({ actionMenuItems = [] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

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

  // Position the dropdown via a portal so it isn't clipped by scrolling containers
  useEffect(() => {
    if (!open) return;
    const updatePos = () => {
      if (!menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      // Align right edge of a 160px panel (w-40) to the trigger's right
      setDropdownPos({ top: rect.bottom + 8, left: rect.right - 160 });
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open]);

  // Optional: Close on Escape for better UX
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className='relative inline-block text-left' ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className='p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none'
      >
        <span className='text-xl leading-none'>⋮</span>
      </button>

      {open && createPortal(
        <div
          className='fixed w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]'
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className='py-1'>
            {actionMenuItems.map(({ item, url, warningMessage }, idx) => (
              <button
                key={idx}
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
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
        </div>,
        document.body
      )}
    </div>
  );
}
