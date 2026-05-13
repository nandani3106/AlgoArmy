import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50 to-amber-50">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
