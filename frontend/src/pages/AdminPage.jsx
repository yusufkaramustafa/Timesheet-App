import React, { useState } from 'react';
import { Container, Grid, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import UsersList from '../components/admin/UsersList';
import AllTimesheets from '../components/admin/AllTimesheets';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Users" />
            <Tab label="All Timesheets" />
          </Tabs>
        </Paper>
        
        {activeTab === 0 && (
          <UsersList />
        )}
        
        {activeTab === 1 && (
          <AllTimesheets />
        )}
      </Box>
    </Container>
  );
};

export default AdminPage;