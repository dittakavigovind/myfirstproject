import React, { forwardRef } from 'react';

const CustomDateInput = forwardRef(({ value, onClick, className, placeholder, Icon, iconColor }, ref) => (
    <div
        ref={ref}
        onClick={onClick}
        className={`${className} relative group flex items-center cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all`}
    >
        {Icon && (
            <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${iconColor || 'text-slate-400'} group-focus-within:text-indigo-600 transition-colors`}>
                <Icon size={16} />
            </div>
        )}
        <span className={`text-sm font-bold text-slate-800 ${Icon ? 'pl-7' : ''} ${value ? "" : "text-slate-400 font-normal"}`}>
            {value || placeholder}
        </span>
    </div>
));

CustomDateInput.displayName = 'CustomDateInput';

export default CustomDateInput;
