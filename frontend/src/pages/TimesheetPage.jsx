import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Typography, Box } from '@mui/material';
import TimesheetForm from '../components/timesheet/TimesheetForm';
import TimesheetList from '../components/timesheet/TimesheetList';

const TimesheetPage = () => {
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingTimesheet, setEditingTimesheet] = useState(null);

  useEffect(() => {
    // Handle navigation states
    if (location.state?.scrollToList) {
      const listElement = document.getElementById('timesheet-list');
      if (listElement) {
        listElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleSubmitSuccess = () => {
    // Trigger a refresh of the timesheet list
    setRefreshTrigger(prev => prev + 1);
    // Clear editing state
    setEditingTimesheet(null);
  };

  const handleEdit = (timesheet) => {
    setEditingTimesheet(timesheet);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Timesheet Management
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TimesheetForm 
              onSubmitSuccess={handleSubmitSuccess} 
              initialData={editingTimesheet}
            />
          </Grid>
          
          <Grid item xs={12} id="timesheet-list">
            <TimesheetList 
              refreshTrigger={refreshTrigger} 
              onEdit={handleEdit}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TimesheetPage;