import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAsgardeo } from '@asgardeo/react'

const API = import.meta.env.VITE_API_BASE_URL

const Body1 = () => {
  const { getAccessToken } = useAsgardeo()
  const [puppies, setPuppies] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', breed: '', age: '' })

  useEffect(() => {
    fetchPuppies()
  }, [])

  // gets token and returns axios headers
  const authHeaders = async () => {
    const token = await getAccessToken()
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchPuppies = async () => {
    const config = await authHeaders()
    const res = await axios.get(`${API}/puppies`, config)
    setPuppies(res.data)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    const config = await authHeaders()
    await axios.post(`${API}/puppies`, formData, config)
    fetchPuppies()
    resetForm()
  }

  const handleUpdate = async () => {
    const config = await authHeaders()
    await axios.put(`${API}/puppies/${editingId}`, formData, config)
    fetchPuppies()
    resetForm()
  }

  const handleDelete = async (id) => {
    const config = await authHeaders()
    await axios.delete(`${API}/puppies/${id}`, config)
    fetchPuppies()
  }

  const handleEditClick = (puppy) => {
    setEditingId(puppy.id)
    setFormData({ name: puppy.name, breed: puppy.breed, age: puppy.age })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ name: '', breed: '', age: '' })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="body-container">
      <h2>Puppy Manager</h2>

      <button className="add-btn" onClick={() => { resetForm(); setShowForm(true) }}>
        + Add Puppy
      </button>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Puppy' : 'Add New Puppy'}</h3>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
          <input name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} />
          <input name="age" placeholder="Age" type="number" value={formData.age} onChange={handleChange} />
          <div>
            <button className="save-btn" onClick={editingId ? handleUpdate : handleAdd}>
              {editingId ? 'Update' : 'Save'}
            </button>
            <button className="cancel-btn" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      <table className="puppy-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Breed</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {puppies.map((puppy) => (
            <tr key={puppy.id}>
              <td>{puppy.id}</td>
              <td>{puppy.name}</td>
              <td>{puppy.breed}</td>
              <td>{puppy.age}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEditClick(puppy)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(puppy.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Body1