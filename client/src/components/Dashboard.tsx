import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { habitService } from '../services/api';

interface DashboardProps {
  userId: string;
  refreshTrigger?: any;
}

const customTooltipStyle = {
  backgroundColor: '#0a0e27',
  border: '1px solid rgba(96, 165, 250, 0.15)',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(12px)',
};

const Dashboard: React.FC<DashboardProps> = ({ userId, refreshTrigger }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await habitService.getAnalytics(userId);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    fetchAnalytics();
  }, [userId, refreshTrigger]);

  return (
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card glass-card chart-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }} />
          Consistency (Last 30 Days)
        </h3>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis
                dataKey="_id"
                stroke="rgba(148, 163, 184, 0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }}
              />
              <YAxis
                stroke="rgba(148, 163, 184, 0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={customTooltipStyle}
                itemStyle={{ color: '#94a3b8', fontSize: '0.875rem' }}
                formatter={(value: any) => [`${value} completions`, '']}
                cursor={{ stroke: 'rgba(96, 165, 250, 0.15)', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0a0e27', stroke: '#60a5fa', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#bfdbfe', stroke: '#60a5fa', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card glass-card chart-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
          Daily Completions
        </h3>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis
                dataKey="_id"
                stroke="rgba(148, 163, 184, 0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }}
              />
              <YAxis
                stroke="rgba(148, 163, 184, 0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={customTooltipStyle}
                cursor={{ fill: 'rgba(96, 165, 250, 0.05)' }}
                formatter={(value: any) => [`${value} completions`, '']}
              />
              <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
