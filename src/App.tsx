import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminPage from './pages/Admin';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
