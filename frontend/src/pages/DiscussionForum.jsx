// src/pages/DiscussionForum.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import NavBar from '../components/layout/NavBar';

export default function DiscussionForum() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/discussion/`);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load discussion', err);
      alert('You must be a group member to view this forum');
      navigate('/'); // Go back to dashboard
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchPosts();
  }, [groupId]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await api.post(`/groups/${groupId}/discussion/`, {
        content: newPost.trim(),
        chapter: null, // optional for MVP
      });
      // console.log('Sending payload:', payload);
      setPosts([res.data, ...posts]); // optimistic update
      setNewPost('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.content || 'Failed to post';
      alert(`Error: ${errorMsg}`);
      console.error('Post creation error:', err);
    }
  };

  if (loading) return <Typography>Loading discussion...</Typography>;

  return (
    <>
      <NavBar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Group Discussion
        </Typography>

        {/* New Post Form */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share your thoughts on the book..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={handleCreatePost}
          >
            Post
          </Button>
        </Paper>

        {/* Posts List */}
        <List>
          {posts.map((post) => (
            <React.Fragment key={post.id}>
              <ListItem alignItems="flex-start">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {post.author_name[0].toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {post.author_name}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </Typography>
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {post.content}
                      </Typography>
                      {/* Comments (MVP: just show count) */}
                      {post.comments && post.comments.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {post.comments.length} comment(s)
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </>
  );
}