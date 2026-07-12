'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลยอดขาย</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="var(--text-muted)" />
          <YAxis stroke="var(--text-muted)" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Bar dataKey="ยอดขาย" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
