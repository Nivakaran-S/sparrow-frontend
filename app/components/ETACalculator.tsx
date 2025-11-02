"use client";
import { useState, useRef, useEffect } from "react";

// Declare Google Maps types
declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

export default function ETACalculator() {
    const [formData, setFormData] = useState({
        fromAddress: "",
        toAddress: "",
        Distance_km: "",
        Courier_Experience_yrs: "",
        Vehicle_Type: "",
        Weather: "",
        Time_of_Day: "",
        Traffic_Level: "",
    });

    const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCalculated, setIsCalculated] = useState(false);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [distanceInfo, setDistanceInfo] = useState<{
        distance: number;
        duration: string;
        durationInTraffic: string;
        route: string;
        trafficLevel: string;
    } | null>(null);

    // Refs for Google Places Autocomplete
    const fromInputRef = useRef<HTMLInputElement>(null);
    const toInputRef = useRef<HTMLInputElement>(null);
    const fromAutocompleteRef = useRef<any>(null);
    const toAutocompleteRef = useRef<any>(null);

    // Load Google Maps API
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google) {
                initializeAutocomplete();
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key={GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                initializeAutocomplete();
            };
            document.head.appendChild(script);
        };

        loadGoogleMapsScript();
    }, []);

    const initializeAutocomplete = () => {
        if (!window.google || !fromInputRef.current || !toInputRef.current) return;

        // Initialize autocomplete for from address
        fromAutocompleteRef.current = new window.google.maps.places.Autocomplete(
            fromInputRef.current,
            { types: ["geocode"] }
        );

        fromAutocompleteRef.current.addListener("place_changed", () => {
            const place = fromAutocompleteRef.current.getPlace();
            setFormData(prev => ({
                ...prev,
                fromAddress: place.formatted_address || place.name
            }));
        });

        // Initialize autocomplete for to address
        toAutocompleteRef.current = new window.google.maps.places.Autocomplete(
            toInputRef.current,
            { types: ["geocode"] }
        );

        toAutocompleteRef.current.addListener("place_changed", () => {
            const place = toAutocompleteRef.current.getPlace();
            setFormData(prev => ({
                ...prev,
                toAddress: place.formatted_address || place.name
            }));
        });
    };

    // Calculate traffic level based on duration difference
    const calculateTrafficLevel = (normalDuration: number, trafficDuration: number): string => {
        const increase = ((trafficDuration - normalDuration) / normalDuration) * 100;

        if (increase < 15) return "Low";
        if (increase < 40) return "Medium";
        return "High";
    };

    const calculateDistance = async () => {
        if (!formData.fromAddress || !formData.toAddress) {
            setError("Please enter both from and to addresses");
            return;
        }

        if (!window.google) {
            setError("Google Maps API not loaded yet. Please try again.");
            return;
        }

        setIsCalculatingDistance(true);
        setError(null);

        try {
            const service = new window.google.maps.DistanceMatrixService();

            // Get current time for traffic data
            const now = new Date();

            const result = await new Promise<any>((resolve, reject) => {
                service.getDistanceMatrix(
                    {
                        origins: [formData.fromAddress],
                        destinations: [formData.toAddress],
                        travelMode: window.google.maps.TravelMode.DRIVING,
                        unitSystem: window.google.maps.UnitSystem.METRIC,
                        drivingOptions: {
                            departureTime: now,
                            trafficModel: window.google.maps.TrafficModel.BEST_GUESS
                        }
                    },
                    (response: any, status: any) => {
                        if (status === "OK") {
                            resolve(response);
                        } else {
                            reject(new Error("Failed to calculate distance"));
                        }
                    }
                );
            });

            const element = result.rows[0].elements[0];

            if (element.status === "OK") {
                const distanceInMeters = element.distance.value;
                const distanceInKm = (distanceInMeters / 1000).toFixed(2);
                const durationText = element.duration.text;
                const durationValue = element.duration.value; // in seconds

                // Get duration in traffic (real-time traffic consideration)
                const durationInTrafficText = element.duration_in_traffic?.text || durationText;
                const durationInTrafficValue = element.duration_in_traffic?.value || durationValue;

                // Calculate traffic level
                const trafficLevel = calculateTrafficLevel(durationValue, durationInTrafficValue);

                setDistanceInfo({
                    distance: parseFloat(distanceInKm),
                    duration: durationText,
                    durationInTraffic: durationInTrafficText,
                    route: `${formData.fromAddress} → ${formData.toAddress}`,
                    trafficLevel: trafficLevel
                });

                // Auto-fill distance and traffic level
                setFormData(prev => ({
                    ...prev,
                    Distance_km: distanceInKm,
                    Traffic_Level: trafficLevel // Auto-fill traffic level
                }));

                setError(null);
            } else {
                throw new Error("Unable to calculate distance for the given addresses");
            }
        } catch (err: any) {
            console.error("Distance calculation error:", err);
            setError(err.message || "Failed to calculate distance");
        } finally {
            setIsCalculatingDistance(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            Vehicle_Type: e.target.value
        }));
    };

    const handleWeatherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            Weather: e.target.value
        }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            Time_of_Day: e.target.value
        }));
    };

    const handleTrafficChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            Traffic_Level: e.target.value
        }));
    };

    const calculateETA = async () => {
        setError(null);
        setIsLoading(true);

        // Validation
        if (!formData.Distance_km) {
            setError("Please calculate the distance first using addresses");
            setIsLoading(false);
            return;
        }

        if (!formData.Courier_Experience_yrs) {
            setError("Please fill in courier experience");
            setIsLoading(false);
            return;
        }

        if (!formData.Vehicle_Type || !formData.Weather || !formData.Time_of_Day || !formData.Traffic_Level) {
            setError("Please select all dropdown options");
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                Distance_km: parseFloat(formData.Distance_km),
                Courier_Experience_yrs: parseFloat(formData.Courier_Experience_yrs),
                Vehicle_Type: formData.Vehicle_Type,
                Weather: formData.Weather,
                Time_of_Day: formData.Time_of_Day,
                Traffic_Level: formData.Traffic_Level,
            };

            console.log("Sending payload:", payload);

            const response = await fetch("https://nivakaran-eta-service.hf.space/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to calculate ETA");
            }

            const data = await response.json();
            console.log("Received response:", data);

            setEstimatedTime(data.predicted_delivery_time);
            setIsCalculated(true);
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.message || "An error occurred while calculating ETA");
            setIsCalculated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const getDeliveryDate = (minutes: number) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        return now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get traffic level color
    const getTrafficColor = (level: string) => {
        switch(level) {
            case "Low": return "text-green-700 bg-green-100";
            case "Medium": return "text-yellow-700 bg-yellow-100";
            case "High": return "text-red-700 bg-red-100";
            default: return "text-gray-700 bg-gray-100";
        }
    };

    return (
        <div className="py-20 px-4 bg-black text-black">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12 text-[#fafafa]">
                    Calculate Your Delivery ETA
                </h2>

                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-lg p-8">
                    <div className="space-y-6">
                        {/* Address Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                📍 Delivery Route
                            </h3>

                            {/* From Address */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Address *
                                </label>
                                <input
                                    ref={fromInputRef}
                                    type="text"
                                    name="fromAddress"
                                    value={formData.fromAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter pickup address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* To Address */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To Address *
                                </label>
                                <input
                                    ref={toInputRef}
                                    type="text"
                                    name="toAddress"
                                    value={formData.toAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter delivery address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            {/* Calculate Distance Button */}
                            <button
                                onClick={calculateDistance}
                                disabled={isCalculatingDistance || !formData.fromAddress || !formData.toAddress}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCalculatingDistance ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Calculating Distance & Traffic...
                                    </span>
                                ) : "Calculate Distance & Traffic"}
                            </button>

                            {/* Distance Info Display */}
                            {distanceInfo && (
                                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-green-800">Distance & Traffic Calculated</p>
                                            <p className="text-lg font-bold text-green-900">{distanceInfo.distance} km</p>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs text-green-700">
                                                    <span className="font-medium">Normal time:</span> {distanceInfo.duration}
                                                </p>
                                                <p className="text-xs text-green-700">
                                                    <span className="font-medium">With current traffic:</span> {distanceInfo.durationInTraffic}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs font-medium text-gray-700">Traffic Level:</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getTrafficColor(distanceInfo.trafficLevel)}`}>
                                                        {distanceInfo.trafficLevel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Distance Display (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Distance (km) *
                            </label>
                            <input
                                type="number"
                                name="Distance_km"
                                value={formData.Distance_km}
                                readOnly
                                placeholder="Distance will be calculated from addresses"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-filled after calculating distance</p>
                        </div>

                        {/* Courier Experience Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Courier Experience (years) *
                            </label>
                            <input
                                type="number"
                                name="Courier_Experience_yrs"
                                value={formData.Courier_Experience_yrs}
                                onChange={handleInputChange}
                                placeholder="Enter courier experience in years"
                                step="0.1"
                                min="0"
                                max="50"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#808080] focus:border-transparent outline-none transition"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum 50 years</p>
                        </div>

                        {/* Vehicle Type Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle Type *
                            </label>
                            <select
                                value={formData.Vehicle_Type}
                                onChange={handleVehicleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#808080] focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="">Select vehicle type</option>
                                <option value="Pickup Truck">Pickup Truck</option>
                                <option value="Scooter">Scooter</option>
                                <option value="Motorcycle">Motorcycle</option>
                            </select>
                        </div>

                        {/* Weather Condition Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weather Condition *
                            </label>
                            <select
                                value={formData.Weather}
                                onChange={handleWeatherChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#808080] focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="">Select weather condition</option>
                                <option value="Sunny">Sunny</option>
                                <option value="Foggy">Foggy</option>
                                <option value="Rainy">Rainy</option>
                                <option value="Snowy">Snowy</option>
                                <option value="Windy">Windy</option>
                            </select>
                        </div>

                        {/* Time of Day Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time of Day *
                            </label>
                            <select
                                value={formData.Time_of_Day}
                                onChange={handleTimeChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#808080] focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="">Select time of day</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                                <option value="Night">Night</option>
                            </select>
                        </div>

                        {/* Traffic Level Dropdown - Now auto-filled but editable */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Traffic Level *
                            </label>
                            <select
                                value={formData.Traffic_Level}
                                onChange={handleTrafficChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#808080] focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="">Select traffic level</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {distanceInfo ? "Auto-filled from real-time traffic (you can change it)" : "Will be auto-filled after calculating distance"}
                            </p>
                        </div>

                        {/* Calculate ETA Button */}
                        <button
                            onClick={calculateETA}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#808080] to-[#606060] text-white py-4 rounded-lg font-semibold hover:from-[#707070] hover:to-[#505050] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Calculating ETA...
                                </span>
                            ) : "Calculate ETA"}
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-6 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg font-semibold text-red-800">
                                            Error
                                        </h3>
                                        <p className="text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success Result */}
                        {isCalculated && estimatedTime !== null && (
                            <div className="mt-6 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                                            🎉 ML-Predicted Delivery Time
                                        </h3>
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <p className="text-4xl font-bold text-green-900">
                                                {estimatedTime.toFixed(0)}
                                            </p>
                                            <p className="text-xl font-semibold text-green-800">
                                                minutes
                                            </p>
                                        </div>
                                        <div className="bg-green-100 rounded-lg p-4 mb-4">
                                            <p className="text-sm font-medium text-green-800 mb-1">
                                                Expected Delivery
                                            </p>
                                            <p className="text-lg font-semibold text-green-900">
                                                {getDeliveryDate(estimatedTime)}
                                            </p>
                                        </div>

                                        {/* Route Info */}
                                        {distanceInfo && (
                                            <div className="bg-blue-100 rounded-lg p-4 mb-4">
                                                <p className="text-sm font-medium text-blue-800 mb-1">
                                                    📍 Route
                                                </p>
                                                <p className="text-sm text-blue-900 break-words">
                                                    {distanceInfo.route}
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-blue-700 font-semibold">
                                                        ML-Predicted: {estimatedTime.toFixed(0)} minutes
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 text-sm text-green-700">
                                            <div className="bg-white bg-opacity-50 rounded p-2">
                                                <span className="font-medium">Distance:</span> {formData.Distance_km} km
                                            </div>
                                            <div className="bg-white bg-opacity-50 rounded p-2">
                                                <span className="font-medium">Experience:</span> {formData.Courier_Experience_yrs} yrs
                                            </div>
                                            <div className="bg-white bg-opacity-50 rounded p-2">
                                                <span className="font-medium">Vehicle:</span> {formData.Vehicle_Type}
                                            </div>
                                            <div className="bg-white bg-opacity-50 rounded p-2">
                                                <span className="font-medium">Weather:</span> {formData.Weather}
                                            </div>
                                            <div className="bg-white bg-opacity-50 rounded p-2">
                                                <span className="font-medium">Time:</span> {formData.Time_of_Day}
                                            </div>
                                            <div className="bg-white bg-opacity-50 rounded p-2 flex items-center gap-2">
                                                <span className="font-medium">Traffic:</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTrafficColor(formData.Traffic_Level)}`}>
                                                    {formData.Traffic_Level}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
