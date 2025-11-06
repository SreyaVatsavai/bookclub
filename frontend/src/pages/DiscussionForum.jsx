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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
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

  const handleStartReply = (postId) => {
    setReplyingTo(postId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const handleSubmitReply = async (postId) => {
    if (!replyContent.trim()) return;
    try {
      // Try to send reply to backend. Endpoint may vary; adjust if needed.
      const res = await api.post(`/groups/${groupId}/discussion/${postId}/comments/`, {
        content: replyContent.trim(),
      });

      const returned = res.data;

      // If backend returned the full post (with comments), replace the post in state.
      if (returned && Array.isArray(returned.comments)) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? returned : p)));
      } else {
        // Fallback: server returned only the created comment — append it
        const createdComment = returned;
        setPosts((prev) => prev.map((p) => {
          if (p.id !== postId) return p;
          const comments = Array.isArray(p.comments) ? [...p.comments] : [];
          comments.push(createdComment);
          return { ...p, comments };
        }));
      }

      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Reply creation error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to submit reply';
      alert(`Error: ${errorMsg}`);
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
                      {/* Comments */}
                      {post.comments && post.comments.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {post.comments.length} comment(s)
                          </Typography>
                          {post.comments.map((c) => (
                            <Paper key={c.id} sx={{ p: 1, mb: 1, bgcolor: 'background.paper' }} elevation={0}>
                              <Typography variant="caption" color="text.secondary">
                                {c.author_name} • {new Date(c.created_at).toLocaleString()}
                              </Typography>
                              <Typography variant="body2">{c.content}</Typography>
                            </Paper>
                          ))}
                        </Box>
                      )}
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleStartReply(post.id)}
                      >
                        Reply
                      </Button>

                      {replyingTo === post.id && (
                        <Paper sx={{ p: 1, mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder={`Reply to ${post.author_name}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                          />
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button variant="contained" size="small" onClick={() => handleSubmitReply(post.id)}>Send Reply</Button>
                            <Button variant="outlined" size="small" onClick={handleCancelReply}>Cancel</Button>
                          </Box>
                        </Paper>
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