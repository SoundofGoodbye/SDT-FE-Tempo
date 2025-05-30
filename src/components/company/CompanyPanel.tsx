"use client";
import CompanySidebar from './CompanySidebar';

const CompanyPanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex' }}>
      <CompanySidebar />
       <div style={{ flex: 1, padding: 24 }}>{children}</div>
    </div>
  );
};

export default CompanyPanelLayout; 