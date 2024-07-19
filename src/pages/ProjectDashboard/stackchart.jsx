import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const data = [
  {
    name: 'Total',
    value1: 4000,
    value2: 3000,
    value3: 2000,
    value4: 1000,
  },
];

const StackedHorizontalBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip />
        <Legend />
        <Bar dataKey="value1" stackId="a" fill="#8884d8" />
        <Bar dataKey="value2" stackId="a" fill="#82ca9d" />
        <Bar dataKey="value3" stackId="a" fill="#ffc658" />
        <Bar dataKey="value4" stackId="a" fill="#ff8042" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StackedHorizontalBarChart;
