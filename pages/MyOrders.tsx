
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Truck, AlertCircle, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const MyOrders = () => {
  const { user, orders, cancelOrder, requestReturn } = useStore();
  const [returnModalOpen, setReturnModalOpen] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');

  if (!user) return <Navigate to="/login" replace />;

  const myOrders = orders.filter(o => o.userId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleReturnSubmit = (orderId: string) => {
      if(!returnReason.trim()) return;
      requestReturn(orderId, returnReason);
      setReturnModalOpen(null);
      setReturnReason('');
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
          case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
          case 'returned': return 'text-blue-600 bg-blue-50 border-blue-200';
          case 'refunded': return 'text-purple-600 bg-purple-50 border-purple-200';
          case 'return_requested': return 'text-orange-600 bg-orange-50 border-orange-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif font-bold text-text-main mb-8">My Orders</h1>
        
        {myOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No orders found</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't ordered anything yet.</p>
                <Link to="/shop" className="px-6 py-2 bg-primary text-white rounded-full font-bold">Start Shopping</Link>
            </div>
        ) : (
            <div className="space-y-6">
                {myOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-white rounded-full border border-gray-200">
                                    <Package className="text-primary" size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-gray-800">Order #{order.id}</div>
                                    <div className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex flex-col md:items-end gap-1">
                                <div className="text-xl font-bold text-primary">₹{order.finalAmount}</div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide inline-block text-center ${getStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="p-6">
                             {order.items.map((item, idx) => (
                                 <div key={idx} className="flex gap-4 mb-4 last:mb-0">
                                     <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                     </div>
                                     <div>
                                         <div className="font-bold text-gray-800">{item.name}</div>
                                         <div className="text-sm text-gray-500">Qty: {item.quantity} x ₹{item.offerPrice || item.price}</div>
                                     </div>
                                 </div>
                             ))}
                        </div>

                        {/* Footer / Actions */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                            {/* Track Link */}
                            <Link to="/track" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Truck size={16} /> Track
                            </Link>

                            {/* Cancel Action */}
                            {(order.status === 'pending' || order.status === 'processing') && (
                                <button 
                                    onClick={() => {
                                        if(window.confirm("Are you sure you want to cancel this order?")) {
                                            cancelOrder(order.id);
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-100 flex items-center gap-2"
                                >
                                    <XCircle size={16} /> Cancel Order
                                </button>
                            )}

                            {/* Return Action */}
                            {order.status === 'delivered' && (
                                <button 
                                    onClick={() => setReturnModalOpen(order.id)}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <RefreshCcw size={16} /> Return / Refund
                                </button>
                            )}

                            {/* Status Helpers */}
                            {order.status === 'returned' && (
                                <div className="text-sm font-bold text-blue-600 flex items-center gap-1">
                                    <CheckCircle size={16} /> Item Returned. Refund pending.
                                </div>
                            )}
                            {order.status === 'refunded' && (
                                <div className="text-sm font-bold text-purple-600 flex items-center gap-1">
                                    <CheckCircle size={16} /> Refund Processed to original source.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Return Modal */}
        {returnModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                    <h3 className="text-xl font-bold font-serif mb-4">Request Return</h3>
                    <p className="text-sm text-gray-500 mb-4">Why do you want to return this order?</p>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none h-32 mb-4"
                        placeholder="e.g. Damaged item, wrong product, didn't like taste..."
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setReturnModalOpen(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={() => handleReturnSubmit(returnModalOpen)} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark">Submit Request</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default MyOrders;
