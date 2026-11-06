import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  title?: string;
  size?: 'sm' | 'md';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  title,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
        isSm ? 'h-4 w-7' : 'h-5 w-9'
      } ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer'
      } ${
        checked ? 'bg-emerald-500' : 'bg-slate-300 hover:bg-slate-400'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          isSm ? 'h-3 w-3' : 'h-4 w-4'
        } ${
          checked ? (isSm ? 'translate-x-3' : 'translate-x-4') : 'translate-x-0'
        }`}
      />
    </button>
  );
};

