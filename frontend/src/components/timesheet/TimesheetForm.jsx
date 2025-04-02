import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress 
} from '@mui/material';
import { format } from 'date-fns';

const TimesheetForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    project: '',
    hours: '',
    description: ''
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch project options when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/timesheet/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load project options');
      }
    };
    
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Format the date as YYYY-MM-DD
      const formattedDate = format(formData.date, 'yyyy-MM-dd');
      
      const response = await fetch('/timesheet/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          date: formattedDate
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create timesheet entry');
      }
      
      // Clear form data
      setFormData({
        date: new Date(),
        project: '',
        hours: '',
        description: ''
      });
      
      setSuccess('Timesheet entry created successfully!');
      
      // Notify parent component if callback provided
      if (onSubmitSuccess) {
        onSubmitSuccess(data.timesheet);
      }
    } catch (err) {
      console.error('Error creating timesheet:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        New Timesheet Entry
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="date"
              label="Date"
              name="date"
              type="date"
              value={format(formData.date, 'yyyy-MM-dd')}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                handleDateChange(newDate);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="project-label">Project</InputLabel>
              <Select
                labelId="project-label"
                id="project"
                name="project"
                value={formData.project}
                label="Project"
                onChange={handleChange}
              >
                {projects.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="hours"
              label="Hours"
              name="hours"
              type="number"
              inputProps={{ step: "0.5", min: "0", max: "24" }}
              value={formData.hours}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TimesheetForm;