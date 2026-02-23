import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ManifestoChart = ({ likes, dislikes }) => {
  const data = [
    { name: 'Approve', value: likes, color: '#28a745' },
    { name: 'Disapprove', value: dislikes, color: '#dc3545' },
  ];

  return (
    <div style={{ width: '100%', height: 120 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={35}
            outerRadius={50}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ManifestoChart;