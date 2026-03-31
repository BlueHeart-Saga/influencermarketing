// src/components/Sidebar.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import * as FaIcons from "react-icons/fa";
import { FaSignOutAlt, FaBullhorn } from "react-icons/fa";

import { 
  FaChevronRight, 
  FaChevronDown, 
  FaTimes, 
  FaCog,
  FaUserCircle
} from "react-icons/fa";
import { FaShapes } from "react-icons/fa";
import API_BASE_URL from "../config/api";
import "../style/Sidebar.css";

function Sidebar({ isSidebarOpen, isMobile, toggleSidebar }) {
  const { user, logout  } = useContext(AuthContext);
  const [menus, setMenus] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [iconCache, setIconCache] = useState({});
  const location = useLocation();
  const navigate = useNavigate();


  // Render icon with all supported types
  const renderIcon = (iconData) => {
    if (!iconData || !iconData.value) {
      return <FaShapes className="prem-sidebar-default-icon" />;
    }

    const { type, value, alt_text } = iconData;

    switch (type) {
      case "fa_icon":
        try {
          const IconComponent = FaIcons[value.replace(/^Fa/, "")] || 
                               FaIcons[value.split(" ").pop()] || 
                               FaIcons[value];
          if (IconComponent) {
            return <IconComponent className="prem-sidebar-fa-icon" />;
          }
          return <i className={value} />;
        } catch (error) {
          console.warn("Failed to render FontAwesome icon:", value);
          return <FaUserCircle className="prem-sidebar-default-icon" />;
        }

      case "emoji":
        return <span className="prem-sidebar-emoji-icon" title={alt_text}>{value}</span>;

      case "url":
        return (
          <>
            <img 
              src={value} 
              alt={alt_text || "icon"} 
              className="prem-sidebar-url-icon"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = "inline";
                }
              }}
            />
            <FaUserCircle className="prem-sidebar-default-icon" style={{ display: 'none' }} />
          </>
        );

      case "upload":
        const iconUrl = `${API_BASE_URL}/icon/${value}`;
        return (
          <>
            <img 
              src={iconUrl} 
              alt={alt_text || "icon"} 
              className="prem-sidebar-uploaded-icon"
              onError={(e) => {
                e.target.style.display = "none";
                const fallback = e.target.nextSibling;
                if (fallback) {
                  fallback.style.display = "inline";
                }
              }}
            />
            <FaUserCircle className="prem-sidebar-default-icon" style={{ display: 'none' }} />
          </>
        );

      default:
        if (typeof value === 'string') {
          const IconComponent = FaIcons[value.replace(/^Fa/, "")] || FaIcons[value];
          if (IconComponent) {
            return <IconComponent className="prem-sidebar-fa-icon" />;
          }
          if (value.length <= 3) {
            return <span className="prem-sidebar-emoji-icon">{value}</span>;
          }
        }
        return <FaUserCircle className="prem-sidebar-default-icon" />;
    }
  };

  // Preload uploaded icons
  const preloadIcons = async (menuItems) => {
    const uploadIcons = [];
    
    const findUploadIcons = (items) => {
      items.forEach(item => {
        if (item.icon && item.icon.type === "upload" && item.icon.value) {
          uploadIcons.push(item.icon.value);
        }
        if (item.children) {
          findUploadIcons(item.children);
        }
      });
    };
    
    findUploadIcons(menuItems);
    
    const uniqueIcons = [...new Set(uploadIcons)];
    const cacheUpdates = {};
    
    for (const iconId of uniqueIcons) {
      if (!iconCache[iconId]) {
        try {
          const response = await fetch(`${API_BASE_URL}/icon/${iconId}`);
          if (response.ok) {
            cacheUpdates[iconId] = true;
          }
        } catch (error) {
          console.warn("Failed to preload icon:", iconId);
        }
      }
    }
    
    if (Object.keys(cacheUpdates).length > 0) {
      setIconCache(prev => ({ ...prev, ...cacheUpdates }));
    }
  };

  // Fetch menus from backend
  useEffect(() => {
    if (!user) return;

    const fetchMenus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/menu/${user.role}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch menus");
        const data = await res.json();
        const menuData = data.menus || [];
        setMenus(menuData);
        
        preloadIcons(menuData);
        
        const initialExpandedState = {};
        const checkAndExpandParents = (menuItems, currentPath) => {
          menuItems.forEach(item => {
            if (item.children && item.children.length > 0) {
              const hasActiveChild = item.children.some(child => 
                currentPath.startsWith(child.path) || currentPath === item.path
              );
              if (hasActiveChild) {
                initialExpandedState[item.path] = true;
              }
              checkAndExpandParents(item.children, currentPath);
            }
          });
        };
        
        checkAndExpandParents(menuData, location.pathname);
        setExpanded(initialExpandedState);
      } catch (err) {
        console.error("Sidebar fetch error:", err);
        setMenus([]);
      }
    };

    fetchMenus();
  }, [user, location.pathname]);

  // Toggle expand/collapse
  const toggleExpand = (path, hasChildren, e) => {
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
    }
  };

  // Handle menu item click
  const handleMenuItemClick = (menu, e) => {
    const hasChildren = menu.children && menu.children.length > 0;
    
    if (hasChildren) {
      toggleExpand(menu.path, hasChildren, e);
    } else {
      if (isMobile) {
        toggleSidebar();
      }
      if (menu.path) {
        navigate(menu.path);
      }
    }
  };

  // Close sidebar on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  // Check if menu item is active
  const isMenuItemActive = (menu) => {
    if (location.pathname === menu.path) return true;
    if (menu.children) {
      return menu.children.some(child => location.pathname.startsWith(child.path));
    }
    return false;
  };

const getEmptyMenuMessage = (role) => {
  switch (role) {
    case "admin":
      return "Menus on the way…";
    case "brand":
      return "Workspace preparing…";
    case "influencer":
      return "Almost ready for you…";
    default:
      return "Please login again.";
  }
};




  // Recursive render for menu items
  const renderMenuItem = (menu, depth = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isActive = isMenuItemActive(menu);
    const isExpanded = expanded[menu.path];

    return (
      <li key={menu.path} className={`prem-sidebar-menu-item prem-sidebar-depth-${depth}`}>
        <Link
          to={hasChildren ? "#" : (menu.path || "#")}
          className={`prem-sidebar-menu-link ${isActive ? 'prem-sidebar-active' : ''} ${hasChildren ? 'prem-sidebar-has-children' : ''}`}
          onClick={(e) => handleMenuItemClick(menu, e)}
          title={menu.title}
        >
          <span className="prem-sidebar-icon-wrapper">
            {renderIcon(menu.icon)}
          </span>
          
          {isSidebarOpen && (
            <>
              <span className="prem-sidebar-menu-title">{menu.title}</span>
              {hasChildren && (
                <span className="prem-sidebar-expand-arrow">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              )}
            </>
          )}
        </Link>

        {hasChildren && isExpanded && isSidebarOpen && (
          <ul className={`prem-sidebar-submenu prem-sidebar-depth-${depth + 1}`}>
            {menu.children.map(child => renderMenuItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (!user) return null;

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div className="prem-sidebar-overlay" onClick={toggleSidebar} />
      )}
      
      <aside className={`prem-sidebar ${isSidebarOpen ? 'prem-sidebar-open' : 'prem-sidebar-closed'} ${isMobile ? 'prem-sidebar-mobile' : 'prem-sidebar-desktop'}`}>
        
        {/* Header */}
        {/* <div className="prem-sidebar-header">
          {isSidebarOpen && (
            <div className="prem-sidebar-header-content">
              <h3 className="prem-sidebar-title">Navigation</h3>
              {isMobile && (
                <button 
                  className="prem-sidebar-close-btn" 
                  onClick={toggleSidebar} 
                  aria-label="Close sidebar"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          )}
        </div> */}
        
        {/* Navigation */}
        <nav className="prem-sidebar-nav">
          <ul className="prem-sidebar-menu-list">
            {menus.length > 0 ? (
              menus.map(menu => renderMenuItem(menu))
            ) : (
              <li className="prem-sidebar-menu-item">
                <div className="prem-sidebar-menu-link">
                  <span className="prem-sidebar-icon-wrapper">
                    <FaBullhorn />

                  </span>
                  {isSidebarOpen && (
                    <span className="prem-sidebar-menu-title">
  {getEmptyMenuMessage(user.role)}
</span>

                  )}
                </div>
              </li>
            )}

            {/* Admin Menu Management */}
            {/* {user.role === "admin" && (
              <li className="prem-sidebar-menu-item prem-sidebar-admin-menu">
                <Link
                  to="/admin/menus"
                  className={`prem-sidebar-menu-link ${location.pathname.startsWith("/admin/menus") ? 'prem-sidebar-active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="prem-sidebar-icon-wrapper">
                    <FaCog />
                  </span>
                  {isSidebarOpen && <span className="prem-sidebar-menu-title">Menu Management</span>}
                </Link>
              </li>
            )} */}
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="prem-sidebar-footer">
  {/* User Info */}
  {/* <div className="prem-sidebar-user-info">
    <span className="prem-sidebar-user-avatar">
      <FaUserCircle />
    </span>
    {isSidebarOpen && (
      <div className="prem-sidebar-user-details">
        <span className="prem-sidebar-user-name">{user.name || user.email}</span>
        <span className="prem-sidebar-user-role">{user.role}</span>
      </div>
    )}
  </div> */}

  {/* Logout Button */}
  <button
    className="prem-sidebar-logout-btn"
    onClick={() => {
      logout();
      navigate("/login");
    }}
  >
    <FaSignOutAlt className="prem-sidebar-logout-icon" />
    {isSidebarOpen && <span className="prem-sidebar-logout-text">Logout</span>}
  </button>
</div>

      </aside>
    </>
  );
}

export default Sidebar;