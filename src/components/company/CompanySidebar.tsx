"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUserRole } from '../../lib/authService';

const CompanySidebar: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  return (
    <nav style={{ width: 220, padding: 20, background: '#f3f3f3', height: '100vh' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {role === 'ADMIN' && (
          <>
            <li><Link href="/company-panel/employees">👥 Мои служители</Link></li>
            <li><Link href="/company-panel/settings">⚙️ Настройки на фирмата</Link></li>
          </>
        )}
        {role === 'MANAGER' && (
          <li><Link href="/company-panel/employees">👥 Мои служители</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default CompanySidebar; 