"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type Pricing = {
  _id: string;
  parcelType: string;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  urgentDeliveryMultiplier: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CalculationResult = {
  basePrice: number;
  distanceCost: number;
  weightCost: number;
  urgentMultiplier: number;
  totalPrice: number;
};

export default function PackagePrice() {
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [selectedPricingId, setSelectedPricingId] = useState<string>("");
  const [selectedPricingType, setSelectedPricingType] = useState<string>("");
  const [weight, setWeight] = useState("");
  const [distance, setDistance] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePricings();
  }, []);

  const fetchActivePricings = async () => {
    try {
      setLoading(true);
      // Fetch only active pricing plans
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing?isActive=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Failed to fetch pricing plans");
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setPricings(data.data);
        
        // Set first pricing as default
        if (data.data.length > 0) {
          setSelectedPricingId(data.data[0]._id);
          setSelectedPricingType(data.data[0].parcelType);
        }
      }
    } catch (error) {
      console.error("Error fetching pricings:", error);
      setError("Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!selectedPricingType) {
      setError("Please select a delivery type");
      return;
    }

    if (!distance || !weight) {
      setError("Please enter distance and weight");
      return;
    }

    if (parseFloat(distance) <= 0 || parseFloat(weight) <= 0) {
      setError("Distance and weight must be greater than 0");
      return;
    }

    try {
      setCalculating(true);
      setError(null);

      // Call the calculate endpoint
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parcelType: selectedPricingType,
          distance: parseFloat(distance),
          weight: parseFloat(weight),
          isUrgent: isUrgent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to calculate price");
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCalculationResult(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error calculating price:", err);
      setError(err.message || "Failed to calculate price. Please try again.");
      setCalculationResult(null);
    } finally {
      setCalculating(false);
    }
  };

  const handlePricingChange = (pricingId: string) => {
    setSelectedPricingId(pricingId);
    const selected = pricings.find(p => p._id === pricingId);
    if (selected) {
      setSelectedPricingType(selected.parcelType);
    }
    // Clear previous calculation
    setCalculationResult(null);
    setError(null);
  };

  // Get display pricing for cards (first 3 active pricings)
  const displayPricings = pricings.slice(0, 3);

  if (loading) {
    return (
      <section className="bg-gradient-to-b py-[10vh] flex flex-col items-center justify-center from-[#111111] to-[#000000] min-h-[50vh]" id="pricing">
        <div className="text-white text-xl">Loading pricing plans...</div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-[#111111] to-[#000000] py-[10vh] flex flex-col items-center justify-center " id="pricing">
      <h2 className="text-[45px] font-bold">Simple, Transparent Pricing</h2>
      <p className="text-[20px] pb-[60px]">No hidden fees. Pay only for what you ship.</p>
      
      {displayPricings.length > 0 ? (
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-[1200px] mx-auto mb-16 px-4">
          {displayPricings.map((pricing, index) => (
            <div 
              key={pricing._id}
              className={`bg-gradient-to-br h-[50vh] flex flex-col items-center justify-center from-[#1a1a1a] to-[#111111] rounded-xl p-8 border-2 border-[#333333] relative transition-all duration-300 ease-in-out text-center ${
                index === 1 ? 'border-[#60a5fa] scale-105 bg-gradient-to-b from-[#FFA00A] to-[#111111]' : ''
              }`}
            >
              {index === 1 && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-semibold text-white text-center mb-4">{pricing.parcelType}</h3>
              <div className="text-center mb-8">
                <span className="text-2xl text-gray-200 align-top">Rs. </span>
                <span className={`text-5xl font-bold ${index === 1 ? 'text-[#101010]' : 'text-[#FFA00A]'}`}>
                  {pricing.basePrice.toFixed(2)}
                </span>
                <span className="text-base text-gray-200 ml-2">base rate</span>
              </div>
              <ul className="space-y-2 mb-4 text-gray-300">
                <li>✓ Real-time tracking</li>
                <li>✓ Package insurance</li>
                <li>✓ Email notifications</li>
                {pricing.urgentDeliveryMultiplier > 1 && (
                  <li>✓ Urgent delivery ({pricing.urgentDeliveryMultiplier}x extra)</li>
                )}
              </ul>
              <div className="mt-auto pt-4 border-t border-[#333333] w-full">
                <p className="text-center text-gray-400 text-sm">
                  + Rs. {pricing.pricePerKm.toFixed(2)}/km
                </p>
                <p className="text-center text-gray-400 text-sm">
                  + Rs. {pricing.pricePerKg.toFixed(2)}/kg
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 mb-16">
          No pricing plans available at the moment.
        </div>
      )}
      
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-xl p-8 border border-[#333333] max-w-[800px] mx-auto w-full">
        <h3 className="text-2xl font-semibold text-white text-center mb-6">Calculate Your Delivery Cost</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            type="number" 
            step="0.01"
            min="0"
            placeholder="Distance (km)" 
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="p-3 border border-[#333333] rounded-md outline-none bg-[#222222] text-white placeholder-gray-500 focus:border-[#FFA00A] transition-colors" 
          />
          <input 
            type="number" 
            step="0.01"
            min="0"
            placeholder="Weight (kg)" 
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="p-3 border border-[#333333] rounded-md outline-none bg-[#222222] text-white placeholder-gray-500 focus:border-[#FFA00A] transition-colors" 
          />
          <select 
            value={selectedPricingId}
            onChange={(e) => handlePricingChange(e.target.value)}
            className="p-3 border border-[#333333] rounded-md outline-none bg-[#222222] text-white focus:border-[#FFA00A] transition-colors"
          >
            {pricings.map((pricing) => (
              <option key={pricing._id} value={pricing._id}>
                {pricing.parcelType}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center mb-4 p-3 bg-[#222222] rounded-md border border-[#333333]">
          <input 
            type="checkbox"
            id="urgentDelivery"
            checked={isUrgent}
            onChange={(e) => {
              setIsUrgent(e.target.checked);
              setCalculationResult(null); // Clear previous calculation
            }}
            className="w-4 h-4 text-[#FFA00A] bg-[#222222] border-gray-600 rounded focus:ring-[#FFA00A]"
          />
          <label htmlFor="urgentDelivery" className="ml-3 text-white text-sm">
            Urgent Delivery (Additional charges apply)
          </label>
        </div>

        <button 
          onClick={calculatePrice}
          disabled={calculating || pricings.length === 0}
          className="w-full px-6 py-3 bg-[#FFA00A] text-black rounded-md font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,160,10,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? 'Calculating...' : 'Calculate Price'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-md">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {calculationResult && (
          <div className="mt-6 p-6 bg-gradient-to-br from-green-900/30 to-blue-900/30 border-2 border-green-500/50 rounded-xl">
            <h4 className="text-lg font-bold text-white mb-4 text-center">Price Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-300">Base Price:</span>
                <span className="font-semibold text-white">Rs. {calculationResult.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-300">Distance Cost ({distance} km):</span>
                <span className="font-semibold text-white">Rs. {calculationResult.distanceCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-300">Weight Cost ({weight} kg):</span>
                <span className="font-semibold text-white">Rs. {calculationResult.weightCost.toFixed(2)}</span>
              </div>
              {calculationResult.urgentMultiplier > 1 && (
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-300">Urgent Multiplier:</span>
                  <span className="font-semibold text-orange-400">{calculationResult.urgentMultiplier}x</span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-600 flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total Price:</span>
                <span className="text-2xl font-bold text-[#FFA00A]">Rs. {calculationResult.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#222222] rounded-md">
              <p className="text-gray-400 text-xs text-center">
                Price calculated for <span className="text-white font-semibold">{selectedPricingType}</span> delivery
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}