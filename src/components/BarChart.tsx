
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EvaluationData } from '@/types/evaluation';

interface BarChartProps {
  data: EvaluationData['criteria'];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartData = [
    {
      name: 'Segurança',
      value: data.seguranca.average,
      weight: 2
    },
    {
      name: 'Técnica',
      value: data.tecnica.average,
      weight: 2
    },
    {
      name: 'Comunicação',
      value: data.comunicacao.average,
      weight: 1
    },
    {
      name: 'Aptidão Física',
      value: data.aptidaoFisica.average,
      weight: 1
    },
    {
      name: 'Liderança',
      value: data.lideranca.average,
      weight: 1
    },
    {
      name: 'Operacional',
      value: data.operacional.average,
      weight: 1
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg" style={{borderColor: '#103722'}}>
          <p className="font-semibold" style={{color: '#103722'}}>{label}</p>
          <p style={{color: '#006633'}}>
            Nota: {payload[0].value.toFixed(1)}
            {data.weight > 1 && <span className="text-sm"> (Peso {data.weight})</span>}
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
          stroke="#103722"
        />
        <YAxis 
          domain={[0, 10]}
          fontSize={12}
          stroke="#103722"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill="#103722"
          stroke="#006633"
          strokeWidth={1}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
