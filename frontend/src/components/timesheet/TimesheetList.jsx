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
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';

const TimesheetList = ({ refreshTrigger, onEdit }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setTimesheets(data.timesheets || []);
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
      <Typography variant="h6" component="h2" gutterBottom>
        Your Timesheet Entries
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {timesheets.length === 0 ? (
        <Alert severity="info">
          You don't have any timesheet entries yet.
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
              {timesheets.map((timesheet) => (
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