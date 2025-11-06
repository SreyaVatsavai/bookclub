// src/pages/BookDetailPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Paper,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import NavBar from '../components/layout/NavBar';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}/`);
        setBook(res.data);
      } catch (err) {
        console.error('Failed to load book', err);
        navigate('/books');
      }
    };
    fetchBook();
  }, [id, navigate]);

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join/`);
      setSuccess('Successfully joined the group!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join group');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || !startDate || !endDate) {
      setError('Please fill all group fields');
      return;
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      await api.post('/groups/', {
        name: groupName,
        book: parseInt(id, 10),
        start_date: startDate,
        end_date: endDate,
      });
      setSuccess('Group created successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    }
  };

  if (!book) return <Typography>Loading book details...</Typography>;

  return (
    <>
      <NavBar />
      <Box sx={{ p: 3 }}>
        <Button onClick={() => navigate('/books')} sx={{ mb: 2 }}>
          ← Back to Books
        </Button>

        {/* Book Details */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              by {book.author}
            </Typography>
            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>
            <Typography>
              <strong>Genre:</strong> {book.genre} |{' '}
              <strong>Chapters:</strong> {book.total_chapters} |{' '}
              <strong>Pages:</strong> {book.total_pages}
            </Typography>
          </CardContent>
        </Card>

        {/* Alerts */}
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

        {/* Available Groups */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Available Groups ({book.available_groups.length})
          </Typography>
          {book.available_groups.length === 0 ? (
            <Typography>No groups available for this book (all full or none created).</Typography>
          ) : (
            <List>
              {book.available_groups.map((group) => (
                <React.Fragment key={group.id}>
                  <ListItem
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.is_full}
                      >
                        {group.is_full ? 'Full' : 'Join'}
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={group.name}
                      secondary={`Members: ${group.member_count}/10 • ${group.start_date} to ${group.end_date}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Create Your Own Group */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Create Your Own Group
          </Typography>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            margin="dense"
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            margin="dense"
          />
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            sx={{ mt: 2 }}
          >
            Create Group
          </Button>
        </Paper>
      </Box>
    </>
  );
}