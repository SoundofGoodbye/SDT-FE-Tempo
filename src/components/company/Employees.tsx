"use client";

import React, { useEffect, useState } from 'react';

interface Employee {
  id: number;
  createdAt?: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: number;
}

interface Company {
  id: number;
  companyName: string;
}

const API_URL = 'http://localhost:8080/users/delivers';
const REGISTER_URL = 'http://localhost:8080/users/userRegister';
const COMPANIES_URL = 'http://localhost:8080/company';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyId: '',
    role: ''
  });
  const [creating, setCreating] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [userCompanyId, setUserCompanyId] = useState<string>('');
  const [role, setRole] = useState<string>('');

  const getToken = () => {
    const token = localStorage.getItem('authToken');
    console.log('[LOG] getToken() ->', token);
    return token;
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      setRole(payload.roles && payload.roles[0] ? payload.roles[0] : '');
      if (payload.companyId) {
        setUserCompanyId(payload.companyId.toString());
        setForm(f => ({ ...f, companyId: payload.companyId.toString() }));
      }
    }
  }, []);

  useEffect(() => {
    if (role === 'MANAGER' && userCompanyId) {
      fetch(`http://localhost:8080/company/${userCompanyId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => setCompanyName(data.companyName || ''));
    }
  }, [role, userCompanyId]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Грешка при зареждане на служителите');
      const data = await res.json();
      let list = Array.isArray(data) ? data : (data.payload || []);
      if (role === 'MANAGER' && userCompanyId) {
        list = list.filter((e: Employee) => e.companyId?.toString() === userCompanyId);
      }
      setEmployees(list);
    } catch (e: any) {
      setError(e.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    if (role === 'MANAGER') return;
    try {
      const token = getToken();
      console.log('[LOG] fetchCompanies Authorization header:', token ? `Bearer ${token}` : 'NO TOKEN');
      const res = await fetch(COMPANIES_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Грешка при зареждане на компаниите');
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : (data.payload || []));
    } catch (e: any) {
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (role && role !== 'MANAGER') {
      fetchCompanies();
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const token = getToken();
      console.log('[LOG] handleCreate Authorization header:', token ? `Bearer ${token}` : 'NO TOKEN');
      const res = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          roleModel: { name: form.role },
          companyId: Number(role === 'MANAGER' ? userCompanyId : form.companyId)
        })
      });
      if (!res.ok) throw new Error('Грешка при създаване на служител');
      setForm({ firstName: '', lastName: '', email: '', password: '', companyId: '', role: '' });
      fetchEmployees();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете този служител?')) return;
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:8080/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Грешка при изтриване на служител');
      fetchEmployees();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h2>Мои служители (Delivers)</h2>
      {role === 'MANAGER' && companyName && (
        <div style={{marginBottom:8, fontWeight:'bold'}}>Компания: {companyName}</div>
      )}
      {error && <div style={{color:'red'}}>{error}</div>}
      <form onSubmit={handleCreate} style={{marginBottom:16, display:'flex', gap:8, alignItems:'center'}}>
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="Име"
          required
        />
        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Фамилия"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Парола"
          required
        />
        {role !== 'MANAGER' && (
          <select
            name="companyId"
            value={form.companyId}
            onChange={handleChange}
            required
          >
            <option value="">Избери компания</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        )}
        {role === 'MANAGER' && companyName && (
          <span style={{fontWeight:'bold'}}>{companyName}</span>
        )}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="">Избери роля</option>
          <option value="DELIVERY_GUY">Delivery Guy</option>
          <option value="MANAGER">Manager</option>
        </select>
        <button type="submit" disabled={creating}>{creating ? 'Създаване...' : 'Създай служител'}</button>
      </form>
      {loading ? <p>Зареждане...</p> : (
        <table border={1} cellPadding={8} style={{minWidth:400}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Създаден на</th>
              <th>Име</th>
              <th>Фамилия</th>
              <th>Email</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e: Employee) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.createdAt ? new Date(e.createdAt).toLocaleString() : '-'}</td>
                <td>{e.firstName}</td>
                <td>{e.lastName}</td>
                <td>{e.email}</td>
                <td>
                  <button onClick={() => handleDelete(e.id)} style={{color:'red'}}>Изтрий</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Employees; 