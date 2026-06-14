import { useState, useEffect } from 'react';
import API from '../../lib/api';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Tag, IndianRupee, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmationModal from '../ConfirmationModal';

export default function RechargePlanManager() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        bonus: '',
        label: '',
        tag: '',
        isActive: true
    });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await API.get('/admin/recharge-plans');
            if (res.data.success) {
                setPlans(res.data.data);
            }
        } catch (error) {
            console.error('Fetch Plans Error:', error);
            toast.error('Failed to load recharge plans');
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (newOrder) => {
        setPlans(newOrder);
        try {
            await API.put('/admin/recharge-plans/reorder', {
                planIds: newOrder.map(p => p._id)
            });
            toast.success('Order saved', { id: 'reorder-toast' });
        } catch (error) {
            console.error('Reorder Error:', error);
            toast.error('Failed to save order');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                bonus: Number(formData.bonus || 0)
            };

            if (editingPlan) {
                const res = await API.put(`/admin/recharge-plans/${editingPlan._id}`, payload);
                if (res.data.success) {
                    toast.success('Plan updated successfully');
                    setPlans(plans.map(p => p._id === editingPlan._id ? res.data.data : p));
                }
            } else {
                const res = await API.post('/admin/recharge-plans', payload);
                if (res.data.success) {
                    toast.success('Plan created successfully');
                    setPlans([...plans, res.data.data]);
                }
            }
            closeForm();
        } catch (error) {
            console.error('Submit Plan Error:', error);
            toast.error('Failed to save plan');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            amount: plan.amount,
            bonus: plan.bonus,
            label: plan.label,
            tag: plan.tag || '',
            isActive: plan.isActive
        });
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Plan',
            message: 'Are you sure you want to delete this recharge plan?',
            onConfirm: async () => {
                try {
                    const res = await API.delete(`/admin/recharge-plans/${id}`);
                    if (res.data.success) {
                        toast.success('Plan deleted');
                        setPlans(plans.filter(p => p._id !== id));
                    }
                } catch (error) {
                    console.error('Delete Plan Error:', error);
                    toast.error('Failed to delete plan');
                }
                setConfirmModal({ isOpen: false, onConfirm: null, title: '', message: '' });
            }
        });
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingPlan(null);
        setFormData({ amount: '', bonus: '', label: '', tag: '', isActive: true });
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading plans...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, onConfirm: null, title: '', message: '' })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={true}
                confirmText="Delete"
            />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Recharge Plans</h2>
                    <p className="text-sm text-slate-500">Manage predefined wallet recharge amounts and perks.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                    <Plus size={16} /> Add Plan
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Bonus/Perks (₹)</label>
                                <input
                                    type="number"
                                    name="bonus"
                                    value={formData.bonus}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Label (e.g. Popular, Best Value)</label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Tag/Badge (Optional)</label>
                                <input
                                    type="text"
                                    name="tag"
                                    value={formData.tag}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                            >
                                {editingPlan ? 'Update Plan' : 'Save Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {plans.length > 0 ? (
                <Reorder.Group axis="y" values={plans} onReorder={handleReorder} className="flex flex-col gap-4">
                    {plans.map(plan => (
                        <Reorder.Item key={plan._id} value={plan} className={`relative p-5 rounded-xl border ${plan.isActive ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'} flex flex-col justify-between shadow-sm cursor-grab active:cursor-grabbing`}>
                            <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-30 hover:opacity-100 transition border-r border-slate-100">
                                <GripVertical size={16} />
                            </div>
                            <div className="pl-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800 flex items-center gap-1">
                                            <IndianRupee size={16} className="text-slate-500" />
                                            {plan.amount}
                                        </h4>
                                        <p className="text-sm text-slate-500">{plan.label}</p>
                                    </div>
                                    <div className="flex gap-2 text-slate-400">
                                        <button onClick={() => handleEdit(plan)} className="hover:text-indigo-600 transition" title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(plan._id)} className="hover:text-red-500 transition" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Bonus Perks:</span>
                                        <span className="font-semibold text-green-600">+₹{plan.bonus}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Wallet:</span>
                                        <span className="font-semibold text-indigo-600">₹{plan.amount + plan.bonus}</span>
                                    </div>
                                    {plan.tag && (
                                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                                            <Tag size={12} /> {plan.tag}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between pl-6">
                                <span className={`text-xs font-bold flex items-center gap-1 ${plan.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                    {plan.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            ) : (
                <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    No recharge plans found. Create one to get started!
                </div>
            )}
        </div>
    );
}
