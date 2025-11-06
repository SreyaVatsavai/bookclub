// src/pages/BookSearch.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import NavBar from '../components/layout/NavBar';

export default function BookSearch() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [books, setBooks] = useState([]);
  const [genres] = useState(['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Biography']);

  const handleSearch = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (genre) params.genre = genre;
      const res = await api.get('/books/', { params });
      setBooks(res.data);
    } catch (err) {
      console.error('Search failed', err);
      setBooks([]);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <>
      <NavBar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search Books
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search by title or author"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select value={genre} label="Genre" onChange={(e) => setGenre(e.target.value)}>
                <MenuItem value="">All Genres</MenuItem>
                {genres.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" onClick={handleSearch} sx={{ height: '100%' }}>
              Search
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography color="text.secondary">by {book.author}</Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    fullWidth
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}