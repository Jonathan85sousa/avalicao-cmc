
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EvaluationData } from '@/types/evaluation';

interface BarChartProps {
  data: EvaluationData['criteria'];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartData = [
    {
      name: 'Segurança',
      value: data.seguranca,
      color: '#EF4444'
    },
    {
      name: 'Técnica',
      value: data.tecnica,
      color: '#3B82F6'
    },
    {
      name: 'Comunicação',
      value: data.comunicacao,
      color: '#10B981'
    },
    {
      name: 'Aptidão',
      value: data.aptidaoFisica,
      color: '#F59E0B'
    },
    {
      name: 'Liderança',
      value: data.lideranca,
      color: '#8B5CF6'
    },
    {
      name: 'Operacional',
      value: data.operacional,
      color: '#06B6D4'
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          <p className="text-blue-600">
            {`Nota: ${payload[0].value}/10`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          className="text-xs"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis domain={[0, 10]} className="text-xs" />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
