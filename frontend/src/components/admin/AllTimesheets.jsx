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
  Box,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const AllTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({
    user: 'all',
    project: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [projects, setProjects] = useState([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all timesheets
        const timesheetsResponse = await fetch('/admin/timesheets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!timesheetsResponse.ok) {
          if (timesheetsResponse.status === 403) {
            throw new Error('You do not have permission to access this resource');
          }
          throw new Error('Failed to fetch timesheets');
        }
        
        const timesheetsData = await timesheetsResponse.json();
        setTimesheets(timesheetsData || []);
        setFilteredTimesheets(timesheetsData || []);
        
        // Extract unique projects
        const uniqueProjects = [...new Set(timesheetsData.map(ts => ts.project))];
        setProjects(uniqueProjects);
        
        // Fetch users for filtering
        const usersResponse = await fetch('/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const usersData = await usersResponse.json();
        setUsers(usersData || []);
        
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters when filter or timesheets change
  useEffect(() => {
    let result = [...timesheets];
    
    if (filter.user !== 'all') {
      result = result.filter(ts => ts.user_id === parseInt(filter.user));
    }
    
    if (filter.project !== 'all') {
      result = result.filter(ts => ts.project === filter.project);
    }
    
    // Add date filtering
    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom);
      result = result.filter(ts => new Date(ts.date) >= fromDate);
    }
    
    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo);
      // Set time to end of day to include the end date
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(ts => new Date(ts.date) <= toDate);
    }
    
    setFilteredTimesheets(result);
  }, [filter, timesheets]);
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openExportDialog = () => {
    setExportSettings({
      dateFrom: filter.dateFrom || '',
      dateTo: filter.dateTo || ''
    });
    setExportDialogOpen(true);
  };

  const handleExportSettingChange = (event) => {
    const { name, value } = event.target;
    setExportSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportTimesheets = async (exportAll = false) => {
    try {
      const token = localStorage.getItem('token');
      let url = '/admin/export/timesheet?';
      
      if (exportAll) {
        url += 'export_all=true';
        
        // Use export dialog settings for date range when exporting all
        if (exportSettings.dateFrom) {
          url += `&date_from=${exportSettings.dateFrom}`;
        }
        if (exportSettings.dateTo) {
          url += `&date_to=${exportSettings.dateTo}`;
        }
        
        setExportDialogOpen(false);
      } else if (filter.user !== 'all') {
        url += `user_id=${filter.user}`;
        
        // Use regular filter settings for date range when exporting single user
        if (filter.dateFrom) {
          url += `&date_from=${filter.dateFrom}`;
        }
        if (filter.dateTo) {
          url += `&date_to=${filter.dateTo}`;
        }
      } else {
        throw new Error('Please select a user or use "Export All"');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export timesheets');
      }

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'timesheets.xlsx';

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        All Timesheet Entries
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Filter by User"
            name="user"
            value={filter.user}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Users</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.username}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Filter by Project"
            name="project"
            value={filter.project}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project} value={project}>
                {project}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="From Date"
            name="dateFrom"
            type="date"
            value={filter.dateFrom}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="To Date"
            name="dateTo"
            type="date"
            value={filter.dateTo}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonGroup variant="outlined">
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => exportTimesheets(false)}
            disabled={filter.user === 'all'}
          >
            Export Selected User
          </Button>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={openExportDialog}
          >
            Export All Users
          </Button>
        </ButtonGroup>
      </Box>
      
      {filteredTimesheets.length === 0 ? (
        <Alert severity="info">
          No timesheet entries found with the selected filters.
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTimesheets.map((timesheet) => {
                const user = users.find(u => u.id === timesheet.user_id);
                return (
                  <TableRow key={timesheet.id}>
                    <TableCell>{user ? user.username : `User ${timesheet.user_id}`}</TableCell>
                    <TableCell>{timesheet.date}</TableCell>
                    <TableCell>{timesheet.project}</TableCell>
                    <TableCell>{timesheet.hours}</TableCell>
                    <TableCell>{timesheet.description}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export All Timesheets</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select date range for exporting all users' timesheets
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Date"
                name="dateFrom"
                type="date"
                value={exportSettings.dateFrom}
                onChange={handleExportSettingChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="To Date"
                name="dateTo"
                type="date"
                value={exportSettings.dateTo}
                onChange={handleExportSettingChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => exportTimesheets(true)}
            variant="contained"
            startIcon={<FileDownloadIcon />}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AllTimesheets;