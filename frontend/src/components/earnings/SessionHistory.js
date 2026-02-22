import { format } from 'date-fns';

export default function SessionHistory({ sessions }) {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
                <p className="text-slate-400">No session history yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Recent Sessions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Earnings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {sessions.map((session) => (
                            <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {session.userId?.name || 'Unknown User'}
                                </td>
                                <td className="px-6 py-4 capitalize text-slate-600">
                                    {session.type}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            session.status === 'missed' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {session.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {session.billableMinutes} min
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {format(new Date(session.createdAt), 'MMM d, h:mm a')}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                    ₹{session.astrologerEarnings?.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
