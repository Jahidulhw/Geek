import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Search from './pages/Search'
import DrugInfo from './pages/DrugInfo'
import InteractionChecker from './pages/InteractionChecker'
import MyMeds from './pages/MyMeds'
import styles from './App.module.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className={styles.main}>
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/search"       element={<Search />} />
            <Route path="/drug/:id"     element={<DrugInfo />} />
            <Route path="/interactions" element={<InteractionChecker />} />
            <Route path="/my-meds"      element={<MyMeds />} />
          </Routes>
        </main>
        <BottomNav />
      </Router>
    </AuthProvider>
  )
}

export default App
