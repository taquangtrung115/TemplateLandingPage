import React from 'react';
import { ANIMATION_OPTIONS } from '../../utils/animationConstants';
import { Play } from 'lucide-react';

export const AnimationSelector = ({
  label = 'Hiệu ứng xuất hiện',
  value = 'fade-up',
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono">{value || 'fade-up'}</span>
        </label>
      )}
      <select
        value={value || 'fade-up'}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
      >
        {ANIMATION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AnimationSelector;
