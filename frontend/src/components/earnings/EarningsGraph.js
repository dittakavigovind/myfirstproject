'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EarningsGraph({ history }) {

    // Transform data for chart
    const data = history.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        earnings: item.totalNetEarnings,
        sessions: item.successfulSessions
    }));

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex items-center justify-center h-80">
                <p className="text-slate-400">No earnings data available for graph</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Earnings Overview</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="earnings" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} name="Earnings (₹)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
