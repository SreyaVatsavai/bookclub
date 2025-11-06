// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Grid,
  Container,
  Button,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import NavBar from '../components/layout/NavBar';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const groupRes = await api.get('/groups/');
        setGroups(groupRes.data);

        const newReminders = groupRes.data
          .map((group) => {
            const today = new Date();
            const startDate = new Date(group.start_date);
            const endDate = new Date(group.end_date);
            const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
            const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
            if (elapsedDays > 0 && elapsedDays > totalDays) {
              return {
                groupId: group.id,
                message: `⚠️ Group "${group.name}" is behind schedule! Aim to finish by ${group.end_date}.`,
              };
            }
            return null;
          })
          .filter(Boolean);

        setReminders(newReminders);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) return <Typography>Loading your dashboard...</Typography>;

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.username}!
        </Typography>

        {/* Smart Reminders */}
        {reminders.length > 0 && (
          <Box sx={{ mb: 4 }}>
            {reminders.map((r, i) => (
              <Alert key={i} severity="warning" sx={{ mb: 1 }}>
                {r.message}
              </Alert>
            ))}
          </Box>
        )}

        <Grid container spacing={4}>
          {/* Left: Groups */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Your Reading Groups
              </Typography>
              {groups.length === 0 ? (
                <Typography>No groups yet. Join or create one!</Typography>
              ) : (
                <List>
                  {groups.map((group) => (
                    <React.Fragment key={group.id}>
                          <ListItem
                            secondaryAction={
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/groups/${group.id}/view`)}
                                sx={{ minWidth: 64 }}
                              >
                                View
                              </Button>
                            }
                          >
                            <ListItemText
                              primary={group.name}
                              secondary={`${group.book_title} • ${group.start_date} to ${group.end_date}`}
                              sx={{ pr: 10 }}
                            />
                          </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Right: Progress + Search Button at BOTTOM */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reading Progress
              </Typography>
              {groups.length === 0 ? (
                <Typography>Start a group to track your progress!</Typography>
              ) : (
                groups.map((group) => {
                  const today = new Date();
                  const startDate = new Date(group.start_date);
                  const endDate = new Date(group.end_date);
                  const totalDays = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
                  const elapsedDays = Math.max(0, (today - startDate) / (1000 * 60 * 60 * 24));
                  const progress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
                  // make group names clickable:
                  return (
                    <Box key={group.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" component={Link} to={`/groups/${group.id}/discussion`}>
                        {group.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {progress}% of schedule completed
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ mt: 1, mb: 1 }}
                      />
                      <Typography variant="body2">
                        Target: Finish by {group.end_date}
                      </Typography>
                    </Box>
                  );
                })
              )}

              {/* ✅ BUTTON MOVED TO BOTTOM */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/books')}
                >
                  Search Books
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}