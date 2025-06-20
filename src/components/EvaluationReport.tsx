
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Download, Printer, ArrowLeft, User } from 'lucide-react';
import { EvaluationData } from '@/types/evaluation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RadarChart from '@/components/RadarChart';
import BarChart from '@/components/BarChart';

interface EvaluationReportProps {
  data: EvaluationData;
  onBack: () => void;
}

const EvaluationReport: React.FC<EvaluationReportProps> = ({ data, onBack }) => {
  const getClassificationDetails = () => {
    switch (data.classification) {
      case 'approved':
        return {
          label: 'Aprovado',
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          emoji: '✅'
        };
      case 'reevaluation':
        return {
          label: 'Reavaliação',
          icon: AlertTriangle,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          emoji: '⚠️'
        };
      case 'rejected':
        return {
          label: 'Reprovado',
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          emoji: '❌'
        };
    }
  };

  const classificationDetails = getClassificationDetails();
  const ClassificationIcon = classificationDetails.icon;

  const attendanceRate = (data.attendance.filter(Boolean).length / data.attendance.length) * 100;

  const handleExportPNG = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:max-w-none">
      {/* Cabeçalho do Relatório */}
      <div className="flex justify-between items-center print:hidden">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Formulário</span>
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportPNG}>
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Dados do Candidato */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {data.candidatePhotoUrl ? (
              <img 
                src={data.candidatePhotoUrl} 
                alt={data.candidateName}
                className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Relatório de Avaliação
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p><span className="font-semibold">Candidato:</span> {data.candidateName}</p>
                <p><span className="font-semibold">Idade:</span> {data.age} anos</p>
                <p><span className="font-semibold">Treinamento:</span> {data.trainingTitle}</p>
              </div>
              <div>
                <p><span className="font-semibold">Data:</span> {format(data.trainingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                <p><span className="font-semibold">Duração:</span> {data.daysCount} dias ({data.hoursCount}h)</p>
                <p><span className="font-semibold">Presença:</span> {attendanceRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Resultado da Avaliação */}
      <Card className="p-8">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${classificationDetails.color} border-2`}>
            <ClassificationIcon className="h-8 w-8 mr-3" />
            <span>{classificationDetails.emoji} {classificationDetails.label}</span>
          </div>
          
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-800">
              Nota Final: <span className="text-blue-600">{data.finalScore.toFixed(1)}</span>
            </p>
            <p className="text-gray-600 mt-1">Média ponderada dos critérios avaliados</p>
          </div>
        </div>

        {/* Detalhes dos Critérios */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-600">Segurança</p>
            <p className="text-2xl font-bold">{data.criteria.seguranca}</p>
            <p className="text-xs text-gray-500">Peso 2</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-600">Técnica</p>
            <p className="text-2xl font-bold">{data.criteria.tecnica}</p>
            <p className="text-xs text-gray-500">Peso 2</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-600">Comunicação</p>
            <p className="text-2xl font-bold">{data.criteria.comunicacao}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-600">Aptidão Física</p>
            <p className="text-2xl font-bold">{data.criteria.aptidaoFisica}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-600">Liderança</p>
            <p className="text-2xl font-bold">{data.criteria.lideranca}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-600">Operacional</p>
            <p className="text-2xl font-bold">{data.criteria.operacional}</p>
          </div>
        </div>
      </Card>

      {/* Feedback de Melhorias */}
      {data.feedback.length > 0 && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">
            📋 Pontos de Melhoria
          </h3>
          <ul className="space-y-2">
            {data.feedback.map((item, index) => (
              <li key={index} className="flex items-start space-x-2 text-orange-700">
                <span className="font-semibold text-orange-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Análise Radar - Competências</h3>
          <RadarChart data={data.criteria} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Desempenho por Critério</h3>
          <BarChart data={data.criteria} />
        </Card>
      </div>

      {/* Rodapé */}
      <Card className="p-4 text-center text-gray-600 text-sm print:block">
        <p>Relatório gerado automaticamente • {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </Card>
    </div>
  );
};

export default EvaluationReport;
