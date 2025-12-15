import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { MapPin, Truck, CheckCircle, AlertCircle, Loader, Lock, CreditCard, Wallet, Banknote, Locate, Ticket } from 'lucide-react';
import { checkServiceability } from '../services/shiprocketService';

const Checkout = () => {
  const { cart, config, placeOrder, user, coupons } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState('');
  
  // Serviceability State
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [shippingDetails, setShippingDetails] = useState<{courier: string, etd: string} | null>(null);
  
  // Geolocation State
  const [detectingLocation, setDetectingLocation] = useState(false);

  const subTotal = cart.reduce((sum, item) => sum + ((item.offerPrice || item.price) * item.quantity), 0);
  
  // Calculate discount
  const discountAmount = appliedCoupon ? Math.round((subTotal * appliedCoupon.discount) / 100) : 0;
  const total = Math.max(0, subTotal - discountAmount);

  const handleApplyCoupon = () => {
      setCouponError('');
      const code = couponCode.trim().toUpperCase();
      if (!code) return;

      const coupon = coupons.find(c => c.code === code && c.isActive);
      if (coupon) {
          setAppliedCoupon({ code: coupon.code, discount: coupon.discountPercent });
          setCouponCode('');
      } else {
          setCouponError('Invalid or expired coupon code');
          setAppliedCoupon(null);
      }
  };

  const applySpecificCoupon = (code: string) => {
    setCouponCode(code);
    const coupon = coupons.find(c => c.code === code && c.isActive);
    if (coupon) {
        setAppliedCoupon({ code: coupon.code, discount: coupon.discountPercent });
        setCouponCode('');
        setCouponError('');
    }
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError('');
  };

  const handlePincodeCheck = async () => {
      if (pincode.length !== 6) return;
      setCheckingPincode(true);
      setServiceable(null);
      setShippingDetails(null);

      const response = await checkServiceability(pincode);
      setCheckingPincode(false);
      setServiceable(response.available);
      if (response.available) {
          setShippingDetails({
              courier: response.courier_name,
              etd: response.etd
          });
      }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          const street = [addr.house_number, addr.road, addr.suburb].filter(Boolean).join(', ');
          const cityVal = addr.city || addr.town || '';
          const pinVal = addr.postcode || '';

          setAddress(street);
          setCity(cityVal);
          setPincode(pinVal);
          
          if (pinVal && pinVal.length === 6) {
             setCheckingPincode(true);
             checkServiceability(pinVal).then(serviceResponse => {
                 setCheckingPincode(false);
                 setServiceable(serviceResponse.available);
                 if (serviceResponse.available) {
                    setShippingDetails({
                        courier: serviceResponse.courier_name,
                        etd: serviceResponse.etd
                    });
                 }
             });
          }
        }
      } catch (error) {
        alert("Could not fetch address details.");
      } finally {
        setDetectingLocation(false);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        alert("Please login to place order");
        navigate('/login');
        return;
    }
    if (serviceable === false) {
        alert("We cannot deliver to this pincode yet.");
        return;
    }
    await placeOrder(address, city, pincode, paymentMethod, discountAmount, appliedCoupon?.code);
    navigate('/track');
  };

  if (cart.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Steps */}
        <div className="md:col-span-2 space-y-4">
            
            {/* 1. Login Step (Completed) */}
            <div className="bg-white p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                        <span className="bg-gray-100 text-gray-500 px-2 text-sm font-bold flex items-center justify-center h-6 w-6 rounded-sm">1</span>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Login</h3>
                            <p className="text-sm font-bold text-black mt-1">{user?.name} <span className="text-gray-500 font-normal">{user?.phone || user?.email}</span></p>
                        </div>
                    </div>
                    <button className="text-primary font-medium text-sm border border-gray-200 px-4 py-1 hover:bg-gray-50">CHANGE</button>
                </div>
            </div>

            {/* 2. Address Step */}
            <div className="bg-white shadow-sm border border-gray-200">
                <div className="bg-primary p-3 flex gap-3">
                     <span className="bg-white text-primary px-2 text-sm font-bold flex items-center justify-center h-6 w-6 rounded-sm">2</span>
                     <h3 className="text-sm font-bold text-white uppercase mt-0.5">Delivery Address</h3>
                </div>
                <div className="p-6">
                    <div className="flex justify-end mb-4">
                        <button 
                            type="button"
                            onClick={detectLocation}
                            disabled={detectingLocation}
                            className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide hover:underline"
                        >
                            {detectingLocation ? <Loader className="animate-spin" size={14} /> : <Locate size={14} />}
                            Use My Current Location
                        </button>
                    </div>

                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Name" className="border p-3 rounded-sm text-sm focus:border-primary outline-none" defaultValue={user?.name} required />
                            <input type="tel" placeholder="10-digit mobile number" className="border p-3 rounded-sm text-sm focus:border-primary outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <input type="text" placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} onBlur={handlePincodeCheck} className="border p-3 rounded-sm text-sm focus:border-primary outline-none" required maxLength={6} />
                             <input type="text" placeholder="Locality" className="border p-3 rounded-sm text-sm focus:border-primary outline-none" required value={city} onChange={e => setCity(e.target.value)} />
                        </div>
                        <textarea placeholder="Address (Area and Street)" value={address} onChange={e => setAddress(e.target.value)} className="w-full border p-3 rounded-sm text-sm focus:border-primary outline-none h-24" required></textarea>
                        
                        {/* Serviceability Message */}
                        {serviceable === true && (
                            <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle size={12} /> Delivery available by {shippingDetails?.courier}
                            </div>
                        )}
                        {serviceable === false && (
                            <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                                <AlertCircle size={12} /> Delivery not available to this pincode
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* 3. Payment Step */}
            <div className="bg-white shadow-sm border border-gray-200">
                 <div className="bg-primary p-3 flex gap-3">
                     <span className="bg-white text-primary px-2 text-sm font-bold flex items-center justify-center h-6 w-6 rounded-sm">3</span>
                     <h3 className="text-sm font-bold text-white uppercase mt-0.5">Payment Options</h3>
                </div>
                <div className="p-6 space-y-4">
                     {config.paymentMethods.upi && (
                        <label className="flex items-center gap-4 cursor-pointer">
                            <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="accent-primary w-4 h-4" />
                            <span className="text-sm text-gray-800">UPI</span>
                        </label>
                     )}
                     {config.paymentMethods.card && (
                        <label className="flex items-center gap-4 cursor-pointer">
                            <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} className="accent-primary w-4 h-4" />
                            <span className="text-sm text-gray-800">Credit / Debit / ATM Card</span>
                        </label>
                     )}
                     {config.paymentMethods.cod && (
                        <label className="flex items-center gap-4 cursor-pointer">
                            <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-primary w-4 h-4" />
                            <span className="text-sm text-gray-800">Cash on Delivery</span>
                        </label>
                     )}
                </div>
            </div>

        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4">
            <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-sm">
                 <h3 className="text-gray-500 font-medium uppercase text-sm border-b pb-3 mb-3">Price Details</h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span>Price ({cart.length} items)</span>
                        <span>₹{subTotal}</span>
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                            <span>Coupon Savings</span>
                            <span>- ₹{discountAmount}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="text-green-600">FREE</span>
                    </div>
                    <div className="border-t border-dashed pt-3 flex justify-between font-bold text-lg">
                        <span>Total Payable</span>
                        <span>₹{total}</span>
                    </div>
                 </div>
            </div>

            {/* Coupons */}
            <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Ticket size={16} className="text-gray-600" />
                    <span className="font-bold text-sm text-gray-800">Coupons</span>
                </div>
                <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="Enter Code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="border p-2 text-sm flex-1 outline-none uppercase font-medium" />
                    <button onClick={handleApplyCoupon} className="text-sm font-bold text-primary">APPLY</button>
                </div>
                {appliedCoupon && <p className="text-xs text-green-600 font-bold">Applied successfully!</p>}
                
                {coupons.length > 0 && (
                    <div className="mt-3 space-y-2">
                         {coupons.filter(c => c.isActive).map(coupon => (
                             <div key={coupon.id} onClick={() => applySpecificCoupon(coupon.code)} className="border border-dashed border-gray-300 p-2 bg-gray-50 text-xs cursor-pointer hover:bg-blue-50">
                                 <span className="font-bold">{coupon.code}</span> - {coupon.description}
                             </div>
                         ))}
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                form="checkout-form"
                disabled={!paymentMethod || serviceable === false}
                className="w-full bg-action text-white py-4 font-bold text-lg shadow-sm hover:shadow-md transition uppercase rounded-sm disabled:bg-gray-400"
            >
                Confirm Order
            </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;