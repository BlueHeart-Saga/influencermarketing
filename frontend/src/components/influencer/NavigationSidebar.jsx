// frontend/src/components/influencer/NavigationSidebar.jsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Box,
  Typography,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Search,
  Analytics,
  CompareArrows,
  Settings,
  Help,
  YouTube
} from '@mui/icons-material';

const NavigationSidebar = ({ mobileOpen, onDrawerToggle, activeView, onViewChange, isMobile }) => {
  const menuItems = [
    { label: 'Dashboard', value: 'search', icon: Dashboard },
    { label: 'Search Results', value: 'results', icon: Search },
    { label: 'Advanced Analytics', value: 'analytics', icon: Analytics },
    { label: 'Batch Analysis', value: 'batch', icon: CompareArrows },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <YouTube sx={{ color: 'red', fontSize: 32 }} />
        <Typography variant="h6" noWrap fontWeight="bold">
          Influencer Pro
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton
              selected={activeView === item.value}
              onClick={() => onViewChange(item.value)}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default NavigationSidebar;