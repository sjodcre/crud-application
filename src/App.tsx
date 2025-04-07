import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import CrudPage from './pages/CrudPage'
import EditPostPage from './pages/edit/[id]'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CrudPage />} />
        <Route path="/edit/:id" element={<EditPostPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
