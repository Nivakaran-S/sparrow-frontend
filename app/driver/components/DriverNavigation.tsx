
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DriverNavigation = () => {
      const [user, setUser] = useState<any>(null);
      const [isOnline, setIsOnline] = useState(false);
      const router = useRouter();
    
      useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role !== 'driver') {
            router.push('/login');
            return;
          }
          setUser(parsedUser);
        } else {
          router.push('/login');
        }
      }, [router]);
    
      const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
      };
    
      const toggleOnlineStatus = () => {
        setIsOnline(!isOnline);
      };
    
      if (!user) return <div className="loading">Loading...</div>;
    
    return(
        <div>
            <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="system-title">Driver Portal</h1>
          </div>
          <div className="header-actions">
            <div className="online-toggle">
              <button 
                className={`status-toggle ${isOnline ? 'online' : 'offline'}`}
                onClick={toggleOnlineStatus}
              >
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </button>
            </div>
            <div className="notification-bell">🔔</div>
            <div className="user-profile">
              <div className="profile-img"></div>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </header>

        </div>
    )
}

export default DriverNavigation