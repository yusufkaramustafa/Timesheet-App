import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNewEntry = () => {
    navigate('/timesheet', { state: { openForm: true } });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Welcome to Timesheet App
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {new Date().toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={handleNewEntry}
                >
                  <Typography variant="h6">New Entry</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create new timesheet entry
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;