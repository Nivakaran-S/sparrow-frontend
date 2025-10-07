'use client'

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CustomerSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      section: "Dashboard",
      items: [
        { id: "overview", label: "Overview" },
      ]
    },
    {
      section: "My Account",
      items: [
        { id: "profile", label: "Profile Settings"},
        { id: "billing", label: "Billing & Payment" },
        { id: "addresses", label: "Saved Addresses" },
      ]
    },
    {
      section: "Shipping",
      items: [
        { id: "newShipment", label: "Create Shipment" },
        { id: "parcels", label: "My Parcels" },
        { id: "tracking", label: "Track Shipment" },
      ]
    },
    {
      section: "History & Support",
      items: [
        { id: "history", label: "Order History" },
        { id: "receipts", label: "Receipts" },
        { id: "swift", label: "Ask Swift" },
        { id: "support", label: "Help & Support" },
      ]
    }
  ];

  return (
    <div>
      <nav className="w-64 fixed h-[88vh] z-[99] top-[12vh] bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-700 p-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <div className="pt-6 pb-8">
          {menuItems.map((section, idx) => (
            <div key={idx} className="px-6 mb-6">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full flex cursor-pointer items-center rounded-lg gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                      activeTab === item.id
                        ? "bg-gray-800 text-blue-400 border-l-blue-400 shadow-lg"
                        : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CustomerSidebar;