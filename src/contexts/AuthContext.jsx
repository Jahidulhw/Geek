import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'geek_token'

const AuthContext = createContext(null)

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [meds, setMeds]   = useState([])

  const fetchMeds = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/meds`, { headers: authHeaders() })
      setMeds(data)
    } catch {
      setMeds([])
    }
  }, [])

  // Rehydrate session on load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }
    axios.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setUser(data.user)
        fetchMeds()
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [fetchMeds])

  async function login(email, password) {
    const { data } = await axios.post(`${API}/api/auth/login`, { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    fetchMeds()
    return data.user
  }

  async function signup(email, password, name) {
    const { data } = await axios.post(`${API}/api/auth/signup`, { email, password, name })
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    setMeds([])
    return data.user
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setMeds([])
  }

  async function addMed(drug) {
    const { data } = await axios.post(
      `${API}/api/meds`,
      { id: drug.id, brandName: drug.brandName, genericName: drug.genericName, manufacturer: drug.manufacturer },
      { headers: authHeaders() }
    )
    setMeds(data.meds)
    return data
  }

  async function removeMed(drugId) {
    const { data } = await axios.delete(
      `${API}/api/meds/${encodeURIComponent(drugId)}`,
      { headers: authHeaders() }
    )
    setMeds(data.meds)
  }

  const isSaved = (drugId) => meds.some(m => m.id === drugId)

  return (
    <AuthContext.Provider value={{ user, loading, meds, login, signup, logout, addMed, removeMed, isSaved }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
