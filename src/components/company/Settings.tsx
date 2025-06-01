"use client";

import React, { useEffect, useState } from 'react';

interface Company {
  id: number;
  companyName: string;
  createdAt?: string; // добавяме createdAt като опционално поле
}

const API_URL = 'http://localhost:8080/company'; // смени порта, ако бекендът е на друг

const Settings: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompany, setNewCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Вземи токена от localStorage
  const getToken = () => localStorage.getItem('authToken'); // използвай 'authToken'

  // Зареждане на всички компании
  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Грешка при зареждане на компаниите');
      const data = await res.json();
      // Гарантирай, че companies винаги е масив
      let companiesArr: Company[] = [];
      if (Array.isArray(data)) {
        companiesArr = data;
      } else if (data && Array.isArray(data.payload)) {
        companiesArr = data.payload;
      }
      setCompanies(companiesArr);
      if (companiesArr.length > 0) {
        console.log('Company sample:', companiesArr[0]);
      }
    } catch (e: any) {
      setError(e.message);
      setCompanies([]); // при грешка - празен масив
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Добавяне на нова компания
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companyName: newCompany })
      });
      if (!res.ok) throw new Error('Грешка при добавяне');
      setNewCompany('');
      fetchCompanies();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Триене на компания
  const handleDelete = async (id: number) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Грешка при триене');
      fetchCompanies();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h2>Компании</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <form onSubmit={handleAdd} style={{marginBottom:16}}>
        <input
          type="text"
          value={newCompany}
          onChange={e => setNewCompany(e.target.value)}
          placeholder="Име на компания"
          required
        />
        <button type="submit">Добави</button>
      </form>
      {loading ? <p>Зареждане...</p> : (
        <table border={1} cellPadding={8} style={{minWidth:300}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Име</th>
              <th>Създадена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.companyName}</td>
                <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td>
                <td>
                  <button onClick={() => handleDelete(c.id)}>Изтрий</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Settings; 