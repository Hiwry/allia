import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div>
      <Sidebar />
      <div style={{ marginLeft: 220, padding: 24 }}>{children}</div>
    </div>
  );
}
