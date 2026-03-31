import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config/api";
import "../style/AdminMenuManager.css";

function AdminMenuManager() {
  const { user } = useContext(AuthContext);
  const [role, setRole] = useState(user?.role || "admin");

  // Icon management state
  const [iconUploading, setIconUploading] = useState(false);

  // Sidebar state
  const [menus, setMenus] = useState([]);
  const [originalMenus, setOriginalMenus] = useState([]);
  const [menuForm, setMenuForm] = useState({ 
    title: "", 
    path: "", 
    icon: { type: "url", value: "", alt_text: "" } 
  });

  // Submenu state (sidebar)
  const [expandedMenus, setExpandedMenus] = useState({});
  const [submenuForm, setSubmenuForm] = useState({ 
    parentPath: "", 
    title: "", 
    path: "", 
    icon: { type: "url", value: "", alt_text: "" } 
  });
  const [editingSubKey, setEditingSubKey] = useState(null);
  const [editSubForm, setEditSubForm] = useState({ 
    title: "", 
    path: "", 
    icon: { type: "url", value: "", alt_text: "" } 
  });

  // Navbar state
  const [navItems, setNavItems] = useState([]);
  const [originalNav, setOriginalNav] = useState([]);
  const [navForm, setNavForm] = useState({ 
    title: "", 
    path: "", 
    icon: { type: "url", value: "", alt_text: "" } 
  });

  // Navbar submenu state
  const [expandedNav, setExpandedNav] = useState({});
  const [navSubForm, setNavSubForm] = useState({ 
    parentPath: "", 
    title: "", 
    path: "", 
    icon: { type: "url", value: "", alt_text: "" } 
  });
  const [editingNavSubKey, setEditingNavSubKey] = useState(null);
  const [editNavSubForm, setEditNavSubForm] = useState({ 
    title: "", 
    path: "", 
    icon: { type: "url", value: "", alt_text: "" } 
  });

  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("sidebar");

  // ---------------- Icon Upload Handler ----------------
  const handleIconUpload = async (file) => {
    if (!file) return null;
    
    setIconUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/icon/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const result = await response.json();
      setIconUploading(false);
      return result.icon_id;
    } catch (error) {
      console.error("Icon upload error:", error);
      setIconUploading(false);
      setMessage("Icon upload failed ❌");
      return null;
    }
  };

  // ---------------- Fetch menus + navbar ----------------
  const fetchMenusAndNav = useCallback(async () => {
  if (!user) return;
  try {
    const menuRes = await fetch(`${API_BASE_URL}/menu/${role}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (!menuRes.ok) throw new Error("Failed to fetch menus");
    const menuData = await menuRes.json();
    
    // Ensure proper icon structure
    const processedMenus = (menuData.menus || []).map(menu => ({
      ...menu,
      icon: menu.icon || null,
      children: (menu.children || []).map(child => ({
        ...child,
        icon: child.icon || null
      }))
    }));
    
    setMenus(processedMenus);
    setOriginalMenus(processedMenus);

    const navRes = await fetch(`${API_BASE_URL}/navbar/${role}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (!navRes.ok) throw new Error("Failed to fetch navbar");
    const navData = await navRes.json();
    
    // Ensure proper icon structure
    const processedNav = (navData.items || []).map(item => ({
      ...item,
      icon: item.icon || null,
      children: (item.children || []).map(child => ({
        ...child,
        icon: child.icon || null
      }))
    }));
    
    setNavItems(processedNav);
    setOriginalNav(processedNav);
  } catch (err) {
    console.error(err);
    setMenus([]);
    setNavItems([]);
    setMessage("Failed to load menus/navbar ❌");
  }
}, [role, user]);

  useEffect(() => {
    fetchMenusAndNav();
  }, [fetchMenusAndNav]);

  // ---------------- Helper functions ----------------
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const renderIconPreview = (icon) => {
    if (!icon || !icon.value) return null;
    
    switch (icon.type) {
      case "url":
        return <img src={icon.value} alt={icon.alt_text || "icon"} className="icon-preview" />;
      case "upload":
        return <img src={`${API_BASE_URL}/icon/${icon.value}`} alt={icon.alt_text || "icon"} className="icon-preview" />;
      case "emoji":
        return <span className="icon-emoji">{icon.value}</span>;
      case "fa_icon":
        return <i className={icon.value} />;
      default:
        return null;
    }
  };

  // ---------------- Icon Form Component ----------------
  const IconForm = ({ icon, onIconChange, prefix = "" }) => {
  const [localIconType, setLocalIconType] = useState(icon?.type || "url");
  const [localIconValue, setLocalIconValue] = useState(icon?.value || "");
  const [localAltText, setLocalAltText] = useState(icon?.alt_text || "");
  const [localFile, setLocalFile] = useState(null);

  // Reset form when icon prop changes
  useEffect(() => {
    setLocalIconType(icon?.type || "url");
    setLocalIconValue(icon?.value || "");
    setLocalAltText(icon?.alt_text || "");
    setLocalFile(null);
  }, [icon]);

  const handleFileChange = (e) => {
    setLocalFile(e.target.files[0]);
  };

  const handleSaveIcon = async () => {
    // Validate required fields based on type
    if (localIconType === "url" && !localIconValue) {
      setMessage("URL is required for URL icons");
      return;
    }
    
    if (localIconType === "upload" && !localFile) {
      setMessage("Please select a file to upload");
      return;
    }
    
    if (localIconType === "emoji" && !localIconValue) {
      setMessage("Please enter an emoji");
      return;
    }
    
    if (localIconType === "fa_icon" && !localIconValue) {
      setMessage("Please enter a FontAwesome class");
      return;
    }

    let finalValue = localIconValue;
    
    if (localIconType === "upload" && localFile) {
      const iconId = await handleIconUpload(localFile);
      if (iconId) {
        finalValue = iconId;
      } else {
        return; // Upload failed
      }
    }

    const newIconData = {
      type: localIconType,
      value: finalValue,
      alt_text: localAltText || ""
    };

    onIconChange(newIconData);
    setMessage("Icon saved successfully ✅");
  };

  const handleClearIcon = () => {
    onIconChange(null);
    setMessage("Icon cleared");
  };

  return (
    <div className="icon-form">
      <div className="icon-type-selector">
        <label>Icon Type:</label>
        <select 
          value={localIconType} 
          onChange={(e) => {
            setLocalIconType(e.target.value);
            setLocalIconValue("");
            setLocalFile(null);
          }}
        >
          <option value="url">URL</option>
          <option value="upload">Upload</option>
          <option value="emoji">Emoji</option>
          <option value="fa_icon">FontAwesome</option>
          <option value="none">No Icon</option>
        </select>
      </div>

      {localIconType !== "none" && (
        <>
          {localIconType === "url" && (
            <input
              className="form-input"
              placeholder="Icon URL (e.g., https://example.com/icon.png)"
              value={localIconValue}
              onChange={(e) => setLocalIconValue(e.target.value)}
            />
          )}

          {localIconType === "upload" && (
            <div className="upload-section">
              <input
                type="file"
                accept="image/*,.svg,.ico"
                onChange={handleFileChange}
              />
              {localFile && <span className="file-name">{localFile.name}</span>}
            </div>
          )}

          {localIconType === "emoji" && (
            <input
              className="form-input"
              placeholder="Emoji (e.g., 😊, ⭐, 🔔)"
              value={localIconValue}
              onChange={(e) => setLocalIconValue(e.target.value)}
            />
          )}

          {localIconType === "fa_icon" && (
            <input
              className="form-input"
              placeholder="FontAwesome class (e.g., fas fa-home, fab fa-react)"
              value={localIconValue}
              onChange={(e) => setLocalIconValue(e.target.value)}
            />
          )}

          <input
            className="form-input"
            placeholder="Alt text (accessibility description)"
            value={localAltText}
            onChange={(e) => setLocalAltText(e.target.value)}
          />

          <div className="icon-form-actions">
            <button 
              type="button"
              className="btn-save-icon"
              onClick={handleSaveIcon}
              disabled={iconUploading}
            >
              {iconUploading ? "Uploading..." : "Set Icon"}
            </button>
            {icon && icon.value && (
              <button 
                type="button"
                className="btn-clear-icon"
                onClick={handleClearIcon}
              >
                Clear Icon
              </button>
            )}
          </div>

          {icon && icon.value && (
            <div className="icon-preview-container">
              <span>Preview: </span>
              {renderIconPreview(icon)}
              <span className="icon-type-badge">{icon.type}</span>
            </div>
          )}
        </>
      )}
      
      {localIconType === "none" && (
        <div className="no-icon-selected">
          <p>No icon will be set for this item</p>
          <button 
            type="button"
            className="btn-clear-icon"
            onClick={handleClearIcon}
          >
            Confirm No Icon
          </button>
        </div>
      )}
    </div>
  );
};

  // =====================================================
  //                    Sidebar Handlers
  // =====================================================

  const handleAddMenu = async () => {
    if (!menuForm.title || !menuForm.path) {
      setMessage("Title and path are required");
      return;
    }

    if (menus.some(menu => menu.path === menuForm.path)) {
      setMessage("Menu path already exists ❌");
      return;
    }

    const newMenu = {
      title: menuForm.title,
      path: menuForm.path,
      icon: menuForm.icon.value ? menuForm.icon : null,
      children: []
    };

    setMenus([...menus, newMenu]);
    setMenuForm({ title: "", path: "", icon: { type: "url", value: "", alt_text: "" } });
    setMessage("Menu added (remember to Save) ✅");
  };

  const handleRemoveMenu = async (path) => {
    try {
      await fetch(`${API_BASE_URL}/menu/remove/${role}/${encodeURIComponent(path)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMenus(menus.filter(menu => menu.path !== path));
      setMessage("Menu removed ✅");
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove menu ❌");
    }
  };

  const startEditingMenu = (menu) => {
    setEditingSubKey(`menu::${menu.path}`);
    setEditSubForm({ 
      title: menu.title, 
      path: menu.path, 
      icon: menu.icon || { type: "url", value: "", alt_text: "" } 
    });
  };

  const handleEditMenuSubmit = (oldPath) => {
    if (!editSubForm.title || !editSubForm.path) {
      setMessage("Title and path are required");
      return;
    }

    if (editSubForm.path !== oldPath && menus.some(menu => menu.path === editSubForm.path)) {
      setMessage("Menu path already exists ❌");
      return;
    }

    const updatedMenus = menus.map(menu => {
      if (menu.path === oldPath) {
        return { ...menu, ...editSubForm, icon: editSubForm.icon.value ? editSubForm.icon : null };
      }
      return menu;
    });

    setMenus(updatedMenus);
    setEditingSubKey(null);
    setMessage("Menu updated (remember to Save) ✅");
  };

  const moveMenu = (index, direction) => {
    const newMenus = [...menus];
    const target = index + direction;
    if (target < 0 || target >= newMenus.length) return;
    [newMenus[index], newMenus[target]] = [newMenus[target], newMenus[index]];
    setMenus(newMenus);
  };

  const saveMenuOrder = async () => {
  try {
    const payload = menus.map((m) => ({
      title: m.title,
      path: m.path,
      icon: m.icon && m.icon.value ? {
        type: m.icon.type,
        value: m.icon.value,
        alt_text: m.icon.alt_text || ""
      } : null,
      children: Array.isArray(m.children)
        ? m.children.map((c) => ({
            title: c.title,
            path: c.path,
            icon: c.icon && c.icon.value ? {
              type: c.icon.type,
              value: c.icon.value,
              alt_text: c.icon.alt_text || ""
            } : null
          }))
        : [],
    }));
    
    console.log("Saving menu payload:", JSON.stringify(payload, null, 2)); // Debug log
    
    const res = await fetch(`${API_BASE_URL}/menu/save`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${user.token}` 
      },
      body: JSON.stringify({ role, items: payload }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Save failed:", errorText);
      throw new Error(`Failed to save menu order: ${res.status} ${errorText}`);
    }
    
    setOriginalMenus(menus);
    setMessage("Sidebar order saved ✅");
  } catch (err) {
    console.error("Save error:", err);
    setMessage("Failed to save sidebar order ❌");
  }
};

  const cancelMenuChanges = () => {
    setMenus(originalMenus);
    setMessage("Sidebar changes canceled");
  };

  // ---------- Sidebar Submenu CRUD ----------
  const toggleExpandMenu = (path) => {
    setExpandedMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const addSubmenu = (parentPath) => {
    if (!submenuForm.title || !submenuForm.path || submenuForm.parentPath !== parentPath) return;
    
    const next = deepClone(menus);
    const parent = next.find((m) => m.path === parentPath);
    if (!parent) return;
    
    parent.children = parent.children || [];
    
    if (parent.children.some((c) => c.path === submenuForm.path)) {
      setMessage("Submenu path already exists under this menu ❌");
      return;
    }
    
    parent.children.push({
      title: submenuForm.title,
      path: submenuForm.path,
      icon: submenuForm.icon.value ? submenuForm.icon : null,
    });
    
    setMenus(next);
    setSubmenuForm({ parentPath: "", title: "", path: "", icon: { type: "url", value: "", alt_text: "" } });
    setMessage("Submenu added (remember to Save) ✅");
  };

  const promptAddSubmenu = (parentPath) => {
    setSubmenuForm({ parentPath, title: "", path: "", icon: { type: "url", value: "", alt_text: "" } });
    setExpandedMenus((prev) => ({ ...prev, [parentPath]: true }));
  };

  const removeSubmenu = async (parentPath, subPath) => {
    try {
      await fetch(`${API_BASE_URL}/menu/remove/${role}/${encodeURIComponent(subPath)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      const next = deepClone(menus);
      const parent = next.find((m) => m.path === parentPath);
      if (!parent || !Array.isArray(parent.children)) return;
      
      parent.children = parent.children.filter((c) => c.path !== subPath);
      setMenus(next);
      setMessage("Submenu removed ✅");
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove submenu ❌");
    }
  };

  const startEditingSubmenu = (parentPath, sub) => {
    setEditingSubKey(`${parentPath}::${sub.path}`);
    setEditSubForm({ 
      title: sub.title, 
      path: sub.path, 
      icon: sub.icon || { type: "url", value: "", alt_text: "" } 
    });
  };

  const submitEditSubmenu = (parentPath, oldSubPath) => {
    const next = deepClone(menus);
    const parent = next.find((m) => m.path === parentPath);
    if (!parent || !Array.isArray(parent.children)) return;
    
    const idx = parent.children.findIndex((c) => c.path === oldSubPath);
    if (idx === -1) return;

    if (
      editSubForm.path !== oldSubPath &&
      parent.children.some((c) => c.path === editSubForm.path)
    ) {
      setMessage("Another submenu already uses this path ❌");
      return;
    }

    parent.children[idx] = { 
      ...parent.children[idx], 
      ...editSubForm,
      icon: editSubForm.icon.value ? editSubForm.icon : null
    };
    setMenus(next);
    setEditingSubKey(null);
    setMessage("Submenu updated (remember to Save) ✅");
  };

  const moveSubmenu = (parentPath, index, direction) => {
    const next = deepClone(menus);
    const parent = next.find((m) => m.path === parentPath);
    if (!parent || !Array.isArray(parent.children)) return;
    
    const target = index + direction;
    if (target < 0 || target >= parent.children.length) return;
    
    [parent.children[index], parent.children[target]] = [
      parent.children[target],
      parent.children[index],
    ];
    
    setMenus(next);
  };

  // =====================================================
  //                    Navbar Handlers
  // =====================================================

  const handleAddNav = async () => {
    if (!navForm.title || !navForm.path) {
      setMessage("Title and path are required");
      return;
    }

    if (navItems.some(item => item.path === navForm.path)) {
      setMessage("Navbar item path already exists ❌");
      return;
    }

    const newItem = {
      title: navForm.title,
      path: navForm.path,
      icon: navForm.icon.value ? navForm.icon : null,
      children: []
    };

    setNavItems([...navItems, newItem]);
    setNavForm({ title: "", path: "", icon: { type: "url", value: "", alt_text: "" } });
    setMessage("Navbar item added (remember to Save) ✅");
  };

  const handleRemoveNav = async (path) => {
    try {
      await fetch(`${API_BASE_URL}/navbar/remove/${role}/${encodeURIComponent(path)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      setNavItems(navItems.filter(item => item.path !== path));
      setMessage("Navbar item removed ✅");
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove navbar item ❌");
    }
  };

  const startEditingNav = (item) => {
    setEditingNavSubKey(`nav::${item.path}`);
    setEditNavSubForm({ 
      title: item.title, 
      path: item.path, 
      icon: item.icon || { type: "url", value: "", alt_text: "" } 
    });
  };

  const handleEditNavSubmit = (oldPath) => {
    if (!editNavSubForm.title || !editNavSubForm.path) {
      setMessage("Title and path are required");
      return;
    }

    if (editNavSubForm.path !== oldPath && navItems.some(item => item.path === editNavSubForm.path)) {
      setMessage("Navbar item path already exists ❌");
      return;
    }

    const updatedNav = navItems.map(item => {
      if (item.path === oldPath) {
        return { ...item, ...editNavSubForm, icon: editNavSubForm.icon.value ? editNavSubForm.icon : null };
      }
      return item;
    });

    setNavItems(updatedNav);
    setEditingNavSubKey(null);
    setMessage("Navbar item updated (remember to Save) ✅");
  };

  const moveNav = (index, direction) => {
    const newNav = [...navItems];
    const target = index + direction;
    if (target < 0 || target >= newNav.length) return;
    [newNav[index], newNav[target]] = [newNav[target], newNav[index]];
    setNavItems(newNav);
  };

  const saveNavbarOrder = async () => {
  try {
    const payload = navItems.map((n) => ({
      title: n.title,
      path: n.path,
      icon: n.icon && n.icon.value ? {
        type: n.icon.type,
        value: n.icon.value,
        alt_text: n.icon.alt_text || ""
      } : null,
      children: Array.isArray(n.children)
        ? n.children.map((c) => ({
            title: c.title,
            path: c.path,
            icon: c.icon && c.icon.value ? {
              type: c.icon.type,
              value: c.icon.value,
              alt_text: c.icon.alt_text || ""
            } : null
          }))
        : [],
    }));
    
    console.log("Saving navbar payload:", JSON.stringify(payload, null, 2)); // Debug log
    
    const res = await fetch(`${API_BASE_URL}/navbar/save`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${user.token}` 
      },
      body: JSON.stringify({ role, items: payload }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Save failed:", errorText);
      throw new Error(`Failed to save navbar order: ${res.status} ${errorText}`);
    }
    
    setOriginalNav(navItems);
    setMessage("Navbar order saved ✅");
  } catch (err) {
    console.error("Save error:", err);
    setMessage("Failed to save navbar order ❌");
  }
};

  const cancelNavChanges = () => {
    setNavItems(originalNav);
    setMessage("Navbar changes canceled");
  };

  // ---------- Navbar Submenu CRUD ----------
  const toggleExpandNav = (path) => {
    setExpandedNav((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const promptAddNavSub = (parentPath) => {
    setNavSubForm({ parentPath, title: "", path: "", icon: { type: "url", value: "", alt_text: "" } });
    setExpandedNav((prev) => ({ ...prev, [parentPath]: true }));
  };

  const addNavSubmenu = (parentPath) => {
    if (!navSubForm.title || !navSubForm.path || navSubForm.parentPath !== parentPath) return;
    
    const next = deepClone(navItems);
    const parent = next.find((m) => m.path === parentPath);
    if (!parent) return;
    
    parent.children = parent.children || [];
    
    if (parent.children.some((c) => c.path === navSubForm.path)) {
      setMessage("Navbar submenu path already exists under this item ❌");
      return;
    }
    
    parent.children.push({
      title: navSubForm.title,
      path: navSubForm.path,
      icon: navSubForm.icon.value ? navSubForm.icon : null,
    });
    
    setNavItems(next);
    setNavSubForm({ parentPath: "", title: "", path: "", icon: { type: "url", value: "", alt_text: "" } });
    setMessage("Navbar submenu added (remember to Save) ✅");
  };

  const removeNavSubmenu = async (parentPath, subPath) => {
    try {
      await fetch(`${API_BASE_URL}/navbar/remove/${role}/${encodeURIComponent(subPath)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      const next = deepClone(navItems);
      const parent = next.find((m) => m.path === parentPath);
      if (!parent || !Array.isArray(parent.children)) return;
      
      parent.children = parent.children.filter((c) => c.path !== subPath);
      setNavItems(next);
      setMessage("Navbar submenu removed ✅");
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove navbar submenu ❌");
    }
  };

  const startEditingNavSub = (parentPath, sub) => {
    setEditingNavSubKey(`${parentPath}::${sub.path}`);
    setEditNavSubForm({ 
      title: sub.title, 
      path: sub.path, 
      icon: sub.icon || { type: "url", value: "", alt_text: "" } 
    });
  };

  const submitEditNavSub = (parentPath, oldSubPath) => {
    const next = deepClone(navItems);
    const parent = next.find((m) => m.path === parentPath);
    if (!parent || !Array.isArray(parent.children)) return;
    
    const idx = parent.children.findIndex((c) => c.path === oldSubPath);
    if (idx === -1) return;

    if (
      editNavSubForm.path !== oldSubPath &&
      parent.children.some((c) => c.path === editNavSubForm.path)
    ) {
      setMessage("Another navbar submenu already uses this path ❌");
      return;
    }

    parent.children[idx] = { 
      ...parent.children[idx], 
      ...editNavSubForm,
      icon: editNavSubForm.icon.value ? editNavSubForm.icon : null
    };
    setNavItems(next);
    setEditingNavSubKey(null);
    setMessage("Navbar submenu updated (remember to Save) ✅");
  };

  const moveNavSubmenu = (parentPath, index, direction) => {
    const next = deepClone(navItems);
    const parent = next.find((m) => m.path === parentPath);
    if (!parent || !Array.isArray(parent.children)) return;
    
    const target = index + direction;
    if (target < 0 || target >= parent.children.length) return;
    
    [parent.children[index], parent.children[target]] = [
      parent.children[target],
      parent.children[index],
    ];
    
    setNavItems(next);
  };

  // ---------------- UI Rendering ----------------

  const renderSubmenuEditor = (parent, children, isNavbar = false) => {
    const expandedMap = isNavbar ? expandedNav : expandedMenus;
    const setExpanded = isNavbar ? toggleExpandNav : toggleExpandMenu;
    const subForm = isNavbar ? navSubForm : submenuForm;
    const setSubForm = isNavbar ? setNavSubForm : setSubmenuForm;
    const addSub = isNavbar ? addNavSubmenu : addSubmenu;
    const removeSub = isNavbar ? removeNavSubmenu : removeSubmenu;
    const moveSub = isNavbar ? moveNavSubmenu : moveSubmenu;
    const editKey = isNavbar ? editingNavSubKey : editingSubKey;
    const setEditKey = isNavbar ? setEditingNavSubKey : setEditingSubKey;
    const editFormLocal = isNavbar ? editNavSubForm : editSubForm;
    const setEditFormLocal = isNavbar ? setEditNavSubForm : setEditSubForm;
    const submitEditLocal = isNavbar ? submitEditNavSub : submitEditSubmenu;

    return (
      <div className="submenu-container">
        <button 
          className="btn-toggle"
          onClick={() => setExpanded(parent.path)}
        >
          {expandedMap[parent.path] ? "▾ Hide submenus" : "▸ Show submenus"}
        </button>

        {expandedMap[parent.path] && (
          <>
            {/* Existing submenus */}
            <ul className="submenu-list">
              {(children || []).map((sub, idx) => {
                const key = `${parent.path}::${sub.path}`;
                const isEditing = editKey === key;
                return (
                  <li key={key} className="submenu-item">
                    {isEditing ? (
                      <div className="edit-form">
                        <input
                          className="form-input"
                          value={editFormLocal.title}
                          onChange={(e) => setEditFormLocal({ ...editFormLocal, title: e.target.value })}
                          placeholder="Submenu title"
                        />
                        <input
                          className="form-input"
                          value={editFormLocal.path}
                          onChange={(e) => setEditFormLocal({ ...editFormLocal, path: e.target.value })}
                          placeholder="Submenu path"
                        />
                        
                        <IconForm 
                          icon={editFormLocal.icon}
                          onIconChange={(newIcon) => setEditFormLocal({ ...editFormLocal, icon: newIcon })}
                        />
                        
                        <button 
                          className="btn-save"
                          onClick={() => submitEditLocal(parent.path, sub.path)}
                        >Save</button>
                        <button 
                          className="btn-cancel"
                          onClick={() => setEditKey(null)}
                        >Cancel</button>
                      </div>
                    ) : (
                      <div className="submenu-display">
                        <span className="submenu-info">
                          {sub.icon && renderIconPreview(sub.icon)}
                          <span className="menu-title">{sub.title}</span>
                          <span className="menu-path">({sub.path})</span>
                          {sub.icon && sub.icon.alt_text && (
                            <span className="icon-alt">({sub.icon.alt_text})</span>
                          )}
                        </span>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit"
                            onClick={() => isNavbar ? startEditingNavSub(parent.path, sub) : startEditingSubmenu(parent.path, sub)}
                          >Edit</button>
                          <button 
                            className="btn-remove"
                            onClick={() => removeSub(parent.path, sub.path)}
                          >Remove</button>
                          <button 
                            className="btn-move"
                            onClick={() => moveSub(parent.path, idx, -1)}
                            disabled={idx === 0}
                          >↑</button>
                          <button 
                            className="btn-move"
                            onClick={() => moveSub(parent.path, idx, 1)}
                            disabled={idx === children.length - 1}
                          >↓</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Add submenu row */}
            {subForm.parentPath === parent.path ? (
              <div className="add-submenu-form">
                <input
                  className="form-input"
                  placeholder="Submenu Title"
                  value={subForm.title}
                  onChange={(e) => setSubForm({ ...subForm, title: e.target.value })}
                />
                <input
                  className="form-input"
                  placeholder="Submenu Path"
                  value={subForm.path}
                  onChange={(e) => setSubForm({ ...subForm, path: e.target.value })}
                />
                
                <IconForm 
                  icon={subForm.icon}
                  onIconChange={(newIcon) => setSubForm({ ...subForm, icon: newIcon })}
                />
                
                <button 
                  className="btn-add"
                  onClick={() => addSub(parent.path)}
                >Add</button>
                <button 
                  className="btn-cancel"
                  onClick={() => setSubForm({ parentPath: "", title: "", path: "", icon: { type: "url", value: "", alt_text: "" } })}
                >Cancel</button>
              </div>
            ) : (
              <button
                className="btn-add-submenu"
                onClick={() => isNavbar ? promptAddNavSub(parent.path) : promptAddSubmenu(parent.path)}
              >
                + Add Submenu
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="admin-menu-manager">
      <header className="manager-header">
        <h2>Menu & Navbar Manager</h2>
        
        <div className="role-selector">
          <label>Role: </label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="brand">Brand</option>
            <option value="influencer">Influencer</option>
          </select>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={activeTab === "sidebar" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("sidebar")}
        >
          Sidebar Menu
        </button>
        <button 
          className={activeTab === "navbar" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("navbar")}
        >
          Navbar Items
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Sidebar Section */}
      {activeTab === "sidebar" && (
        <section className="manager-section">
          <h3>Sidebar Menu Management</h3>
          
          <div className="add-item-form">
            <h4>Add New Menu Item</h4>
            <div className="form-grid">
              <input
                className="form-input"
                placeholder="Title *"
                value={menuForm.title}
                onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Path *"
                value={menuForm.path}
                onChange={(e) => setMenuForm({ ...menuForm, path: e.target.value })}
              />
              
              <IconForm 
                icon={menuForm.icon}
                onIconChange={(newIcon) => setMenuForm({ ...menuForm, icon: newIcon })}
              />
              
              <button 
                className="btn-primary"
                onClick={handleAddMenu}
                disabled={iconUploading}
              >
                {iconUploading ? "Uploading..." : "Add Menu"}
              </button>
            </div>
          </div>

          <div className="items-list">
            <div className="list-header">
              <h4>Existing Menu Items</h4>
              <div className="list-actions">
                <button 
                  className="btn-save"
                  onClick={saveMenuOrder}
                >Save Order</button>
                <button 
                  className="btn-secondary"
                  onClick={cancelMenuChanges}
                >Cancel Changes</button>
              </div>
            </div>
            
            {menus.length === 0 ? (
              <p className="no-items">No menu items found</p>
            ) : (
              <ul className="items-container">
                {menus.map((menu, i) => (
                  <li key={menu.path} className="menu-item">
                    <div className="item-header">
                      {editingSubKey === `menu::${menu.path}` ? (
                        <div className="edit-form">
                          <input
                            className="form-input"
                            value={editSubForm.title}
                            onChange={(e) => setEditSubForm({ ...editSubForm, title: e.target.value })}
                            placeholder="Title"
                          />
                          <input
                            className="form-input"
                            value={editSubForm.path}
                            onChange={(e) => setEditSubForm({ ...editSubForm, path: e.target.value })}
                            placeholder="Path"
                          />
                          
                          <IconForm 
                            icon={editSubForm.icon}
                            onIconChange={(newIcon) => setEditSubForm({ ...editSubForm, icon: newIcon })}
                          />
                          
                          <button 
                            className="btn-save"
                            onClick={() => handleEditMenuSubmit(menu.path)}
                          >Save</button>
                          <button 
                            className="btn-cancel"
                            onClick={() => setEditingSubKey(null)}
                          >Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className="item-info">
                            {menu.icon && renderIconPreview(menu.icon)}
                            <span className="menu-title">{menu.title}</span>
                            <span className="menu-path">{menu.path}</span>
                            {menu.icon && menu.icon.alt_text && (
                              <span className="icon-alt">({menu.icon.alt_text})</span>
                            )}
                          </div>
                          <div className="item-actions">
                            <button 
                              className="btn-toggle"
                              onClick={() => toggleExpandMenu(menu.path)}
                            >
                              {expandedMenus[menu.path] ? "▾" : "▸"}
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => startEditingMenu(menu)}
                            >Edit</button>
                            <button 
                              className="btn-remove"
                              onClick={() => handleRemoveMenu(menu.path)}
                            >Remove</button>
                            <button 
                              className="btn-move"
                              onClick={() => moveMenu(i, -1)}
                              disabled={i === 0}
                            >↑</button>
                            <button 
                              className="btn-move"
                              onClick={() => moveMenu(i, 1)}
                              disabled={i === menus.length - 1}
                            >↓</button>
                          </div>
                        </>
                      )}
                    </div>

                    {renderSubmenuEditor(menu, menu.children, false)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Navbar Section */}
      {activeTab === "navbar" && (
        <section className="manager-section">
          <h3>Navbar Management</h3>
          
          <div className="add-item-form">
            <h4>Add New Navbar Item</h4>
            <div className="form-grid">
              <input
                className="form-input"
                placeholder="Title *"
                value={navForm.title}
                onChange={(e) => setNavForm({ ...navForm, title: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Path *"
                value={navForm.path}
                onChange={(e) => setNavForm({ ...navForm, path: e.target.value })}
              />
              
              <IconForm 
                icon={navForm.icon}
                onIconChange={(newIcon) => setNavForm({ ...navForm, icon: newIcon })}
              />
              
              <button 
                className="btn-primary"
                onClick={handleAddNav}
                disabled={iconUploading}
              >
                {iconUploading ? "Uploading..." : "Add Item"}
              </button>
            </div>
          </div>

          <div className="items-list">
            <div className="list-header">
              <h4>Existing Navbar Items</h4>
              <div className="list-actions">
                <button 
                  className="btn-save"
                  onClick={saveNavbarOrder}
                >Save Order</button>
                <button 
                  className="btn-secondary"
                  onClick={cancelNavChanges}
                >Cancel Changes</button>
              </div>
            </div>
            
            {navItems.length === 0 ? (
              <p className="no-items">No navbar items found</p>
            ) : (
              <ul className="items-container">
                {navItems.map((item, i) => (
                  <li key={item.path} className="menu-item">
                    <div className="item-header">
                      {editingNavSubKey === `nav::${item.path}` ? (
                        <div className="edit-form">
                          <input
                            className="form-input"
                            value={editNavSubForm.title}
                            onChange={(e) => setEditNavSubForm({ ...editNavSubForm, title: e.target.value })}
                            placeholder="Title"
                          />
                          <input
                            className="form-input"
                            value={editNavSubForm.path}
                            onChange={(e) => setEditNavSubForm({ ...editNavSubForm, path: e.target.value })}
                            placeholder="Path"
                          />
                          
                          <IconForm 
                            icon={editNavSubForm.icon}
                            onIconChange={(newIcon) => setEditNavSubForm({ ...editNavSubForm, icon: newIcon })}
                          />
                          
                          <button 
                            className="btn-save"
                            onClick={() => handleEditNavSubmit(item.path)}
                          >Save</button>
                          <button 
                            className="btn-cancel"
                            onClick={() => setEditingNavSubKey(null)}
                          >Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className="item-info">
                            {item.icon && renderIconPreview(item.icon)}
                            <span className="menu-title">{item.title}</span>
                            <span className="menu-path">{item.path}</span>
                            {item.icon && item.icon.alt_text && (
                              <span className="icon-alt">({item.icon.alt_text})</span>
                            )}
                          </div>
                          <div className="item-actions">
                            <button 
                              className="btn-toggle"
                              onClick={() => toggleExpandNav(item.path)}
                            >
                              {expandedNav[item.path] ? "▾" : "▸"}
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => startEditingNav(item)}
                            >Edit</button>
                            <button 
                              className="btn-remove"
                              onClick={() => handleRemoveNav(item.path)}
                            >Remove</button>
                            <button 
                              className="btn-move"
                              onClick={() => moveNav(i, -1)}
                              disabled={i === 0}
                            >↑</button>
                            <button 
                              className="btn-move"
                              onClick={() => moveNav(i, 1)}
                              disabled={i === navItems.length - 1}
                            >↓</button>
                          </div>
                        </>
                      )}
                    </div>

                    {renderSubmenuEditor(item, item.children, true)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminMenuManager;