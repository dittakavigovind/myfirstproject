import { Wallet, Clock, Users, DollarSign } from 'lucide-react';

export default function StatsCards({ stats, walletBalance }) {
    const cards = [
        {
            label: 'Wallet Balance',
            value: `₹${walletBalance?.toFixed(2) || '0.00'}`,
            icon: Wallet,
            color: 'text-green-600',
            bg: 'bg-green-50',
            borderColor: 'border-green-100'
        },
        {
            label: 'Total Earnings',
            value: `₹${stats.lifetime?.totalEarnings?.toFixed(2) || '0.00'}`,
            icon: DollarSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            borderColor: 'border-indigo-100'
        },
        {
            label: 'Total Sessions',
            value: stats.lifetime?.totalSessions || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            label: 'Total Minutes',
            value: stats.lifetime?.totalDuration || 0,
            icon: Clock,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            borderColor: 'border-purple-100'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className={`bg-white rounded-2xl p-6 border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${card.bg}`}>
                            <card.icon size={24} className={card.color} />
                        </div>
                        {/* <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span> */}
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
