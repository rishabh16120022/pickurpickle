import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Truck, Clock, MapPin, Search } from 'lucide-react';
import { getTrackingDetails } from '../services/shiprocketService';

const TrackOrder = () => {
    const { orders } = useStore();
    const [searchId, setSearchId] = useState('');
    const [foundOrder, setFoundOrder] = useState<any>(null);
    const [trackingTimeline, setTrackingTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        const order = orders.find(o => o.id === searchId || o.shiprocketOrderId === searchId || o.awbCode === searchId);
        
        if (order) {
            setFoundOrder(order);
            setLoading(true);
            const timeline = await getTrackingDetails(order.awbCode || 'dummy');
            setTrackingTimeline(timeline);
            setLoading(false);
        } else {
            alert("Order not found");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-sm mb-6">
                 <h1 className="text-xl font-bold text-gray-900 mb-4">Track Your Order</h1>
                 <form onSubmit={handleTrack} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Enter Order ID / AWB Number" 
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-sm px-4 py-2 text-sm focus:border-primary outline-none"
                        required
                    />
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-sm font-bold text-sm hover:bg-primary-dark uppercase">
                        Track
                    </button>
                 </form>
            </div>

            {foundOrder && (
                <div className="bg-white shadow-sm border border-gray-200 rounded-sm overflow-hidden">
                    <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800">Order ID: {foundOrder.id}</p>
                            <p className="text-xs text-gray-500">Placed: {new Date(foundOrder.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-gray-500 uppercase">AWB</p>
                             <p className="font-bold text-primary">{foundOrder.awbCode || 'Pending'}</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 border-r border-gray-100 pr-4">
                            <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase">Details</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs">Courier</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Truck size={14} className="text-primary" /> {foundOrder.courierName || 'Standard'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Delivery Address</p>
                                    <p className="text-gray-800">{foundOrder.city}, {foundOrder.pincode}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Items</p>
                                    <ul className="list-disc pl-4 text-gray-800">
                                        {foundOrder.items.map((item: any) => (
                                            <li key={item.id}>{item.name} x{item.quantity}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">Shipment Status</h3>
                             {loading ? (
                                <div className="text-center py-8 text-gray-400">Fetching updates...</div>
                            ) : (
                                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                                    {trackingTimeline.map((step, index) => (
                                        <div key={index} className="ml-6 relative">
                                            <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                                                step.status === 'done' || step.status === 'current' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                            }`}></div>
                                            
                                            <div>
                                                <p className={`font-medium ${step.status === 'current' ? 'text-green-600' : 'text-gray-800'}`}>
                                                    {step.activity}
                                                </p>
                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                    <span>{step.date}</span>
                                                    {step.location && <span>• <MapPin size={10} className="inline"/> {step.location}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;