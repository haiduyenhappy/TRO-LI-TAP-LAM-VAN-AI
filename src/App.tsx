import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { IdeaMap } from './pages/IdeaMap';
import { Feedback } from './pages/Feedback';
import { Dashboard } from './pages/Dashboard';
import { Library } from './pages/Library';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/idea-map" element={<IdeaMap />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </Layout>
    </Router>
  );
}
