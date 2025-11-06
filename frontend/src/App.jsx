// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BookSearch from './pages/BookSearch.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import DiscussionForum from './pages/DiscussionForum.jsx';
import GroupView from './pages/GroupView.jsx';

// ✅ Define the theme
const theme = createTheme({
  // You can customize the theme here later (palette, typography, etc.)
  // For now, just use the default MUI theme
});

function App() {
  return (
    <ThemeProvider theme={theme}> {/* ✅ Now `theme` is defined */}
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/books" element={<PrivateRoute><BookSearch /></PrivateRoute>} />
            <Route path="/books/:id" element={<PrivateRoute><BookDetailPage /></PrivateRoute>} />
            <Route path="/groups/:groupId/discussion" element={<PrivateRoute><DiscussionForum /></PrivateRoute>} />
            <Route path="/groups/:groupId/view" element={<PrivateRoute><GroupView /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;