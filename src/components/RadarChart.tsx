
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { EvaluationData } from '@/types/evaluation';

interface RadarChartProps {
  data: EvaluationData['criteria'];
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const chartData = [
    {
      subject: 'Segurança',
      value: data.seguranca,
      fullMark: 10,
    },
    {
      subject: 'Técnica',
      value: data.tecnica,
      fullMark: 10,
    },
    {
      subject: 'Comunicação',
      value: data.comunicacao,
      fullMark: 10,
    },
    {
      subject: 'Aptidão Física',
      value: data.aptidaoFisica,
      fullMark: 10,
    },
    {
      subject: 'Liderança',
      value: data.lideranca,
      fullMark: 10,
    },
    {
      subject: 'Operacional',
      value: data.operacional,
      fullMark: 10,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" className="text-sm" />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 10]} 
          className="text-xs"
        />
        <Radar
          name="Avaliação"
          dataKey="value"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;
