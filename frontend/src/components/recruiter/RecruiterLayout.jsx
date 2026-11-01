
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  ClipboardList,
  BrainCircuit,
  UserRound,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  RefreshCw,
  CheckCheck,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function RecruiterLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const recruiterName = user.name || "Recruiter";

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/recruiter/dashboard",
    },
    {
      label: "Manage Jobs",
      icon: BriefcaseBusiness,
      path: "/recruiter/jobs",
    },
    {
      label: "Applicants",
      icon: Users,
      path: "/recruiter/applicants",
    },
    {
      label: "Screening Results",
      icon: ClipboardList,
      path: "/recruiter/screening",
    },
    {
      label: "AI Interview Results",
      icon: BrainCircuit,
      path: "/recruiter/interviews",
    },
    {
      label: "My Profile",
      icon: UserRound,
      path: "/recruiter/profile",
    },
  ];

  // Fetch recruiter notifications
  async function fetchNotifications() {
    try {
      setNotificationLoading(true);

      const response = await api.get("/notifications/");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      console.error("Unable to fetch notifications:", err);
    } finally {
      setNotificationLoading(false);
    }
  }

  // Load notifications when layout opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Open or close notification dropdown
  function toggleNotifications() {
    const willOpen = !notificationOpen;

    setNotificationOpen(willOpen);

    if (willOpen) {
      fetchNotifications();
    }
  }

  // Mark one notification as read
  async function handleNotificationClick(notification) {
    try {
      if (!notification.is_read) {
        await api.patch(
          `/notifications/${notification.id}/read`
        );

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );

        setUnreadCount((count) => Math.max(0, count - 1));
      }

      setNotificationOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error("Unable to mark notification as read:", err);
    }
  }

  // Mark all notifications as read
  async function handleMarkAllRead() {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Unable to mark all notifications as read:", err);
    }
  }

  // Format notification date
  function formatNotificationDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Sign out
  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="candidate-layout">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`candidate-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <BrainCircuit size={23} />
          </span>

          <div>
            <strong>TalentLens</strong>
            <small>Recruitment Intelligence</small>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="dashboard-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `dashboard-nav-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/recruiter/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <button
            className="dashboard-nav-item logout-item"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="candidate-main">

        {/* Header */}
        <header className="dashboard-topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="topbar-title">
            <span>Recruiter Workspace</span>
            <small>TalentLens · Recruitment Intelligence</small>
          </div>

          <div className="topbar-actions">

            {/* Notifications */}
            <div
              className="notification-wrapper"
              style={{ position: "relative" }}
            >
              <button
                className="notification-button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                title="Notifications"
                onClick={toggleNotifications}
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  className="notification-dropdown"
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    width: "350px",
                    maxWidth: "calc(100vw - 30px)",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
                    zIndex: 1000,
                    color: "#1f2937",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #e5e7eb",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "15px" }}>
                        Notifications
                      </strong>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "4px",
                        }}
                      >
                        {unreadCount} unread notifications
                      </div>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <CheckCheck
                          size={14}
                          style={{
                            verticalAlign: "middle",
                            marginRight: "4px",
                          }}
                        />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      maxHeight: "350px",
                      overflowY: "auto",
                    }}
                  >
                    {notificationLoading ? (
                      <div
                        style={{
                          padding: "30px 15px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        <RefreshCw
                          size={22}
                          className="animate-spin"
                        />
                        <p>Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "35px 20px",
                          textAlign: "center",
                        }}
                      >
                        <Bell
                          size={30}
                          color="#9ca3af"
                          style={{ margin: "0 auto 10px" }}
                        />

                        <p
                          style={{
                            fontWeight: 600,
                            marginBottom: "5px",
                          }}
                        >
                          No notifications yet
                        </p>

                        <small style={{ color: "#6b7280" }}>
                          Your recruitment updates will appear here.
                        </small>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                          style={{
                            width: "100%",
                            display: "block",
                            textAlign: "left",
                            padding: "14px 16px",
                            border: "none",
                            borderBottom: "1px solid #f1f5f9",
                            background: notification.is_read
                              ? "#ffffff"
                              : "#eff6ff",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "8px",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: "13px",
                                color: "#1f2937",
                              }}
                            >
                              {notification.title}
                            </strong>

                            {!notification.is_read && (
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  minWidth: "8px",
                                  borderRadius: "50%",
                                  background: "#2563eb",
                                  marginTop: "4px",
                                }}
                              />
                            )}
                          </div>

                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              lineHeight: 1.5,
                              margin: "6px 0",
                            }}
                          >
                            {notification.message}
                          </p>

                          <small
                            style={{
                              fontSize: "11px",
                              color: "#9ca3af",
                            }}
                          >
                            {formatNotificationDate(
                              notification.created_at
                            )}
                          </small>
                        </button>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div
                      style={{
                        padding: "11px 16px",
                        borderTop: "1px solid #e5e7eb",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={fetchNotifications}
                        disabled={notificationLoading}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        <RefreshCw
                          size={13}
                          style={{
                            verticalAlign: "middle",
                            marginRight: "5px",
                          }}
                        />
                        Refresh notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recruiter information */}
            <div className="topbar-user">
              <div className="user-avatar">
                {recruiterName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user.email || recruiterName}</strong>
                <small>Recruiter</small>
              </div>
            </div>

          </div>
        </header>

        {/* Page content */}
        <div className="dashboard-content">
          <Outlet />
        </div>

      </main>
    </div>
  );
}
