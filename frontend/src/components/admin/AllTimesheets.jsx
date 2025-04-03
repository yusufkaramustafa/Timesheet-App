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
  Grid
} from '@mui/material';

const AllTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({
    user: 'all',
    project: 'all'
  });
  const [projects, setProjects] = useState([]);

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
    
    setFilteredTimesheets(result);
  }, [filter, timesheets]);
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
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
      </Grid>
      
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
    </Paper>
  );
};

export default AllTimesheets;