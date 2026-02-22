"use client";

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <nav className="flex mb-4 overflow-x-auto whitespace-nowrap no-scrollbar py-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {/* Home Icon */}
                <li className="inline-flex items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs md:text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <Home size={14} className="mr-2" />
                        Home
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <ChevronRight size={14} className="text-slate-300 mx-1 md:mx-2 shrink-0" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-xs md:text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors max-w-[150px] md:max-w-xs truncate"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-xs md:text-sm font-bold text-slate-600 max-w-[150px] md:max-w-xs truncate">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
