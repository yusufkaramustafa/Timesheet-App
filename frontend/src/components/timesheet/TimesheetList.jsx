import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Button,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';

const TimesheetList = ({ refreshTrigger, onEdit }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    project: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  useEffect(() => {
    const fetchTimesheets = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/timesheet/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch timesheet data');
        }
        
        const data = await response.json();
        const timesheetData = data.timesheets || [];
        setTimesheets(timesheetData);
        setFilteredTimesheets(timesheetData);
        
        // Extract unique projects for filter dropdown
        const uniqueProjects = [...new Set(timesheetData.map(ts => ts.project))];
        setProjects(uniqueProjects);
        
        setError('');
      } catch (err) {
        console.error('Error fetching timesheets:', err);
        setError('Failed to load timesheet data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimesheets();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [filters, timesheets]);

  const applyFilters = () => {
    let result = [...timesheets];
    
    // Filter by project
    if (filters.project !== 'all') {
      result = result.filter(ts => ts.project === filters.project);
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(ts => new Date(ts.date) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      // Set time to end of day to include the end date
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(ts => new Date(ts.date) <= toDate);
    }
    
    // Filter by search term (in description)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(ts => 
        ts.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredTimesheets(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      project: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/timesheet/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete timesheet entry');
      }
      
      // Remove the deleted timesheet from state
      setTimesheets(prev => prev.filter(ts => ts.id !== id));
    } catch (err) {
      console.error('Error deleting timesheet:', err);
      setError('Failed to delete entry');
    }
  };

  if (loading && timesheets.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Your Timesheet Entries
        </Typography>
        <Button 
          startIcon={<FilterListIcon />} 
          onClick={() => setShowFilters(!showFilters)}
          color={showFilters ? "primary" : "inherit"}
        >
          Filters
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {showFilters && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Project"
                name="project"
                value={filters.project}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="From Date"
                name="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="To Date"
                name="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button variant="outlined" onClick={resetFilters} size="small">
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {filteredTimesheets.length === 0 ? (
        <Alert severity="info">
          {timesheets.length === 0 
            ? "You don't have any timesheet entries yet."
            : "No entries match your current filters."}
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTimesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>{timesheet.date}</TableCell>
                  <TableCell>{timesheet.project}</TableCell>
                  <TableCell>{timesheet.hours}</TableCell>
                  <TableCell>{timesheet.description}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => onEdit(timesheet)} 
                      aria-label="edit"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(timesheet.id)} 
                      aria-label="delete"
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default TimesheetList;