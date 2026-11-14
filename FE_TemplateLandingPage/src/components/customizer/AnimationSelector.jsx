import React from 'react';
import { ANIMATION_GROUPS } from '../../utils/animationConstants';
import { Play, Sparkles } from 'lucide-react';

export const AnimationSelector = ({
  label = 'Hiệu ứng động',
  value = 'fade-up',
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono px-1.5 py-0.5 rounded bg-gray-100">
            {value || 'fade-up'}
          </span>
        </label>
      )}
      <div className="relative">
        <select
          value={value || 'fade-up'}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 cursor-pointer shadow-sm"
        >
          {ANIMATION_GROUPS.map((group) => (
            <optgroup key={group.groupId} label={`── ${group.groupName} ──`}>
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AnimationSelector;
