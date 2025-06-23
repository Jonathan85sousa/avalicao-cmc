import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Download, Printer, ArrowLeft, User } from 'lucide-react';
import { EvaluationData } from '@/types/evaluation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RadarChart from '@/components/RadarChart';
import BarChart from '@/components/BarChart';
import html2canvas from 'html2canvas';

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
          color: 'bg-green-100 border-green-200',
          textColor: '#103722',
          emoji: '✅'
        };
      case 'reevaluation':
        return {
          label: 'Reavaliação',
          icon: AlertTriangle,
          color: 'bg-yellow-100 border-yellow-200',
          textColor: '#103722',
          emoji: '⚠️'
        };
      case 'rejected':
        return {
          label: 'Reprovado',
          icon: XCircle,
          color: 'bg-red-100 border-red-200',
          textColor: '#103722',
          emoji: '❌'
        };
    }
  };

  const classificationDetails = getClassificationDetails();
  const ClassificationIcon = classificationDetails.icon;

  const attendanceRate = (data.attendance.filter(Boolean).length / data.attendance.length) * 100;

  const handleExportPNG = async () => {
    const element = document.getElementById('evaluation-report');
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          height: element.scrollHeight,
          width: element.scrollWidth,
          scrollX: 0,
          scrollY: 0,
          useCORS: true,
          allowTaint: true,
          scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `relatorio-${data.candidateName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'dd-MM-yyyy')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Erro ao exportar PNG:', error);
      }
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const criteriaLabels = {
    seguranca: 'Segurança',
    tecnica: 'Técnica',
    comunicacao: 'Comunicação',
    aptidaoFisica: 'Aptidão Física',
    lideranca: 'Liderança',
    operacional: 'Operacional'
  };

  const subCriteriaLabels = {
    seguranca: {
      prevencao: 'Prevenção',
      epi: 'EPI',
      procedimentos: 'Procedimentos'
    },
    tecnica: {
      conhecimento: 'Conhecimento',
      execucao: 'Execução',
      eficiencia: 'Eficiência'
    },
    comunicacao: {
      clareza: 'Clareza',
      assertividade: 'Assertividade',
      consistencia: 'Consistência'
    },
    aptidaoFisica: {
      resistencia: 'Resistência',
      forca: 'Força',
      agilidade: 'Agilidade'
    },
    lideranca: {
      motivacao: 'Motivação',
      gestaoConflitos: 'Gestão de Conflitos',
      tomadaDecisao: 'Tomada de Decisão'
    },
    operacional: {
      equipagem: 'Equipagem',
      lancamento: 'Lançamento',
      frenagem: 'Frenagem'
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:max-w-none">
      {/* Cabeçalho do Relatório */}
      <div className="flex justify-between items-center print:hidden">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2 hover:bg-opacity-10"
          style={{borderColor: '#103722', color: '#103722'}}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Formulário</span>
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPNG}
            style={{borderColor: '#103722', color: '#103722'}}
          >
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            style={{borderColor: '#103722', color: '#103722'}}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            style={{borderColor: '#103722', color: '#103722'}}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      <div id="evaluation-report" className="space-y-6">
        {/* Dados do Candidato */}
        <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2" style={{borderColor: '#103722'}}>
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
              <h1 className="text-3xl font-bold mb-2" style={{color: '#103722'}}>
                Relatório de Avaliação
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{color: '#103722'}}>
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
            <div 
              className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${classificationDetails.color} border-2`}
              style={{color: classificationDetails.textColor}}
            >
              <ClassificationIcon className="h-8 w-8 mr-3" />
              <span>{classificationDetails.emoji} {classificationDetails.label}</span>
            </div>
            
            <div className="mt-4">
              <p className="text-3xl font-bold" style={{color: '#103722'}}>
                Nota Final: <span style={{color: '#006633'}}>{data.finalScore.toFixed(1)}</span>
              </p>
              <p className="text-gray-600 mt-1">Média ponderada dos critérios avaliados</p>
            </div>
          </div>

          {/* Detalhes dos Critérios com Subtópicos */}
          <div className="space-y-6">
            {Object.entries(data.criteria).map(([key, criteriaData]) => (
              <div key={key} className="border rounded-lg p-4" style={{borderColor: '#103722'}}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold" style={{color: '#103722'}}>
                    {criteriaLabels[key as keyof typeof criteriaLabels]}
                    {(key === 'seguranca' || key === 'tecnica') && 
                      <span className="text-sm ml-2" style={{color: '#006633'}}>(Peso 2)</span>
                    }
                  </h3>
                  <div className="text-2xl font-bold" style={{color: '#006633'}}>
                    {criteriaData.average.toFixed(1)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(criteriaData)
                    .filter(([subKey]) => subKey !== 'average')
                    .map(([subKey, subValue]) => (
                      <div key={subKey} className="text-center p-3 bg-green-50 rounded-lg border" style={{borderColor: '#103722'}}>
                        <p className="text-sm font-semibold" style={{color: '#103722'}}>
                          {subCriteriaLabels[key as keyof typeof subCriteriaLabels]?.[subKey as keyof any] || subKey}
                        </p>
                        <p className="text-lg font-bold" style={{color: '#006633'}}>{subValue}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Feedback Detalhado */}
        {data.feedback.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2" style={{borderColor: data.classification === 'rejected' ? '#dc2626' : '#f59e0b'}}>
            <h3 className="text-xl font-semibold mb-6" style={{color: data.classification === 'rejected' ? '#dc2626' : '#f59e0b'}}>
              {data.classification === 'rejected' ? '🔴 Plano de Melhoria' : '📋 Pontos de Aprimoramento'}
            </h3>
            
            <div className="space-y-4">
              {data.feedback.map((item, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border-l-4" style={{borderLeftColor: data.classification === 'rejected' ? '#dc2626' : '#f59e0b'}}>
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            {data.classification === 'rejected' && (
              <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Próximos Passos Obrigatórios:</h4>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• Completar treinamento adicional nos pontos identificados</li>
                  <li>• Buscar mentoria especializada para desenvolvimento das competências</li>
                  <li>• Solicitar nova avaliação após pelo menos 60 dias de preparação</li>
                  <li>• Apresentar certificados de cursos complementares realizados</li>
                </ul>
              </div>
            )}

            {data.classification === 'reevaluation' && (
              <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Recomendações para Reavaliação:</h4>
                <ul className="text-yellow-700 space-y-1 text-sm">
                  <li>• Dedicar uma semanas aos pontos de melhoria identificados</li>
                  <li>• Praticar com supervisão nas áreas com menor pontuação</li>
                  <li>• Solicitar feedback contínuo durante o período de preparação</li>
                  <li>• Agendar reavaliação em até uma semana</li>
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-2" style={{borderColor: '#103722'}}>
            <h3 className="text-lg font-semibold mb-4 text-center" style={{color: '#103722'}}>
              Análise Radar - Competências
            </h3>
            <RadarChart data={data.criteria} />
          </Card>
          
          <Card className="p-6 border-2" style={{borderColor: '#103722'}}>
            <h3 className="text-lg font-semibold mb-4 text-center" style={{color: '#103722'}}>
              Desempenho por Critério
            </h3>
            <BarChart data={data.criteria} />
          </Card>
        </div>

        {/* Rodapé */}
        <Card className="p-4 text-center text-gray-600 text-sm print:block">
          <p>Relatório gerado automaticamente • {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </Card>
      </div>
    </div>
  );
};

export default EvaluationReport;
