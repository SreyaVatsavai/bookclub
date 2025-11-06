// src/components/books/BookDetail.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  TextField,
  MenuItem,
} from '@mui/material';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BookDetail({ bookId, onBack }) {
  const [book, setBook] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${bookId}/`);
        setBook(res.data);
      } catch (err) {
        console.error('Failed to load book', err);
        onBack();
      }
    };
    fetchBook();
  }, [bookId, onBack]);

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join/`);
      alert('Joined group successfully!');
      navigate('/'); // go to home/dashboard
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join group');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || !startDate || !endDate) {
      alert('Please fill all group fields');
      return;
    }
    try {
      await api.post('/groups/', {
        name: groupName,
        book: bookId,
        start_date: startDate,
        end_date: endDate,
      });
      alert('Group created successfully!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create group');
    }
  };

  if (!book) return <Typography>Loading book details...</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Button onClick={onBack} sx={{ mb: 2 }}>
        ← Back to Search
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>{book.title}</Typography>
          <Typography variant="body1" color="text.secondary">by {book.author}</Typography>
          <Typography sx={{ mt: 1 }}>{book.description}</Typography>
          <Typography sx={{ mt: 2 }}>
            <strong>Genre:</strong> {book.genre} | <strong>Chapters:</strong> {book.total_chapters}
          </Typography>
        </CardContent>
      </Card>

      {/* Available Groups */}
      <Typography variant="h6" sx={{ mb: 2 }}>Available Groups ({book.available_groups.length})</Typography>
      {book.available_groups.length === 0 ? (
        <Typography>No groups available for this book.</Typography>
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
                  >
                    Join
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

      {/* Create Your Own Group */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Create Your Own Group</Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          size="small"
        />
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleCreateGroup}
          disabled={!user}
        >
          Create Group
        </Button>
      </Box>
    </Box>
  );
}