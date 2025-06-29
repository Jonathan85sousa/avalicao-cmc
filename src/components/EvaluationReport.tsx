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
  onEdit: () => void;
}

const EvaluationReport: React.FC<EvaluationReportProps> = ({ data, onEdit }) => {
  const getClassificationDetails = () => {
    switch (data.classification) {
      case 'approved':
        return {
          label: 'Aprovado',
          icon: CheckCircle,
          colorClass: 'bg-green-100 border-green-200 text-green-800'
        };
      case 'reevaluation':
        return {
          label: 'Reavaliação',
          icon: AlertTriangle,
          colorClass: 'bg-yellow-100 border-yellow-200 text-yellow-800'
        };
      case 'rejected':
        return {
          label: 'Reprovado',
          icon: XCircle,
          colorClass: 'bg-red-100 border-red-200 text-red-800'
        };
    }
  };

  const classificationDetails = getClassificationDetails();
  const ClassificationIcon = classificationDetails.icon;

  const attendanceRate = (data.attendance.filter(Boolean).length / data.attendance.length) * 100;

  const handleExportPNG = async () => {
    const element = document.getElementById('evaluation-report');
    if (!element) {
      console.error('Elemento evaluation-report não encontrado');
      return;
    }

    try {
      console.log('Iniciando exportação PNG...');
      
      // Salvar estado original da página
      const originalScrollTop = window.pageYOffset;
      const originalScrollLeft = window.pageXOffset;
      const originalBodyOverflow = document.body.style.overflow;
      const originalDocumentOverflow = document.documentElement.style.overflow;
      
      // Configurar página para captura completa
      document.body.style.overflow = 'visible';
      document.documentElement.style.overflow = 'visible';
      window.scrollTo(0, 0);
      
      // Aguardar estabilização do scroll
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Forçar recálculo do layout
      element.style.height = 'auto';
      element.style.minHeight = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      
      // Aguardar renderização completa
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obter dimensões reais do elemento
      const rect = element.getBoundingClientRect();
      const scrollHeight = element.scrollHeight;
      const scrollWidth = element.scrollWidth;
      
      console.log('Dimensões do elemento:', {
        rect: { width: rect.width, height: rect.height },
        scroll: { width: scrollWidth, height: scrollHeight }
      });
      
      // Usar as maiores dimensões para garantir captura completa
      const captureWidth = Math.max(rect.width, scrollWidth, 800);
      const captureHeight = Math.max(rect.height, scrollHeight, 1000);
      
      console.log('Dimensões de captura:', { width: captureWidth, height: captureHeight });
      
      // Configurar html2canvas com opções otimizadas
      const canvas = await html2canvas(element, {
        width: captureWidth,
        height: captureHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        useCORS: true,
        allowTaint: true,
        scale: 2, // Alta resolução
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: false,
        imageTimeout: 30000,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          // Ignorar elementos de scroll ou navegação
          return element.tagName === 'NOSCRIPT';
        },
        onclone: (clonedDoc, clonedElement) => {
          console.log('Configurando elemento clonado...');
          const clonedTarget = clonedDoc.getElementById('evaluation-report');
          if (clonedTarget) {
            // Garantir que o elemento clonado seja completamente visível
            clonedTarget.style.position = 'static';
            clonedTarget.style.top = 'auto';
            clonedTarget.style.left = 'auto';
            clonedTarget.style.width = 'auto';
            clonedTarget.style.height = 'auto';
            clonedTarget.style.minHeight = 'auto';
            clonedTarget.style.maxHeight = 'none';
            clonedTarget.style.overflow = 'visible';
            clonedTarget.style.transform = 'none';
            clonedTarget.style.margin = '0';
            clonedTarget.style.padding = '20px';
            clonedTarget.style.boxSizing = 'border-box';
            
            // Configurar o documento clonado
            clonedDoc.body.style.margin = '0';
            clonedDoc.body.style.padding = '0';
            clonedDoc.body.style.width = captureWidth + 'px';
            clonedDoc.body.style.height = captureHeight + 'px';
            clonedDoc.body.style.overflow = 'visible';
            clonedDoc.documentElement.style.overflow = 'visible';
            
            // Garantir que todos os elementos filhos sejam visíveis
            const allElements = clonedTarget.querySelectorAll('*');
            allElements.forEach(el => {
              const htmlEl = el as HTMLElement;
              if (htmlEl.style.overflow === 'hidden') {
                htmlEl.style.overflow = 'visible';
              }
            });
          }
        }
      });
      
      // Restaurar estado original
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalDocumentOverflow;
      window.scrollTo(originalScrollLeft, originalScrollTop);
      
      console.log('Canvas criado:', { 
        width: canvas.width, 
        height: canvas.height,
        dataURL: canvas.toDataURL().substring(0, 50) + '...'
      });
      
      // Verificar se o canvas foi criado corretamente
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vazio - falha na captura');
      }
      
      // Criar e fazer download da imagem
      const link = document.createElement('a');
      const fileName = `relatorio-${data.candidateName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'dd-MM-yyyy')}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Simular clique para download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('PNG exportado com sucesso:', fileName);
      
    } catch (error) {
      console.error('Erro detalhado na exportação PNG:', error);
      alert('Erro ao exportar imagem. Verifique o console para mais detalhes e tente novamente.');
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
    <div className="max-w-6xl mx-auto space-y-6 print:max-w-none print:space-y-3">
      {/* Cabeçalho do Relatório */}
      <div className="flex justify-between items-center print:hidden">
        <Button 
          variant="outline" 
          onClick={onEdit}
          className="flex items-center space-x-2 hover:bg-opacity-10 border-green-800 text-green-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Editar Formulário</span>
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPNG}
            className="border-green-800 text-green-800"
          >
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            className="border-green-800 text-green-800"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="border-green-800 text-green-800"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      <div id="evaluation-report" className="space-y-6 print:space-y-4 bg-white" style={{ 
        minHeight: 'auto', 
        overflow: 'visible', 
        padding: '20px',
        width: '100%',
        maxWidth: 'none'
      }}>
        
        {/* Dados do Candidato */}
        <Card className="p-8 print:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-800 print:break-inside-avoid">
          <div className="flex items-start space-x-6 print:space-x-4">
            <div className="flex-shrink-0">
              {data.candidatePhotoUrl ? (
                <img 
                  src={data.candidatePhotoUrl} 
                  alt={data.candidateName}
                  className="h-32 w-32 print:h-20 print:w-20 object-cover rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-32 w-32 print:h-20 print:w-20 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="h-16 w-16 print:h-10 print:w-10 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl print:text-2xl font-bold mb-2 text-green-800">
                Relatório de Avaliação
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 text-green-800 print:text-sm">
                <div>
                  <p><span className="font-semibold">Cliente:</span> {data.clientName.toUpperCase()}</p>
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

        {/* Metodologia de Avaliação */}
        <Card className="p-6 print:p-4 bg-blue-50 border-2 border-blue-200 print:break-inside-avoid">
          <h3 className="text-xl print:text-lg font-semibold mb-4 print:mb-2 text-blue-800">📋 Metodologia de Avaliação</h3>
          
          <div className="space-y-4 print:space-y-2 text-gray-700 print:text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2 print:mb-1">Sistema de Pontuação:</h4>
              <p className="mb-3 print:mb-2">
                A avaliação é realizada através de 6 critérios fundamentais, cada um composto por 3 subcritérios específicos. 
                As notas variam de 0 a 10 pontos, sendo calculada a média aritmética de cada critério.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                <div>
                  <h5 className="font-semibold text-blue-600 mb-2 print:mb-1">Critérios com Peso 2:</h5>
                  <ul className="text-sm space-y-1 print:space-y-0">
                    <li>• <strong>Segurança:</strong> Prevenção, EPI, Procedimentos</li>
                    <li>• <strong>Técnica:</strong> Conhecimento, Execução, Eficiência</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-blue-600 mb-2 print:mb-1">Critérios com Peso 1:</h5>
                  <ul className="text-sm space-y-1 print:space-y-0">
                    <li>• <strong>Comunicação:</strong> Clareza, Assertividade, Consistência</li>
                    <li>• <strong>Aptidão Física:</strong> Resistência, Força, Agilidade</li>
                    <li>• <strong>Liderança:</strong> Motivação, Gestão de Conflitos, Tomada de Decisão</li>
                    <li>• <strong>Operacional:</strong> Equipagem, Lançamento, Frenagem</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 print:pt-2">
              <h4 className="font-semibold text-blue-700 mb-3 print:mb-2">Critérios de Aprovação:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
                <div className="bg-red-50 p-4 print:p-2 rounded-lg border border-red-200">
                  <div className="flex items-center mb-2 print:mb-1">
                    <XCircle className="h-5 w-5 print:h-4 print:w-4 text-red-600 mr-2" />
                    <h5 className="font-semibold text-red-700">Reprovado</h5>
                  </div>
                  <p className="text-sm text-red-600">
                    <strong>Nota Final:</strong> Menor que 7,0<br/>
                    <strong>ou</strong><br/>
                    <strong>Presença:</strong> Menor que 70%
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 print:p-2 rounded-lg border border-yellow-200">
                  <div className="flex items-center mb-2 print:mb-1">
                    <AlertTriangle className="h-5 w-5 print:h-4 print:w-4 text-yellow-600 mr-2" />
                    <h5 className="font-semibold text-yellow-700">Reavaliação</h5>
                  </div>
                  <p className="text-sm text-yellow-600">
                    <strong>Nota Final:</strong> Entre 7,0 e 7,9<br/>
                    <strong>e</strong><br/>
                    <strong>Presença:</strong> Mínimo 70%
                  </p>
                </div>

                <div className="bg-green-50 p-4 print:p-2 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2 print:mb-1">
                    <CheckCircle className="h-5 w-5 print:h-4 print:w-4 text-green-600 mr-2" />
                    <h5 className="font-semibold text-green-700">Aprovado</h5>
                  </div>
                  <p className="text-sm text-green-600">
                    <strong>Nota Final:</strong> 8,0 ou superior<br/>
                    <strong>e</strong><br/>
                    <strong>Presença:</strong> Mínimo 70%
                  </p>
                </div>
              </div>
              
              <div className="mt-4 print:mt-2 p-3 print:p-2 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Observação:</strong> A nota final é calculada através da média ponderada dos critérios, 
                  onde Segurança e Técnica possuem peso 2, e os demais critérios possuem peso 1.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Resultado da Avaliação */}
        <Card className="p-8 print:p-4 print:break-inside-avoid">
          <div className="w-full flex justify-center mb-6 print:mb-3">
            <div 
              data-classification-title
              className={`flex items-center justify-center px-6 py-3 print:px-4 print:py-2 rounded-full text-2xl print:text-lg font-bold border-2 ${classificationDetails.colorClass}`}
            >
              <ClassificationIcon className="h-8 w-8 print:h-6 print:w-6 mr-3 print:mr-2" />
              <span>{classificationDetails.label}</span>
            </div>
          </div>
            
          <div className="text-center mt-4 print:mt-2">
            <p className="text-3xl print:text-2xl font-bold text-green-800">
              Nota Final: <span className="text-green-600">{data.finalScore.toFixed(1)}</span>
            </p>
          </div>

          {/* Detalhes dos Critérios com Subtópicos */}
          <div className="space-y-6 print:space-y-3 print:break-inside-avoid">
            {Object.entries(data.criteria).map(([key, criteriaData]) => (
              <div key={key} className="border rounded-lg p-4 print:p-2 border-green-800">
                <div className="flex justify-between items-center mb-4 print:mb-2">
                  <h3 className="text-xl print:text-lg font-semibold text-green-800">
                    {criteriaLabels[key as keyof typeof criteriaLabels]}
                    {(key === 'seguranca' || key === 'tecnica') && 
                      <span className="text-sm ml-2 text-green-600">(Peso 2)</span>
                    }
                  </h3>
                  <div className="text-2xl print:text-xl font-bold text-green-600">
                    {criteriaData.average.toFixed(1)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:gap-2">
                  {Object.entries(criteriaData)
                    .filter(([subKey]) => subKey !== 'average')
                    .map(([subKey, subValue]) => (
                      <div key={subKey} className="text-center p-3 print:p-2 bg-green-50 rounded-lg border border-green-800">
                        <p className="text-sm font-semibold text-green-800">
                          {subCriteriaLabels[key as keyof typeof subCriteriaLabels]?.[subKey as keyof any] || subKey}
                        </p>
                        <p className="text-lg print:text-base font-bold text-green-600">{subValue}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Feedback Detalhado */}
        {data.feedback.length > 0 && (
          <Card className={`p-6 print:p-4 bg-gradient-to-r border-2 print:break-inside-avoid ${
            data.classification === 'approved'
              ? 'from-green-50 to-emerald-100 border-green-500'
              : data.classification === 'rejected' 
              ? 'from-red-50 to-red-100 border-red-500' 
              : 'from-orange-50 to-yellow-100 border-yellow-500'
          }`}>
            <h3 className={`text-xl print:text-lg font-semibold mb-6 print:mb-3 ${
              data.classification === 'approved'
                ? 'text-green-600'
                : data.classification === 'rejected' 
                ? 'text-red-600' 
                : 'text-yellow-600'
            }`}>
              {data.classification === 'approved' 
                ? '✅ Resumo da Aprovação' 
                : data.classification === 'rejected' 
                ? '🔴 Plano de Melhoria' 
                : '📋 Pontos de Aprimoramento'}
            </h3>
            
            <div className="space-y-4 print:space-y-2">
              {data.feedback.map((item, index) => (
                <div key={index} className={`p-4 print:p-2 bg-white rounded-lg border-l-4 ${
                  data.classification === 'approved'
                    ? 'border-l-green-500'
                    : data.classification === 'rejected' 
                    ? 'border-l-red-500' 
                    : 'border-l-yellow-500'
                }`}>
                  <p className="text-gray-800 print:text-sm whitespace-pre-line leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            {data.classification === 'approved' && (
              <div className="mt-6 print:mt-3 p-4 print:p-2 bg-green-100 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 print:mb-1">🎯 Recomendações para Continuidade:</h4>
                <ul className="text-green-700 space-y-1 print:space-y-0 text-sm">
                  <li>• Manter o padrão de excelência demonstrado durante o treinamento</li>
                  <li>• Buscar oportunidades de aperfeiçoamento contínuo na área</li>
                  <li>• Compartilhar conhecimentos com novos condutores em formação</li>
                  <li>• Participar de capacitações complementares quando disponíveis</li>
                </ul>
              </div>
            )}

            {data.classification === 'rejected' && (
              <div className="mt-6 print:mt-3 p-4 print:p-2 bg-red-100 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2 print:mb-1">⚠️ Próximos Passos Obrigatórios:</h4>
                <ul className="text-red-700 space-y-1 print:space-y-0 text-sm">
                  <li>• Rever pontos de melhoria citados</li>
                  <li>• Buscar mentoria especializada para desenvolvimento das competências</li>
                  <li>• Identificados esses pontos como insuficiente para aprovação</li>
                  <li>• Apresentar certificados de cursos complementares realizados</li>
                  <li>• Procurar melhorias nas áreas avaliadas</li>
                </ul>
              </div>
            )}

            {data.classification === 'reevaluation' && (
              <div className="mt-6 print:mt-3 p-4 print:p-2 bg-yellow-100 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2 print:mb-1">💡 Recomendações para Reavaliação:</h4>
                <ul className="text-yellow-700 space-y-1 print:space-y-0 text-sm">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-3 print:break-inside-avoid">
          <Card className="p-6 print:p-3 border-2 border-green-800">
            <h3 className="text-lg print:text-base font-semibold mb-4 print:mb-2 text-center text-green-800">
              Análise Radar - Competências
            </h3>
            <div className="print:scale-75 print:origin-top-left">
              <RadarChart data={data.criteria} />
            </div>
          </Card>
          
          <Card className="p-6 print:p-3 border-2 border-green-800">
            <h3 className="text-lg print:text-base font-semibold mb-4 print:mb-2 text-center text-green-800">
              Desempenho por Critério
            </h3>
            <div className="print:scale-75 print:origin-top-left">
              <BarChart data={data.criteria} />
            </div>
          </Card>
        </div>

        {/* Rodapé */}
        <Card className="p-4 print:p-2 text-center text-gray-600 text-sm print:block print:break-inside-avoid">
          <p>Relatório gerado automaticamente • {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </Card>
      </div>
    </div>
  );
};

export default EvaluationReport;
