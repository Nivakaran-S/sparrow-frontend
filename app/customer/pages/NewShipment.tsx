"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface PricingType {
  _id: string;
  parcelType: string;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  urgentDeliveryMultiplier: number;
  isActive: boolean;
}

interface TrackShipmentsProps {
  setActiveTab?: (tab: string) => void;
}


const NewShipment = ({ setActiveTab }: TrackShipmentsProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdParcel, setCreatedParcel] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pricingTypes, setPricingTypes] = useState<PricingType[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  
  const [shipmentData, setShipmentData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    pricingId: "",
    weight: "",
    weightUnit: "kg",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    description: "",
    value: "",
    specialInstructions: "",
    paymentMethod: "credit_card",
    distance: "10",
    isUrgent: false
  });

  useEffect(() => {
    fetchPricingTypes();
  }, []);

  useEffect(() => {
    if (shipmentData.pricingId && shipmentData.weight && shipmentData.distance) {
      calculatePrice();
    }
  }, [shipmentData.pricingId, shipmentData.weight, shipmentData.distance, shipmentData.isUrgent]);

  const fetchPricingTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing?isActive=true`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setPricingTypes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pricing types:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const calculatePrice = async () => {
    try {
      const selectedPricing = pricingTypes.find(p => p._id === shipmentData.pricingId);
      if (!selectedPricing) return;

      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing/calculate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parcelType: selectedPricing.parcelType,
          distance: parseFloat(shipmentData.distance),
          weight: parseFloat(shipmentData.weight),
          isUrgent: shipmentData.isUrgent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCalculatedPrice(data.data.totalPrice);
      }
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setShipmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateTrackingNumber = () => {
    return 'TRK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const trackingNumber = generateTrackingNumber();
      const parcelPayload = {
        trackingNumber,
        pricingId: shipmentData.pricingId,
        weight: {
          value: parseFloat(shipmentData.weight),
          unit: shipmentData.weightUnit
        },
        dimensions: {
          length: parseFloat(shipmentData.length),
          width: parseFloat(shipmentData.width),
          height: parseFloat(shipmentData.height),
          unit: shipmentData.dimensionUnit
        },
        sender: {
          name: shipmentData.senderName,
          phoneNumber: shipmentData.senderPhone,
          email: shipmentData.senderEmail,
          address: shipmentData.senderAddress
        },
        receiver: {
          name: shipmentData.receiverName,
          phoneNumber: shipmentData.receiverPhone,
          email: shipmentData.receiverEmail,
          address: shipmentData.receiverAddress
        },
        status: "created"
      };

      const response = await fetch(`${API_BASE_URL}/api/parcels/api/parcels`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parcelPayload)
      });

      if (response.ok) {
        const result = await response.json();
        setCreatedParcel(result.data);
        setStep(5);
        setLoading(false);
      } else {
        const error = await response.json();
        alert(`Failed to create shipment: ${error.message || 'Unknown error'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Error creating shipment. Please try again.');
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${year}${month}${day}-${random}`;
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    try {
      const userResponse = await fetch(`${API_BASE_URL}/check-cookie`, {
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        alert('Please login to complete payment');
        setPaymentProcessing(false);
        return;
      }

      const userData = await userResponse.json();
      const shippingCost = calculatedPrice;

      const paymentPayload = {
        user: userData.id,
        parcels: [createdParcel._id],
        amount: shippingCost,
        paymentMethod: shipmentData.paymentMethod,
        paymentStatus: "successful"
      };

      const paymentResponse = await fetch(`${API_BASE_URL}/api/parcels/api/payment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload)
      });

      if (paymentResponse.ok) {
        const paymentResult = await paymentResponse.json();
        
        const selectedPricing = pricingTypes.find(p => p._id === shipmentData.pricingId);
        const invoicePayload = {
          invoiceNumber: generateInvoiceNumber(),
          user: userData.id,
          payment: paymentResult.data._id,
          parcels: [createdParcel._id],
          items: [
            {
              description: `Parcel Shipping - ${selectedPricing?.parcelType} (${shipmentData.weight} ${shipmentData.weightUnit})`,
              quantity: 1,
              unitPrice: shippingCost,
              total: shippingCost
            }
          ],
          subtotal: shippingCost,
          tax: 0,
          serviceFee: 0,
          discount: 0,
          totalAmount: shippingCost,
          issueDate: new Date().toISOString(),
          status: "paid"
        };

        const invoiceResponse = await fetch(`${API_BASE_URL}/api/parcels/api/invoice`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoicePayload)
        });

        if (invoiceResponse.ok) {
          const invoiceResult = await invoiceResponse.json();
          alert(`Payment successful! Your shipment has been created.\n\nTracking Number: ${createdParcel.trackingNumber}\nPayment ID: ${paymentResult.data._id}\nInvoice Number: ${invoiceResult.data.invoiceNumber}`);
        } else {
          console.error('Invoice creation failed, but payment was successful');
          alert(`Payment successful! Your shipment has been created.\n\nTracking Number: ${createdParcel.trackingNumber}\nPayment ID: ${paymentResult.data._id}\n\nNote: Invoice generation pending.`);
        }
        
        setShipmentData({
          senderName: "",
          senderPhone: "",
          senderEmail: "",
          senderAddress: "",
          receiverName: "",
          receiverPhone: "",
          receiverEmail: "",
          receiverAddress: "",
          pricingId: "",
          weight: "",
          weightUnit: "kg",
          length: "",
          width: "",
          height: "",
          dimensionUnit: "cm",
          description: "",
          value: "",
          specialInstructions: "",
          paymentMethod: "credit_card",
          distance: "10",
          isUrgent: false
        });
        setCreatedParcel(null);
        setCalculatedPrice(0);
        setStep(1);
      } else {
        const error = await paymentResponse.json();
        alert(`Payment failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return shipmentData.senderName && shipmentData.senderPhone && shipmentData.senderAddress;
      case 2:
        return shipmentData.receiverName && shipmentData.receiverPhone && shipmentData.receiverAddress;
      case 3:
        return shipmentData.pricingId && shipmentData.weight && shipmentData.length && shipmentData.width && shipmentData.height && shipmentData.distance;
      default:
        return true;
    }
  };

  return (
    <div className="text-white flex flex-col items-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create New Shipment</h2>
        <p className="text-gray-400">Fill in the details to create a new parcel shipment</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
                step >= s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'
              }`}>
                {s}
              </div>
              {s < 5 && (
                <div className={`h-1 w-12 md:w-24 mx-2 ${
                  step > s ? 'bg-blue-600' : 'bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between w-[42vw] mt-2 text-sm">
          <span className={step >= 1 ? 'text-blue-400' : 'text-gray-500'}>Sender</span>
          <span className={step >= 2 ? 'text-blue-400' : 'text-gray-500'}>Receiver</span>
          <span className={step >= 3 ? 'text-blue-400' : 'text-gray-500'}>Parcel</span>
          <span className={step >= 4 ? 'text-blue-400' : 'text-gray-500'}>Review</span>
          <span className={step >= 5 ? 'text-blue-400' : 'text-gray-500'}>Payment</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 w-3xl">
        {/* Step 1: Sender Information */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Sender Information</h3>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={shipmentData.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={shipmentData.senderPhone}
                  onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={shipmentData.senderEmail}
                  onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Address *</label>
              <textarea
                value={shipmentData.senderAddress}
                onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
          </div>
        )}

        {/* Step 2: Receiver Information */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Receiver Information</h3>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={shipmentData.receiverName}
                onChange={(e) => handleInputChange('receiverName', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Jane Smith"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={shipmentData.receiverPhone}
                  onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={shipmentData.receiverEmail}
                  onChange={(e) => handleInputChange('receiverEmail', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Address *</label>
              <textarea
                value={shipmentData.receiverAddress}
                onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="456 Oak Ave, City, State, ZIP"
              />
            </div>
          </div>
        )}

        {/* Step 3: Parcel Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Parcel Details</h3>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Parcel Type *</label>
              {loadingPricing ? (
                <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                  Loading pricing types...
                </div>
              ) : (
                <select
                  value={shipmentData.pricingId}
                  onChange={(e) => handleInputChange('pricingId', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select parcel type</option>
                  {pricingTypes.map((pricing) => (
                    <option key={pricing._id} value={pricing._id}>
                      {pricing.parcelType} - Base: Rs.{pricing.basePrice} | Per Km: Rs.{pricing.pricePerKm} | Per Kg: Rs.{pricing.pricePerKg}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Weight *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={shipmentData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="0.00"
                  />
                  <select
                    value={shipmentData.weightUnit}
                    onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Distance (km) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={shipmentData.distance}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Dimensions *</label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  step="0.01"
                  value={shipmentData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Length"
                />
                <input
                  type="number"
                  step="0.01"
                  value={shipmentData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Width"
                />
                <input
                  type="number"
                  step="0.01"
                  value={shipmentData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Height"
                />
              </div>
              <select
                value={shipmentData.dimensionUnit}
                onChange={(e) => handleInputChange('dimensionUnit', e.target.value)}
                className="mt-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <input
                type="checkbox"
                id="isUrgent"
                checked={shipmentData.isUrgent}
                onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <label htmlFor="isUrgent" className="text-white font-medium cursor-pointer">
                Urgent Delivery (Additional charges apply)
              </label>
            </div>

            {calculatedPrice > 0 && (
              <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Estimated Shipping Cost:</span>
                  <span className="text-2xl font-bold text-blue-400">Rs. {calculatedPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
              <textarea
                value={shipmentData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Describe the contents"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Special Instructions</label>
              <textarea
                value={shipmentData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Any special handling instructions"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Review Shipment</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-blue-400 font-semibold mb-3">Sender</h4>
                <p className="text-white">{shipmentData.senderName}</p>
                <p className="text-gray-400 text-sm">{shipmentData.senderPhone}</p>
                <p className="text-gray-400 text-sm">{shipmentData.senderEmail}</p>
                <p className="text-gray-400 text-sm">{shipmentData.senderAddress}</p>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-blue-400 font-semibold mb-3">Receiver</h4>
                <p className="text-white">{shipmentData.receiverName}</p>
                <p className="text-gray-400 text-sm">{shipmentData.receiverPhone}</p>
                <p className="text-gray-400 text-sm">{shipmentData.receiverEmail}</p>
                <p className="text-gray-400 text-sm">{shipmentData.receiverAddress}</p>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-blue-400 font-semibold mb-3">Parcel Details</h4>
                <p className="text-white">Type: {pricingTypes.find(p => p._id === shipmentData.pricingId)?.parcelType}</p>
                <p className="text-white">Weight: {shipmentData.weight} {shipmentData.weightUnit}</p>
                <p className="text-white">Dimensions: {shipmentData.length} x {shipmentData.width} x {shipmentData.height} {shipmentData.dimensionUnit}</p>
                <p className="text-white">Distance: {shipmentData.distance} km</p>
                {shipmentData.isUrgent && (
                  <p className="text-yellow-400 font-semibold mt-2">⚡ Urgent Delivery</p>
                )}
                {shipmentData.description && (
                  <p className="text-gray-400 text-sm mt-2">Description: {shipmentData.description}</p>
                )}
              </div>

              <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Estimated Shipping Cost:</span>
                  <span className="text-2xl font-bold text-green-400">Rs. {calculatedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Payment</h3>
            
            <div className="bg-blue-900/20 border border-blue-700 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg text-gray-300">Total Amount:</span>
                <span className="text-3xl font-bold text-blue-400">Rs. {calculatedPrice.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-400">Tracking Number: {createdParcel?.trackingNumber}</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Payment Method *</label>
              <select
                value={shipmentData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {shipmentData.paymentMethod === 'credit_card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded-lg">
              <p className="text-sm text-yellow-400">
                <strong>Note:</strong> This is a demo payment system. In production, integrate with a secure payment gateway like Stripe or PayPal.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
          {step > 1 && step < 5 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Previous
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : step === 4 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Shipment...' : 'Proceed to Payment'}
            </button>
          ) : (
            <button
              onClick={handlePayment}
              disabled={paymentProcessing}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentProcessing ? 'Processing Payment...' : 'Complete Payment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewShipment;
