"use client";
import { useState, useEffect } from "react";
import { 
  Truck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  MapPin, 
  Package, 
  User,
  Calendar,
  ChevronDown,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Layers,
  Eye,
  RefreshCw,
  Navigation,
  Zap
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDclUQazAMvwp52Kr91LM-yOPoY9-z7q18";
const ETA_PREDICTION_API = process.env.NEXT_PUBLIC_ETA_PREDICTION_API || "https://nivakaran-eta-service.hf.space";
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "eca50f9fca8dff48998f311ce5c18737";

interface Delivery {
  _id: string;
  deliveryNumber: string;
  deliveryItemType: "parcel" | "consolidation";
  parcels: any[];
  consolidation?: {
    _id: string;
    masterTrackingNumber: string;
    referenceCode: string;
    parcels: any[];
  };
  assignedDriver: {
    _id: string;
    userName: string;
    entityId: string;
  };
  assignedBy: {
    _id: string;
    userName: string;
  };
  fromLocation: {
    type: string;
    warehouseId?: any;
    address?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  toLocation: {
    type: string;
    warehouseId?: any;
    address?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryType: string;
  status: string;
  priority: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  deliveryInstructions?: string;
  notes?: string;
}

interface Driver {
  _id: string;
  userName: string;
  entityId: string;
}

interface Warehouse {
  _id: string;
  name: string;
  code: string;
  address: {
    _id: string;
    locationNumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface Parcel {
  _id: string;
  trackingNumber: string;
  status: string;
  warehouseId?: any;
  consolidationId?: any;
  receiver?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  };
  sender?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  };
}

interface Consolidation {
  _id: string;
  masterTrackingNumber: string;
  referenceCode: string;
  status: string;
  parcels: any[];
  warehouseId?: any;
}

export default function DeliveryManagement({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [consolidations, setConsolidations] = useState<Consolidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isGeocodingFrom, setIsGeocodingFrom] = useState(false);
  const [isGeocodingTo, setIsGeocodingTo] = useState(false);
  const [isPredictingETA, setIsPredictingETA] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [predictedETA, setPredictedETA] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    deliveryItemType: "parcel" as "parcel" | "consolidation",
    parcels: [] as string[],
    consolidation: "",
    assignedDriver: "",
    fromLocationType: "warehouse",
    fromWarehouseId: "",
    fromAddress: "",
    fromLatitude: "",
    fromLongitude: "",
    fromLocationName: "",
    toLocationType: "address",
    toWarehouseId: "",
    toAddress: "",
    toLatitude: "",
    toLongitude: "",
    toLocationName: "",
    priority: "normal",
    estimatedDeliveryTime: "",
    deliveryInstructions: "",
    notes: "",
    vehicleType: "Scooter",
    courierExperience: "2"
  });

  // Validate delivery route based on backend rules
  const validateDeliveryRoute = () => {
    const { fromLocationType, toLocationType } = formData;
    
    if (fromLocationType === 'address' && toLocationType === 'address') {
      return {
        isValid: false,
        message: "Direct address-to-address delivery is not allowed. Please select at least one warehouse location."
      };
    }
    
    return { isValid: true, message: "" };
  };

  // Format warehouse address for display
  const formatWarehouseAddress = (warehouse: Warehouse): string => {
    const addr = warehouse.address;
    const parts = [];
    
    if (addr.locationNumber) parts.push(addr.locationNumber);
    if (addr.street) parts.push(addr.street);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.postalCode) parts.push(addr.postalCode);
    if (addr.country) parts.push(addr.country);
    
    return parts.join(', ') || 'Address not available';
  };

  // Handle warehouse selection for FROM location
  const handleFromWarehouseChange = (warehouseId: string) => {
    const selectedWarehouse = warehouses.find(w => w._id === warehouseId);
    
    if (selectedWarehouse && selectedWarehouse.address) {
      const addr = selectedWarehouse.address;
      setFormData(prev => ({
        ...prev,
        fromWarehouseId: warehouseId,
        fromAddress: formatWarehouseAddress(selectedWarehouse),
        fromLatitude: addr.latitude ? addr.latitude.toString() : "",
        fromLongitude: addr.longitude ? addr.longitude.toString() : "",
        fromLocationName: selectedWarehouse.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        fromWarehouseId: warehouseId,
        fromAddress: "",
        fromLatitude: "",
        fromLongitude: "",
        fromLocationName: ""
      }));
    }
  };

  // Handle warehouse selection for TO location
  const handleToWarehouseChange = (warehouseId: string) => {
    const selectedWarehouse = warehouses.find(w => w._id === warehouseId);
    
    if (selectedWarehouse && selectedWarehouse.address) {
      const addr = selectedWarehouse.address;
      setFormData(prev => ({
        ...prev,
        toWarehouseId: warehouseId,
        toAddress: formatWarehouseAddress(selectedWarehouse),
        toLatitude: addr.latitude ? addr.latitude.toString() : "",
        toLongitude: addr.longitude ? addr.longitude.toString() : "",
        toLocationName: selectedWarehouse.name
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        toWarehouseId: warehouseId,
        toAddress: "",
        toLatitude: "",
        toLongitude: "",
        toLocationName: ""
      }));
    }
  };

  // Geocoding function
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> => {
    if (!address.trim()) {
      alert("Please enter an address first");
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address
        };
      } else if (data.status === "ZERO_RESULTS") {
        alert("No results found for this address. Please check and try again.");
        return null;
      } else if (data.status === "REQUEST_DENIED") {
        alert("Geocoding request denied. Please check your API key configuration.");
        return null;
      } else {
        alert(`Geocoding failed: ${data.status}`);
        return null;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Failed to fetch coordinates. Please check your internet connection.");
      return null;
    }
  };

  // Calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get traffic data
  const getTrafficData = async (fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLat},${fromLng}&destinations=${toLat},${toLng}&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.rows && data.rows[0].elements && data.rows[0].elements[0].status === "OK") {
        const duration = data.rows[0].elements[0].duration.value;
        const durationInTraffic = data.rows[0].elements[0].duration_in_traffic?.value || duration;
        
        const trafficRatio = durationInTraffic / duration;
        
        if (trafficRatio < 1.2) return "Low";
        else if (trafficRatio < 1.5) return "Medium";
        else return "High";
      }
      
      return "Medium";
    } catch (error) {
      console.error("Traffic data error:", error);
      return "Medium";
    }
  };

  // Get weather data
  const getWeatherData = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.weather && data.weather.length > 0) {
        const mainWeather = data.weather[0].main.toLowerCase();
        
        if (mainWeather.includes('rain') || mainWeather.includes('drizzle')) return "Rainy";
        if (mainWeather.includes('snow')) return "Snowy";
        if (mainWeather.includes('fog') || mainWeather.includes('mist') || mainWeather.includes('haze')) return "Foggy";
        if (data.wind?.speed > 10) return "Windy";
        return "Clear";
      }
      
      return "Clear";
    } catch (error) {
      console.error("Weather data error:", error);
      return "Clear";
    }
  };

  // Get time of day
  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  // Predict ETA
  const predictETA = async () => {
    if (!formData.assignedDriver) {
      alert("Please select a driver first");
      return;
    }

    const routeValidation = validateDeliveryRoute();
    if (!routeValidation.isValid) {
      alert(routeValidation.message);
      return;
    }

    let fromLat: number, fromLng: number, toLat: number, toLng: number;

    // Get FROM coordinates
    fromLat = parseFloat(formData.fromLatitude);
    fromLng = parseFloat(formData.fromLongitude);
    if (isNaN(fromLat) || isNaN(fromLng)) {
      alert("Please provide valid 'From' location coordinates");
      return;
    }

    // Get TO coordinates
    toLat = parseFloat(formData.toLatitude);
    toLng = parseFloat(formData.toLongitude);
    if (isNaN(toLat) || isNaN(toLng)) {
      alert("Please provide valid 'To' location coordinates");
      return;
    }

    setIsPredictingETA(true);

    try {
      const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
      const trafficLevel = await getTrafficData(fromLat, fromLng, toLat, toLng);
      const midLat = (fromLat + toLat) / 2;
      const midLng = (fromLng + toLng) / 2;
      const weather = await getWeatherData(midLat, midLng);
      const timeOfDay = getTimeOfDay();
      const courierExperience = parseFloat(formData.courierExperience) || 2;

      const features = {
        Distance_km: distance,
        Courier_Experience_yrs: courierExperience,
        Vehicle_Type_Pickup_Truck: formData.vehicleType === "Pickup Truck" ? 1 : 0,
        Vehicle_Type_Scooter: formData.vehicleType === "Scooter" ? 1 : 0,
        Weather_Foggy: weather === "Foggy" ? 1 : 0,
        Weather_Rainy: weather === "Rainy" ? 1 : 0,
        Weather_Snowy: weather === "Snowy" ? 1 : 0,
        Weather_Windy: weather === "Windy" ? 1 : 0,
        Time_of_Day_Evening: timeOfDay === "Evening" ? 1 : 0,
        Time_of_Day_Morning: timeOfDay === "Morning" ? 1 : 0,
        Time_of_Day_Night: timeOfDay === "Night" ? 1 : 0,
        Traffic_Level_Low: trafficLevel === "Low" ? 1 : 0,
        Traffic_Level_Medium: trafficLevel === "Medium" ? 1 : 0
      };

      console.log("Prediction features:", features);

      const response = await fetch(`${ETA_PREDICTION_API}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features)
      });

      if (!response.ok) {
        throw new Error(`Prediction API returned status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.predicted_delivery_time) {
        const predictedMinutes = result.predicted_delivery_time;
        setPredictedETA(predictedMinutes);
        
        const now = new Date();
        const estimatedTime = new Date(now.getTime() + predictedMinutes * 60000);
        const formattedTime = estimatedTime.toISOString().slice(0, 16);
        
        setFormData(prev => ({
          ...prev,
          estimatedDeliveryTime: formattedTime
        }));

        alert(`Predicted ETA: ${Math.round(predictedMinutes)} minutes\n\nEstimated delivery: ${estimatedTime.toLocaleString()}\n\nDetails:\n- Distance: ${distance.toFixed(2)} km\n- Traffic: ${trafficLevel}\n- Weather: ${weather}\n- Time: ${timeOfDay}`);
      } else {
        throw new Error("No prediction returned from API");
      }

    } catch (error) {
      console.error("ETA prediction error:", error);
      alert("Failed to predict ETA. Please check the console for details.");
    } finally {
      setIsPredictingETA(false);
    }
  };

  const handleGeocodeFromAddress = async () => {
    if (!formData.fromAddress) {
      alert("Please enter a \"From\" address first");
      return;
    }

    setIsGeocodingFrom(true);
    const result = await geocodeAddress(formData.fromAddress);
    setIsGeocodingFrom(false);

    if (result) {
      setFormData(prev => ({
        ...prev,
        fromLatitude: result.lat.toString(),
        fromLongitude: result.lng.toString(),
        fromAddress: result.formattedAddress
      }));
    }
  };

  const handleGeocodeToAddress = async () => {
    if (!formData.toAddress) {
      alert("Please enter a \"To\" address first");
      return;
    }

    setIsGeocodingTo(true);
    const result = await geocodeAddress(formData.toAddress);
    setIsGeocodingTo(false);

    if (result) {
      setFormData(prev => ({
        ...prev,
        toLatitude: result.lat.toString(),
        toLongitude: result.lng.toString(),
        toAddress: result.formattedAddress
      }));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [searchTerm, statusFilter, typeFilter, priorityFilter, itemTypeFilter, deliveries]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchDeliveries(),
        fetchDrivers(),
        fetchWarehouses(),
        fetchParcels(),
        fetchConsolidations()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/users?role=Driver`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/warehouses/warehouses`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchParcels = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/parcels`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const allParcels = data.data || [];
        const availableParcels = allParcels.filter((p: any) => 
          p.status !== 'delivered' && p.status !== 'cancelled'
        );
        setParcels(availableParcels);
      }
    } catch (error) {
      console.error("Error fetching parcels:", error);
    }
  };

  const fetchConsolidations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/consolidations/api/consolidations`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const allConsolidations = data.data || [];
        const availableConsolidations = allConsolidations.filter((c: any) => 
          c.status !== 'delivered' && c.status !== 'cancelled'
        );
        setConsolidations(availableConsolidations);
      }
    } catch (error) {
      console.error("Error fetching consolidations:", error);
    }
  };

  const handleParcelSelection = async (parcelId: string, isChecked: boolean) => {
    let updatedParcels: string[];
    
    if (isChecked) {
      updatedParcels = [...formData.parcels, parcelId];
    } else {
      updatedParcels = formData.parcels.filter(id => id !== parcelId);
    }

    setFormData({ ...formData, parcels: updatedParcels });

    if (isChecked && updatedParcels.length === 1) {
      const selectedParcel = parcels.find(p => p._id === parcelId);
      if (selectedParcel) {
        await autoFillFromParcel(selectedParcel);
      }
    }
  };

  const autoFillFromParcel = async (parcel: any) => {
    const updates: any = {};

    if (parcel.warehouseId) {
      updates.fromLocationType = "warehouse";
      const warehouseId = parcel.warehouseId._id || parcel.warehouseId;
      updates.fromWarehouseId = warehouseId;
      handleFromWarehouseChange(warehouseId);
    }

    if (parcel.receiver?.address) {
      updates.toLocationType = "address";
      updates.toAddress = parcel.receiver.address;
      updates.toLocationName = parcel.receiver.name || "";
      
      const result = await geocodeAddress(parcel.receiver.address);
      if (result) {
        updates.toLatitude = result.lat.toString();
        updates.toLongitude = result.lng.toString();
        updates.toAddress = result.formattedAddress;
      }
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleConsolidationSelection = async (consolidationId: string) => {
    setFormData({ ...formData, consolidation: consolidationId });

    if (consolidationId) {
      const selectedConsolidation = consolidations.find(c => c._id === consolidationId);
      if (selectedConsolidation) {
        await autoFillFromConsolidation(selectedConsolidation);
      }
    }
  };

  const autoFillFromConsolidation = async (consolidation: any) => {
    const updates: any = {};

    if (consolidation.warehouseId) {
      updates.fromLocationType = "warehouse";
      const warehouseId = consolidation.warehouseId._id || consolidation.warehouseId;
      updates.fromWarehouseId = warehouseId;
      handleFromWarehouseChange(warehouseId);
    }

    if (consolidation.parcels && consolidation.parcels.length > 0) {
      const firstParcel = consolidation.parcels[0];
      if (firstParcel.receiver?.address) {
        updates.toLocationType = "address";
        updates.toAddress = firstParcel.receiver.address;
        updates.toLocationName = firstParcel.receiver.name || "";
        
        const result = await geocodeAddress(firstParcel.receiver.address);
        if (result) {
          updates.toLatitude = result.lat.toString();
          updates.toLongitude = result.lng.toString();
          updates.toAddress = result.formattedAddress;
        }
      }
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  const filterDeliveries = () => {
    let filtered = [...deliveries];

    if (searchTerm) {
      filtered = filtered.filter(delivery => 
        delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.assignedDriver?.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.parcels.some(p => p.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        delivery.consolidation?.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.deliveryType === typeFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.priority === priorityFilter);
    }

    if (itemTypeFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.deliveryItemType === itemTypeFilter);
    }

    setFilteredDeliveries(filtered);
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    const routeValidation = validateDeliveryRoute();
    if (!routeValidation.isValid) {
      alert(routeValidation.message);
      return;
    }

    const deliveryData: any = {
      deliveryItemType: formData.deliveryItemType,
      assignedDriver: formData.assignedDriver,
      assignedBy: userId,
      fromLocation: {
        type: formData.fromLocationType,
      },
      toLocation: {
        type: formData.toLocationType,
      },
      priority: formData.priority,
      deliveryInstructions: formData.deliveryInstructions,
      notes: formData.notes
    };

    if (formData.deliveryItemType === "parcel") {
      if (formData.parcels.length === 0) {
        alert("Please select at least one parcel");
        return;
      }
      deliveryData.parcels = formData.parcels;
    } else {
      if (!formData.consolidation) {
        alert("Please select a consolidation");
        return;
      }
      deliveryData.consolidation = formData.consolidation;
    }

    if (formData.fromLocationType === "warehouse") {
      if (!formData.fromWarehouseId) {
        alert("Please select a 'From' warehouse");
        return;
      }
      deliveryData.fromLocation.warehouseId = formData.fromWarehouseId;
    } else {
      if (!formData.fromAddress || !formData.fromLatitude || !formData.fromLongitude) {
        alert("Please provide complete 'From' address information including coordinates");
        return;
      }
      deliveryData.fromLocation.address = formData.fromAddress;
      deliveryData.fromLocation.latitude = parseFloat(formData.fromLatitude);
      deliveryData.fromLocation.longitude = parseFloat(formData.fromLongitude);
      deliveryData.fromLocation.locationName = formData.fromLocationName;
    }

    if (formData.toLocationType === "warehouse") {
      if (!formData.toWarehouseId) {
        alert("Please select a 'To' warehouse");
        return;
      }
      deliveryData.toLocation.warehouseId = formData.toWarehouseId;
    } else {
      if (!formData.toAddress || !formData.toLatitude || !formData.toLongitude) {
        alert("Please provide complete 'To' address information including coordinates");
        return;
      }
      deliveryData.toLocation.address = formData.toAddress;
      deliveryData.toLocation.latitude = parseFloat(formData.toLatitude);
      deliveryData.toLocation.longitude = parseFloat(formData.toLongitude);
      deliveryData.toLocation.locationName = formData.toLocationName;
    }

    if (formData.estimatedDeliveryTime) {
      deliveryData.estimatedDeliveryTime = formData.estimatedDeliveryTime;
    }

    console.log("Sending delivery data:", deliveryData);

    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(deliveryData)
      });

      if (res.ok) {
        await fetchAllData();
        setShowCreateModal(false);
        resetForm();
        alert("Delivery created successfully!");
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
      alert("Failed to create delivery");
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, note: `Status updated to ${newStatus}` })
      });

      if (res.ok) {
        await fetchAllData();
        alert("Status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleDeleteDelivery = async () => {
    if (!selectedDelivery) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries/${selectedDelivery._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        await fetchAllData();
        setShowDeleteModal(false);
        setSelectedDelivery(null);
        alert("Delivery deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting delivery:", error);
      alert("Failed to delete delivery");
    }
  };

  const resetForm = () => {
    setFormData({
      deliveryItemType: "parcel",
      parcels: [],
      consolidation: "",
      assignedDriver: "",
      fromLocationType: "warehouse",
      fromWarehouseId: "",
      fromAddress: "",
      fromLatitude: "",
      fromLongitude: "",
      fromLocationName: "",
      toLocationType: "address",
      toWarehouseId: "",
      toAddress: "",
      toLatitude: "",
      toLongitude: "",
      toLocationName: "",
      priority: "normal",
      estimatedDeliveryTime: "",
      deliveryInstructions: "",
      notes: "",
      vehicleType: "Scooter",
      courierExperience: "2"
    });
    setPredictedETA(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "in_transit": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "delivered": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "failed": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "cancelled": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "normal": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "low": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "in_transit": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "failed": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Delivery Management</h1>
              <p className="text-gray-400">Manage and track all deliveries</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Delivery
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by delivery number, driver, tracking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Item Type</label>
                <select
                  value={itemTypeFilter}
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="parcel">Parcel</option>
                  <option value="consolidation">Consolidation</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Delivery Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="address_to_warehouse">Address → Warehouse</option>
                  <option value="warehouse_to_warehouse">Warehouse → Warehouse</option>
                  <option value="warehouse_to_address">Warehouse → Address</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400">Total Deliveries</p>
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{deliveries.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400">Pending</p>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400">In Transit</p>
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {deliveries.filter(d => d.status === 'in_transit' || d.status === 'picked_up').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400">Delivered</p>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {deliveries.filter(d => d.status === 'delivered').length}
            </p>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Delivery Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg mb-2">No deliveries found</p>
                        <p className="text-gray-500">Create a new delivery to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <tr key={delivery._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            {delivery.deliveryItemType === 'parcel' ? (
                              <Package className="w-5 h-5 text-blue-400" />
                            ) : (
                              <Layers className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{delivery.deliveryNumber}</p>
                            <p className="text-gray-400 text-sm">
                              {delivery.deliveryItemType === 'parcel' 
                                ? `${delivery.parcels.length} parcel(s)` 
                                : 'Consolidation'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{delivery.assignedDriver?.userName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3 h-3 text-green-400" />
                            <span className="text-gray-300">
                              {delivery.fromLocation.type === 'warehouse' 
                                ? delivery.fromLocation.warehouseId?.name || 'Warehouse'
                                : delivery.fromLocation.locationName || 'Custom Location'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3 h-3 text-red-400" />
                            <span className="text-gray-300">
                              {delivery.toLocation.type === 'warehouse' 
                                ? delivery.toLocation.warehouseId?.name || 'Warehouse'
                                : delivery.toLocation.locationName || 'Custom Location'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                          {getStatusIcon(delivery.status)}
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(delivery.priority)}`}>
                          {delivery.priority.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(delivery.createdTimestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                const newStatus = delivery.status === 'assigned' || delivery.status === 'pending' ? 'in_transit' : 'delivered';
                                handleUpdateStatus(delivery._id, newStatus);
                              }}
                              className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                              title="Update Status"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Delivery Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">Create New Delivery</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="p-6 space-y-6">
              {/* Route Validation Warning */}
              {formData.fromLocationType === 'address' && formData.toLocationType === 'address' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Invalid Route Configuration</p>
                    <p className="text-red-300 text-sm mt-1">
                      Direct address-to-address delivery is not allowed. Please select at least one warehouse location.
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Item Type Selection */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Delivery Item Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, deliveryItemType: 'parcel', consolidation: '' });
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.deliveryItemType === 'parcel'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <Package className={`w-8 h-8 mx-auto mb-2 ${formData.deliveryItemType === 'parcel' ? 'text-blue-400' : 'text-gray-400'}`} />
                    <p className="text-white font-medium">Parcel(s)</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, deliveryItemType: 'consolidation', parcels: [] });
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.deliveryItemType === 'consolidation'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <Layers className={`w-8 h-8 mx-auto mb-2 ${formData.deliveryItemType === 'consolidation' ? 'text-purple-400' : 'text-gray-400'}`} />
                    <p className="text-white font-medium">Consolidation</p>
                  </button>
                </div>
              </div>

              {/* Parcel Selection */}
              {formData.deliveryItemType === 'parcel' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Select Parcels *</label>
                  <div className="max-h-48 overflow-y-auto bg-gray-900 rounded-lg border border-gray-700 p-4 space-y-2">
                    {parcels.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No available parcels</p>
                    ) : (
                      parcels.map((parcel) => (
                        <label key={parcel._id} className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={formData.parcels.includes(parcel._id)}
                            onChange={(e) => handleParcelSelection(parcel._id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">{parcel.trackingNumber}</p>
                            <p className="text-gray-400 text-sm">{parcel.receiver?.name || 'No receiver'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(parcel.status)}`}>
                            {parcel.status}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Consolidation Selection */}
              {formData.deliveryItemType === 'consolidation' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Select Consolidation *</label>
                  <select
                    required
                    value={formData.consolidation}
                    onChange={(e) => handleConsolidationSelection(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a consolidation</option>
                    {consolidations.map((cons) => (
                      <option key={cons._id} value={cons._id}>
                        {cons.referenceCode} - {cons.parcels.length} parcels
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Driver Selection */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Assigned Driver *</label>
                <select
                  required
                  value={formData.assignedDriver}
                  onChange={(e) => setFormData({ ...formData, assignedDriver: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.userName} ({driver.entityId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Vehicle Type *</label>
                  <select
                    required
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Scooter">Scooter</option>
                    <option value="Pickup Truck">Pickup Truck</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Courier Experience (years) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.courierExperience}
                    onChange={(e) => setFormData({ ...formData, courierExperience: e.target.value })}
                    placeholder="2.0"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* From Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  From Location
                </h3>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Location Type *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fromLocationType: 'warehouse' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.fromLocationType === 'warehouse'
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      Warehouse
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, fromLocationType: 'address' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.fromLocationType === 'address'
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      Custom Address
                    </button>
                  </div>
                </div>

                {formData.fromLocationType === 'warehouse' ? (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Select Warehouse *</label>
                      <select
                        required
                        value={formData.fromWarehouseId}
                        onChange={(e) => handleFromWarehouseChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.fromWarehouseId && formData.fromAddress && (
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-400 text-sm mb-2">Warehouse Address</p>
                        <p className="text-white text-sm">{formData.fromAddress}</p>
                        {formData.fromLatitude && formData.fromLongitude && (
                          <p className="text-gray-400 text-xs mt-2">
                            Coordinates: {formData.fromLatitude}, {formData.fromLongitude}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Address *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={formData.fromAddress}
                          onChange={(e) => setFormData({ ...formData, fromAddress: e.target.value })}
                          placeholder="Enter full address"
                          className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleGeocodeFromAddress}
                          disabled={isGeocodingFrom || !formData.fromAddress}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
                        >
                          {isGeocodingFrom ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              Fetching...
                            </>
                          ) : (
                            <>
                              <Navigation className="w-4 h-4" />
                              Get Coords
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Latitude *</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={formData.fromLatitude}
                          onChange={(e) => setFormData({ ...formData, fromLatitude: e.target.value })}
                          placeholder="6.9271"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Longitude *</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={formData.fromLongitude}
                          onChange={(e) => setFormData({ ...formData, fromLongitude: e.target.value })}
                          placeholder="79.8612"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Location Name</label>
                      <input
                        type="text"
                        value={formData.fromLocationName}
                        onChange={(e) => setFormData({ ...formData, fromLocationName: e.target.value })}
                        placeholder="e.g., Customer Pickup Point"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* To Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  To Location
                </h3>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Location Type *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, toLocationType: 'warehouse' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.toLocationType === 'warehouse'
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      Warehouse
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, toLocationType: 'address' })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.toLocationType === 'address'
                          ? 'border-blue-500 bg-blue-500/20 text-white'
                          : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      Custom Address
                    </button>
                  </div>
                </div>

                {formData.toLocationType === 'warehouse' ? (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Select Warehouse *</label>
                      <select
                        required
                        value={formData.toWarehouseId}
                        onChange={(e) => handleToWarehouseChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.toWarehouseId && formData.toAddress && (
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-400 text-sm mb-2">Warehouse Address</p>
                        <p className="text-white text-sm">{formData.toAddress}</p>
                        {formData.toLatitude && formData.toLongitude && (
                          <p className="text-gray-400 text-xs mt-2">
                            Coordinates: {formData.toLatitude}, {formData.toLongitude}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Address *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={formData.toAddress}
                          onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
                          placeholder="Enter full address"
                          className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleGeocodeToAddress}
                          disabled={isGeocodingTo || !formData.toAddress}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
                        >
                          {isGeocodingTo ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              Fetching...
                            </>
                          ) : (
                            <>
                              <Navigation className="w-4 h-4" />
                              Get Coords
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Latitude *</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={formData.toLatitude}
                          onChange={(e) => setFormData({ ...formData, toLatitude: e.target.value })}
                          placeholder="7.2008"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Longitude *</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={formData.toLongitude}
                          onChange={(e) => setFormData({ ...formData, toLongitude: e.target.value })}
                          placeholder="79.8358"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Location Name</label>
                      <input
                        type="text"
                        value={formData.toLocationName}
                        onChange={(e) => setFormData({ ...formData, toLocationName: e.target.value })}
                        placeholder="e.g., Customer Delivery Point"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* ETA Prediction Button */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      AI-Powered ETA Prediction
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Get intelligent delivery time estimates based on distance, traffic, weather, and more
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={predictETA}
                    disabled={isPredictingETA || (formData.fromLocationType === 'address' && formData.toLocationType === 'address') || !formData.fromLatitude || !formData.fromLongitude || !formData.toLatitude || !formData.toLongitude}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
                  >
                    {isPredictingETA ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Predict ETA
                      </>
                    )}
                  </button>
                </div>
                {predictedETA !== null && (
                  <div className="bg-gray-900 rounded-lg p-4 mt-4">
                    <p className="text-green-400 font-semibold text-lg">
                      Predicted Delivery Time: {Math.round(predictedETA)} minutes
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      The estimated delivery time has been automatically set below
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Priority *</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Estimated Delivery Time</label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedDeliveryTime}
                    onChange={(e) => setFormData({ ...formData, estimatedDeliveryTime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Delivery Instructions</label>
                <textarea
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                  placeholder="Special delivery instructions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.fromLocationType === 'address' && formData.toLocationType === 'address'}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                >
                  Create Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">Delivery Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedDelivery(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Delivery Number</p>
                  <p className="text-white font-medium">{selectedDelivery.deliveryNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDelivery.status)}`}>
                    {getStatusIcon(selectedDelivery.status)}
                    {selectedDelivery.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Priority</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedDelivery.priority)}`}>
                    {selectedDelivery.priority.toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Item Type</p>
                  <p className="text-white font-medium capitalize">{selectedDelivery.deliveryItemType}</p>
                </div>
              </div>

              {/* Driver Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Driver Information
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Driver Name</p>
                  <p className="text-white font-medium">{selectedDelivery.assignedDriver?.userName || 'N/A'}</p>
                  <p className="text-gray-400 text-sm mt-2">Driver ID</p>
                  <p className="text-white font-medium">{selectedDelivery.assignedDriver?.entityId || 'N/A'}</p>
                </div>
              </div>

              {/* Route Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  Route Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-green-400 text-sm font-medium mb-2">From Location</p>
                    <p className="text-white">
                      {selectedDelivery.fromLocation.type === 'warehouse' 
                        ? selectedDelivery.fromLocation.warehouseId?.name || 'Warehouse'
                        : selectedDelivery.fromLocation.locationName || 'Custom Location'}
                    </p>
                    {selectedDelivery.fromLocation.address && (
                      <p className="text-gray-400 text-sm mt-1">{selectedDelivery.fromLocation.address}</p>
                    )}
                    {selectedDelivery.fromLocation.latitude && selectedDelivery.fromLocation.longitude && (
                      <p className="text-gray-400 text-sm mt-1">
                        Coordinates: {selectedDelivery.fromLocation.latitude}, {selectedDelivery.fromLocation.longitude}
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-red-400 text-sm font-medium mb-2">To Location</p>
                    <p className="text-white">
                      {selectedDelivery.toLocation.type === 'warehouse' 
                        ? selectedDelivery.toLocation.warehouseId?.name || 'Warehouse'
                        : selectedDelivery.toLocation.locationName || 'Custom Location'}
                    </p>
                    {selectedDelivery.toLocation.address && (
                      <p className="text-gray-400 text-sm mt-1">{selectedDelivery.toLocation.address}</p>
                    )}
                    {selectedDelivery.toLocation.latitude && selectedDelivery.toLocation.longitude && (
                      <p className="text-gray-400 text-sm mt-1">
                        Coordinates: {selectedDelivery.toLocation.latitude}, {selectedDelivery.toLocation.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Items
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  {selectedDelivery.deliveryItemType === 'parcel' ? (
                    <div className="space-y-2">
                      {selectedDelivery.parcels.map((parcel, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                          <span className="text-white">{parcel.trackingNumber || `Parcel ${index + 1}`}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(parcel.status || 'pending')}`}>
                            {parcel.status || 'pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-medium">
                        {selectedDelivery.consolidation?.referenceCode || 'Consolidation'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {selectedDelivery.consolidation?.parcels?.length || 0} parcels
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Timeline
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Created</p>
                    <p className="text-white">{formatDate(selectedDelivery.createdTimestamp)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last Updated</p>
                    <p className="text-white">{formatDate(selectedDelivery.updatedTimestamp)}</p>
                  </div>
                  {selectedDelivery.estimatedDeliveryTime && (
                    <div>
                      <p className="text-gray-400 text-sm">Estimated Delivery</p>
                      <p className="text-white">{formatDate(selectedDelivery.estimatedDeliveryTime)}</p>
                    </div>
                  )}
                  {selectedDelivery.actualDeliveryTime && (
                    <div>
                      <p className="text-gray-400 text-sm">Actual Delivery</p>
                      <p className="text-white">{formatDate(selectedDelivery.actualDeliveryTime)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions & Notes */}
              {(selectedDelivery.deliveryInstructions || selectedDelivery.notes) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Additional Information</h3>
                  <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                    {selectedDelivery.deliveryInstructions && (
                      <div>
                        <p className="text-gray-400 text-sm">Delivery Instructions</p>
                        <p className="text-white">{selectedDelivery.deliveryInstructions}</p>
                      </div>
                    )}
                    {selectedDelivery.notes && (
                      <div>
                        <p className="text-gray-400 text-sm">Notes</p>
                        <p className="text-white">{selectedDelivery.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete delivery <span className="font-semibold text-white">{selectedDelivery.deliveryNumber}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDelivery(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDelivery}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}