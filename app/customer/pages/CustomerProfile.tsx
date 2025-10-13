"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";


interface TrackShipmentsProps {
  setActiveTab?: (tab: string) => void;
}


const CustomerProfile = ({ setActiveTab }: TrackShipmentsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: ""
  });

  const [editedData, setEditedData] = useState(profileData);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // First get the user ID from auth check
      const authResponse = await fetch(`${API_BASE_URL}/check-cookie`, {
        credentials: 'include',
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setUserId(authData.id);
        
        // Then fetch customer details
        const customerResponse = await fetch(`${API_BASE_URL}/api/users/customer/${authData.id}`, {
          credentials: 'include',
        });
        
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          const customer = customerData[0]; // Customer data is first element
          
          const data = {
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email || "",
            phoneNumber: customer.phoneNumber || "",
            gender: customer.gender || ""
          };
          
          setProfileData(data);
          setEditedData(data);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update customer profile
      const response = await fetch(`${API_BASE_URL}/api/users/customer/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        setProfileData(editedData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="text-white  pt-[3vh]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Profile Settings</h2>
        <p className="text-gray-400">Manage your personal information</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 max-w-6xl">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {profileData.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <p className="text-gray-400">{profileData.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                Customer Account
              </span>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                value={editedData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors ${
                  !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={editedData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors ${
                  !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={editedData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors ${
                !isEditing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={editedData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors ${
                !isEditing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            /> 
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Gender
            </label>
            <select
              value={editedData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors ${
                !isEditing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Security</h4>
          <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Change Password
          </button>
        </div>

        
      </div>
    </div>
    </div>
  );
};

export default CustomerProfile;