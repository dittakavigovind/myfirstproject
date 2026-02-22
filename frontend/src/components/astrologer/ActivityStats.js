import { Clock, Video, Phone, MessageSquare, DollarSign } from 'lucide-react';

export default function ActivityStats({ stats }) {
    const cards = [
        {
            label: 'Online Time',
            value: stats.totalOnlineSeconds ?
                `${Math.floor(stats.totalOnlineSeconds / 3600)}h ${Math.floor((stats.totalOnlineSeconds % 3600) / 60)}m ${stats.totalOnlineSeconds % 60}s` :
                `${Math.floor(stats.totalOnlineMinutes / 60)}h ${stats.totalOnlineMinutes % 60}m`,
            icon: Clock,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            borderColor: 'border-blue-100'
        },
        {
            label: 'Voice Minutes',
            value: stats.voiceMinutes || 0,
            icon: Phone,
            color: 'text-green-600',
            bg: 'bg-green-50',
            borderColor: 'border-green-100'
        },
        {
            label: 'Video Minutes',
            value: stats.videoMinutes || 0,
            icon: Video,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            borderColor: 'border-purple-100'
        },
        {
            label: 'Chat Minutes',
            value: stats.chatMinutes || 0,
            icon: MessageSquare,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            borderColor: 'border-indigo-100'
        },
        {
            label: 'Today\'s Earnings',
            value: `₹${stats.earnings?.toFixed(2) || '0.00'}`,
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            borderColor: 'border-emerald-100'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className={`bg-white rounded-xl p-4 border ${card.borderColor} shadow-sm`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${card.bg}`}>
                            <card.icon size={18} className={card.color} />
                        </div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{card.label}</p>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{card.value}</h3>
                </div>
            ))}
        </div>
    );
}
