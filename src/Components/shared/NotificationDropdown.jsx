import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrophy,
  FaFire,
  FaInfoCircle,
  FaBell,
  FaCheckDouble,
  FaTrash,
  FaArrowRight,
} from "react-icons/fa";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentId = sessionStorage.getItem("currentUserId");
    if (!currentId) return;
    setUserId(currentId);

    const storageKey = `notifications_${currentId}`;
    const savedNotifications = localStorage.getItem(storageKey);

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Default notifications for new user
      const welcomeNotifications = [
        {
          id: Date.now(),
          type: "system",
          title: "Welcome to Oafcodify!",
          message:
            "Start your journey by completing your first lesson in HTML or JavaScript.",
          time: "Just now",
          isRead: false,
          iconType: "info",
        },
      ];
      setNotifications(welcomeNotifications);
      localStorage.setItem(storageKey, JSON.stringify(welcomeNotifications));

      // Sync welcome notification to backend
      const numericUserId = parseInt(currentId);
      if (!isNaN(numericUserId)) {
        fetch(`/api/user/${currentId}?action=notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification: welcomeNotifications[0] })
        })
        .then(response => {
          if (!response.ok) throw new Error(`Backend returned ${response.status}`);
          return response.json();
        })
        .catch(err => console.error('Error syncing welcome notification to backend:', err));
      }
    }
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const getIcon = (type) => {
    switch (type) {
      case "achievement":
        return <FaTrophy className="text-yellow-400" />;
      case "streak":
        return <FaFire className="text-orange-500" />;
      case "system":
        return <FaInfoCircle className="text-blue-400" />;
      default:
        return <FaBell className="text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />
      <div className="absolute right-0 top-[50px] w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaBell className="text-white" size={16} />
          <span className="text-white font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-white/80 hover:text-white text-xs font-medium flex items-center gap-1"
          >
            <FaCheckDouble size={12} /> Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FaBell size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                !n.isRead ? "bg-blue-50/50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      !n.isRead ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {n.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {n.time}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 hover:bg-blue-100 rounded-full text-blue-500 transition-colors"
                      title="Mark as read"
                    >
                      <FaCheckDouble size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 hover:bg-red-100 rounded-full text-red-400 transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <button
          onClick={() => {
            navigate("/notifications");
            window.location.reload();
          }}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors border-t border-gray-100"
        >
          View all notifications <FaArrowRight size={12} />
        </button>
      )}
    </div>
    </>
  );
};

export default NotificationDropdown;
