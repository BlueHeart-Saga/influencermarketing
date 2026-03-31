// frontend/src/components/influencer/AdvancedFilters.jsx
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Divider,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Close,
  FilterList,
  TrendingUp,
  People,
  Visibility
} from '@mui/icons-material';

const AdvancedFilters = ({ filters, onFiltersChange, onApplyFilters }) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const subscriberMarks = [
    { value: 0, label: '0' },
    { value: 10000, label: '10K' },
    { value: 100000, label: '100K' },
    { value: 1000000, label: '1M' },
    { value: 10000000, label: '10M' }
  ];

  const engagementMarks = [
    { value: 0, label: '0%' },
    { value: 5, label: '5%' },
    { value: 10, label: '10%' },
    { value: 20, label: '20%' }
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      minSubscribers: 0,
      maxSubscribers: 10000000,
      engagementMin: 0,
      engagementMax: 100,
      category: '',
      contentType: '',
      sortBy: 'score',
      includeHiddenSubs: false
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <>
      {/* Filter Button */}
      <Button
        variant="outlined"
        startIcon={<FilterList />}
        onClick={() => setOpen(true)}
        sx={{ borderRadius: 3 }}
      >
        Advanced Filters
      </Button>

      {/* Filters Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 3 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            🔍 Advanced Filters
          </Typography>
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        {/* Subscriber Range */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People />
            Subscriber Range
          </Typography>
          <Slider
            value={[localFilters.minSubscribers, localFilters.maxSubscribers]}
            onChange={(e, newValue) => {
              handleFilterChange('minSubscribers', newValue[0]);
              handleFilterChange('maxSubscribers', newValue[1]);
            }}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
            min={0}
            max={10000000}
            step={1000}
            marks={subscriberMarks}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Min: ${localFilters.minSubscribers >= 1000000 ? `${(localFilters.minSubscribers/1000000).toFixed(1)}M` : localFilters.minSubscribers >= 1000 ? `${(localFilters.minSubscribers/1000).toFixed(0)}K` : localFilters.minSubscribers}`} 
              size="small" 
            />
            <Chip 
              label={`Max: ${localFilters.maxSubscribers >= 1000000 ? `${(localFilters.maxSubscribers/1000000).toFixed(1)}M` : localFilters.maxSubscribers >= 1000 ? `${(localFilters.maxSubscribers/1000).toFixed(0)}K` : localFilters.maxSubscribers}`} 
              size="small" 
            />
          </Box>
        </Paper>

        {/* Engagement Rate */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            Engagement Rate
          </Typography>
          <Slider
            value={localFilters.engagementMin}
            onChange={(e, newValue) => handleFilterChange('engagementMin', newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
            min={0}
            max={20}
            step={0.5}
            marks={engagementMarks}
            sx={{ mb: 2 }}
          />
          <Chip 
            label={`Min Engagement: ${localFilters.engagementMin}%`} 
            size="small" 
            color="primary"
            variant="outlined"
          />
        </Paper>

        {/* Content Category */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Content Category
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={localFilters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="tech">Technology</MenuItem>
              <MenuItem value="gaming">Gaming</MenuItem>
              <MenuItem value="beauty">Beauty & Fashion</MenuItem>
              <MenuItem value="lifestyle">Lifestyle</MenuItem>
              <MenuItem value="education">Education</MenuItem>
              <MenuItem value="entertainment">Entertainment</MenuItem>
              <MenuItem value="music">Music</MenuItem>
              <MenuItem value="sports">Sports</MenuItem>
              <MenuItem value="food">Food & Cooking</MenuItem>
              <MenuItem value="travel">Travel</MenuItem>
              <MenuItem value="fitness">Fitness & Health</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Content Type */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Content Type
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={localFilters.contentType}
              label="Content Type"
              onChange={(e) => handleFilterChange('contentType', e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="vlogs">Vlogs</MenuItem>
              <MenuItem value="tutorials">Tutorials</MenuItem>
              <MenuItem value="reviews">Reviews</MenuItem>
              <MenuItem value="gaming">Gaming</MenuItem>
              <MenuItem value="educational">Educational</MenuItem>
              <MenuItem value="entertainment">Entertainment</MenuItem>
              <MenuItem value="live">Live Streams</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Sort Options */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sort By
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={localFilters.sortBy}
              label="Sort By"
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <MenuItem value="score">Influencer Score</MenuItem>
              <MenuItem value="subscribers">Subscriber Count</MenuItem>
              <MenuItem value="engagement">Engagement Rate</MenuItem>
              <MenuItem value="views">Total Views</MenuItem>
              <MenuItem value="videos">Video Count</MenuItem>
              <MenuItem value="growth">Growth Potential</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Additional Options */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Options
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={localFilters.includeHiddenSubs}
                onChange={(e) => handleFilterChange('includeHiddenSubs', e.target.checked)}
              />
            }
            label="Include channels with hidden subscribers"
          />
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            fullWidth
            sx={{ borderRadius: 3 }}
          >
            Reset All
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            fullWidth
            sx={{ borderRadius: 3 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default AdvancedFilters;