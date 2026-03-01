import React from 'react';

const HeroSection = ({
    title,
    highlightText,
    titleSuffix,
    subtitle,
    icon,
    rightContent,
    iconPosition = 'right',
    align = 'left',
    children,
    extraPaddingBottom = false
}) => {
    return (
        <div className={`bg-astro-navy text-white py-8 md:py-12 px-4 relative overflow-hidden ${extraPaddingBottom ? 'pb-24 md:pb-32' : ''}`}>
            <div className={`absolute top-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} p-10 opacity-5 pointer-events-none`}>
                <span className="text-[12rem] font-black leading-none">{icon}</span>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className={`grid grid-cols-1 ${rightContent ? 'lg:grid-cols-2 gap-8' : 'gap-4'} items-center`}>

                    {/* Left/Main Content */}
                    <div className={`flex flex-col ${align === 'center' ? 'items-center text-center mx-auto' : 'text-left w-full'}`}>
                        {children ? children : (
                            <>
                                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                                    {title} {highlightText && <span className="text-astro-yellow">{highlightText}</span>} {titleSuffix}
                                </h1>
                                <p className={`text-sm md:text-base text-white/80 max-w-xl leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
                                    {subtitle}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Right Side: Optional Features / Content */}
                    {rightContent && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {rightContent}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
