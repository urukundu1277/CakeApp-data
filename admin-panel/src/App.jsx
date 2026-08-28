import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<div className="min-h-screen flex items-center justify-center">Login Page</div>} />
      </Routes>
    </Router>
  )
}

export default App
