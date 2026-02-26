import React, { forwardRef } from 'react';

const CustomDateInput = forwardRef(({ value, onClick, className, placeholder, Icon, iconColor }, ref) => (
    <div
        ref={ref}
        onClick={onClick}
        className={`${className} flex items-center cursor-pointer select-none touch-none touch-callout-none`}
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
    >
        {Icon && (
            <div className={`mr-3 ${iconColor || 'opacity-50'}`}>
                <Icon size={20} />
            </div>
        )}
        <span className={value ? "" : "opacity-50"}>
            {value || placeholder}
        </span>
    </div>
));

CustomDateInput.displayName = 'CustomDateInput';

export default CustomDateInput;
