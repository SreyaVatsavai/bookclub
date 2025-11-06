import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import NavBar from '../components/layout/NavBar';

export default function GroupView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await api.get(`/groups/${groupId}/`);
        setGroup(res.data);
        // debug: log returned group data
        // eslint-disable-next-line no-console
        console.log('Fetched group:', res.data);
      } catch (err) {
        console.error('Failed to load group', err);
        setError(err.response?.data?.error || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  if (!group) return (
    <>
      <NavBar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">{error || "Group not found or you don't have access."}</Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
        </Box>
      </Box>
    </>
  );

  // Build full URL for cover image if backend returned a relative path
  const coverUrl = group.book_info?.cover_url;
  let coverSrc = null;
  if (coverUrl) {
    const isAbsolute = coverUrl.startsWith('http://') || coverUrl.startsWith('https://');
    const backendBase = api.defaults.baseURL.replace(/\/api\/?$/, '');
    coverSrc = isAbsolute ? coverUrl : `${backendBase}${coverUrl}`;
  }

  return (
    <>
      <NavBar />
      <Box sx={{ p: 3 }}>
        <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>← Back</Button>
        <Typography variant="h5" gutterBottom>{group.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {group.book_info?.title} by {group.book_info?.author}
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">Book Cover</Typography>
          {coverSrc ? (
            <Box sx={{ mt: 2 }}>
              <img src={coverSrc} alt="book cover" style={{ maxWidth: '200px' }} />
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ mt: 1 }}>No cover available</Typography>
          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Members ({group.members?.length || 0})</Typography>
          <List>
            {group.members?.map((m) => (
              <ListItem key={m.id}>
                <ListItemAvatar>
                  <Avatar>{m.username[0]?.toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={m.username} secondary={m.joined_at ? `Joined: ${new Date(m.joined_at).toLocaleDateString()}` : ''} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </>
  );
}
