// src/components/books/BookCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

export default function BookCard({ book, onSelect }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
        <Typography variant="h6" component="div">
          {book.title}
        </Typography>
        <Typography color="text.secondary">
          by {book.author}
        </Typography>
      </CardContent>
      <Button
        size="small"
        variant="outlined"
        onClick={onSelect}
        sx={{ m: 2, mt: 1 }}
      >
        View Details
      </Button>
    </Card>
  );
}