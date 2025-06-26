import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Upload, User, Clock, MapPin, Users, Camera } from 'lucide-react';
import { EvaluationData, CriteriaConfig } from '@/types/evaluation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvaluationFormProps {
  onSubmit: (data: EvaluationData) => void;
  initialData?: EvaluationData | null;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<EvaluationData>>({
    trainingTitle: '',
    candidateName: '',
    age: 0,
    trainingDate: new Date(),
    daysCount: 1,
    attendance: [true],
    hoursCount: 8,
    criteria: {
      seguranca: { prevencao: 0, epi: 0, procedimentos: 0, average: 0 },
      tecnica: { conhecimento: 0, execucao: 0, eficiencia: 0, average: 0 },
      comunicacao: { clareza: 0, assertividade: 0, consistencia: 0, average: 0 },
      aptidaoFisica: { resistencia: 0, forca: 0, agilidade: 0, average: 0 },
      lideranca: { motivacao: 0, gestaoConflitos: 0, tomadaDecisao: 0, average: 0 },
      operacional: { equipagem: 0, lancamento: 0, frenagem: 0, average: 0 }
    },
    finalScore: 0,
    classification: 'rejected',
    feedback: []
  });

  const [candidatePhoto, setCandidatePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.candidatePhotoUrl) {
        setPhotoPreview(initialData.candidatePhotoUrl);
      }
    }
  }, [initialData]);

  const criteriaConfig: CriteriaConfig[] = [
    {
      key: 'seguranca',
      label: 'Segurança (Peso 2)',
      weight: 2,
      subCriteria: [
        { key: 'prevencao', label: 'Prevenção', description: 'Identificação e prevenção de riscos' },
        { key: 'epi', label: 'EPI', description: 'Uso correto de equipamentos de proteção' },
        { key: 'procedimentos', label: 'Procedimentos', description: 'Seguimento de protocolos de segurança' }
      ]
    },
    {
      key: 'tecnica',
      label: 'Técnica (Peso 2)',
      weight: 2,
      subCriteria: [
        { key: 'conhecimento', label: 'Conhecimento', description: 'Domínio teórico da atividade' },
        { key: 'execucao', label: 'Execução', description: 'Aplicação prática das técnicas' },
        { key: 'eficiencia', label: 'Eficiência', description: 'Otimização de tempo e recursos' }
      ]
    },
    {
      key: 'comunicacao',
      label: 'Comunicação',
      weight: 1,
      subCriteria: [
        { key: 'clareza', label: 'Clareza', description: 'Comunicação clara e objetiva' },
        { key: 'assertividade', label: 'Assertividade', description: 'Firmeza nas orientações' },
        { key: 'consistencia', label: 'Consistência', description: 'Coerência na comunicação' }
      ]
    },
    {
      key: 'aptidaoFisica',
      label: 'Aptidão Física',
      weight: 1,
      subCriteria: [
        { key: 'resistencia', label: 'Resistência', description: 'Capacidade de resistência física' },
        { key: 'forca', label: 'Força', description: 'Força física adequada' },
        { key: 'agilidade', label: 'Agilidade', description: 'Agilidade e coordenação motora' }
      ]
    },
    {
      key: 'lideranca',
      label: 'Liderança',
      weight: 1,
      subCriteria: [
        { key: 'motivacao', label: 'Motivação', description: 'Capacidade de motivar o grupo' },
        { key: 'gestaoConflitos', label: 'Gestão de Conflitos', description: 'Resolução de conflitos' },
        { key: 'tomadaDecisao', label: 'Tomada de Decisão', description: 'Decisões rápidas e assertivas' }
      ]
    },
    {
      key: 'operacional',
      label: 'Operacional',
      weight: 1,
      subCriteria: [
        { key: 'equipagem', label: 'Equipagem', description: 'Preparação e organização de equipamentos' },
        { key: 'lancamento', label: 'Lançamento', description: 'Execução do lançamento/início da atividade' },
        { key: 'frenagem', label: 'Frenagem', description: 'Controle e finalização da atividade' }
      ]
    }
  ];

  const criteriaLabels = {
    seguranca: 'Segurança',
    tecnica: 'Técnica',
    comunicacao: 'Comunicação',
    aptidaoFisica: 'Aptidão Física',
    lideranca: 'Liderança',
    operacional: 'Operacional'
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCandidatePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'candidate-photo.jpg', { type: 'image/jpeg' });
            setCandidatePhoto(file);
            setPhotoPreview(canvas.toDataURL());
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const updateCriteriaScore = (criteriaKey: string, subKey: string, value: number) => {
    setFormData(prev => {
      const newCriteria = { ...prev.criteria };
      if (newCriteria[criteriaKey as keyof typeof newCriteria]) {
        (newCriteria[criteriaKey as keyof typeof newCriteria] as any)[subKey] = value;
        
        // Calcular média do critério
        const criteriaData = newCriteria[criteriaKey as keyof typeof newCriteria] as any;
        const subValues = Object.entries(criteriaData)
          .filter(([key]) => key !== 'average')
          .map(([, val]) => val as number);
        
        criteriaData.average = subValues.reduce((sum, val) => sum + val, 0) / subValues.length;
      }
      
      return { ...prev, criteria: newCriteria };
    });
  };

  const updateAttendance = (dayIndex: number, present: boolean) => {
    setFormData(prev => {
      const newAttendance = [...(prev.attendance || [])];
      newAttendance[dayIndex] = present;
      return { ...prev, attendance: newAttendance };
    });
  };

  const updateDaysCount = (days: number) => {
    setFormData(prev => {
      const newAttendance = Array(days).fill(true);
      // Preservar dados existentes se possível
      if (prev.attendance) {
        for (let i = 0; i < Math.min(days, prev.attendance.length); i++) {
          newAttendance[i] = prev.attendance[i];
        }
      }
      return { ...prev, daysCount: days, attendance: newAttendance };
    });
  };

  const calculateFinalScore = (criteria: EvaluationData['criteria']): number => {
    const weights = {
      seguranca: 2,
      tecnica: 2,
      comunicacao: 1,
      aptidaoFisica: 1,
      lideranca: 1,
      operacional: 1
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(criteria).forEach(([key, data]) => {
      const weight = weights[key as keyof typeof weights];
      totalWeightedScore += data.average * weight;
      totalWeight += weight;
    });

    return totalWeightedScore / totalWeight;
  };

  const getClassification = (finalScore: number, attendanceRate: number): 'approved' | 'reevaluation' | 'rejected' => {
    if (attendanceRate < 70) return 'rejected';
    if (finalScore >= 8.0) return 'approved';
    if (finalScore >= 7.0) return 'reevaluation';
    return 'rejected';
  };

  const generateFeedback = (criteria: EvaluationData['criteria'], classification: string, attendanceRate: number): string[] => {
    const feedback: string[] = [];
    
    if (classification === 'approved') {
      // Feedback específico para aprovação baseado nos critérios
      const excellentCriteria = Object.entries(criteria).filter(([_, data]) => data.average >= 8.5);
      const goodCriteria = Object.entries(criteria).filter(([_, data]) => data.average >= 7.0 && data.average < 8.5);
      
      if (excellentCriteria.length > 0) {
        const criteriaNames = excellentCriteria.map(([key, _]) => criteriaLabels[key as keyof typeof criteriaLabels]).join(', ');
        feedback.push(`Excelente desempenho em: ${criteriaNames}. Demonstrou domínio excepcional nessas competências.`);
      }
      
      if (goodCriteria.length > 0) {
        const criteriaNames = goodCriteria.map(([key, _]) => criteriaLabels[key as keyof typeof criteriaLabels]).join(', ');
        feedback.push(`Bom desempenho em: ${criteriaNames}. Atendeu plenamente aos requisitos estabelecidos.`);
      }
      
      if (attendanceRate === 100) {
        feedback.push('Presença exemplar durante todo o treinamento, demonstrando comprometimento e dedicação.');
      } else if (attendanceRate >= 90) {
        feedback.push('Ótima frequência no treinamento, mostrando responsabilidade e interesse no aprendizado.');
      }
      
      // Feedback específico por critérios de destaque
      if (criteria.seguranca.average >= 8.0) {
        feedback.push('Demonstrou consciência exemplar sobre segurança, seguindo rigorosamente os protocolos de prevenção.');
      }
      
      if (criteria.tecnica.average >= 8.0) {
        feedback.push('Apresentou domínio técnico sólido, executando procedimentos com precisão e eficiência.');
      }
      
      if (criteria.lideranca.average >= 8.0) {
        feedback.push('Mostrou capacidade natural de liderança, motivando a equipe e tomando decisões assertivas.');
      }
      
      feedback.push('Candidato aprovado e apto para exercer a função de Condutor de Turismo de Aventura com competência e segurança.');
      
    } else if (classification === 'reevaluation') {
      // Feedback para reavaliação (nota final entre 7.0 e 7.9)
      feedback.push('Desempenho satisfatório, mas com necessidade de aprimoramento para atingir o padrão de excelência exigido.');
      
      const weakCriteria = Object.entries(criteria).filter(([_, data]) => data.average < 7.5);
      const moderateCriteria = Object.entries(criteria).filter(([_, data]) => data.average >= 7.5 && data.average < 8.0);
      
      if (weakCriteria.length > 0) {
        const criteriaNames = weakCriteria.map(([key, _]) => criteriaLabels[key as keyof typeof criteriaLabels]).join(', ');
        feedback.push(`Pontos que precisam de maior atenção: ${criteriaNames}. Requer desenvolvimento mais intensivo.`);
      }

      if (moderateCriteria.length > 0) {
        const criteriaNames = moderateCriteria.map(([key, _]) => criteriaLabels[key as keyof typeof criteriaLabels]).join(', ');
        feedback.push(`Competências em desenvolvimento: ${criteriaNames}. Próximo do padrão esperado, necessário refinamento.`);
      }

      // Feedback específico por critério para reavaliação
      Object.entries(criteria).forEach(([key, data]) => {
        if (data.average < 8.0) {
          switch (key) {
            case 'seguranca':
              if (data.average < 7.5) {
                feedback.push('Segurança: Reforçar conhecimentos sobre protocolos de segurança e práticas preventivas. Fundamental para aprovação.');
              } else {
                feedback.push('Segurança: Aprimorar consistência na aplicação dos procedimentos de segurança.');
              }
              break;
            case 'tecnica':
              feedback.push('Técnica: Praticar mais as habilidades específicas e buscar maior precisão na execução.');
              break;
            case 'comunicacao':
              feedback.push('Comunicação: Desenvolver maior clareza e assertividade na condução do grupo.');
              break;
            case 'aptidaoFisica':
              feedback.push('Aptidão Física: Melhorar condicionamento para atender plenamente às demandas da atividade.');
              break;
            case 'lideranca':
              feedback.push('Liderança: Fortalecer habilidades de liderança e gestão de grupos em situações desafiadoras.');
              break;
            case 'operacional':
              feedback.push('Operacional: Aperfeiçoar organização e eficiência na execução dos procedimentos.');
              break;
          }
        }
      });

      if (attendanceRate < 90) {
        feedback.push('Presença: Manter frequência mais regular nos treinamentos para melhor aproveitamento do conteúdo.');
      }
      
    } else if (classification === 'rejected') {
      // Feedback para reprovação (nota final menor que 7.0 ou presença menor que 70%)
      if (attendanceRate < 70) {
        feedback.push('Frequência insuficiente: Presença abaixo do mínimo exigido (70%). É obrigatório refazer o treinamento completo.');
      }

      feedback.push('Desempenho abaixo do padrão mínimo exigido. Necessário desenvolvimento significativo das competências avaliadas.');
      
      const criticalCriteria = Object.entries(criteria).filter(([_, data]) => data.average < 6.0);
      const lowCriteria = Object.entries(criteria).filter(([_, data]) => data.average >= 6.0 && data.average < 7.0);
      
      if (criticalCriteria.length > 0) {
        const criteriaNames = criticalCriteria.map(([key, _]) => criteriaLabels[key as keyof typeof criteriaLabels]).join(', ');
        feedback.push(`Competências críticas: ${criteriaNames}. Necessário treinamento intensivo e acompanhamento especializado.`);
      }

      if (lowCriteria.length > 0) {
        const criteriaNames = lowCriteria.map(([key, _]) => criteriaLabels[key as keyof typeof criteriaLabels]).join(', ');
        feedback.push(`Competências insuficientes: ${criteriaNames}. Requer desenvolvimento substancial antes de nova avaliação.`);
      }

      // Feedback detalhado para cada critério com nota baixa
      Object.entries(criteria).forEach(([key, data]) => {
        if (data.average < 7.0) {
          switch (key) {
            case 'seguranca':
              if (data.average < 5.0) {
                feedback.push('Segurança: Conhecimento inadequado sobre protocolos de segurança. CRÍTICO - risco para a atividade.');
              } else {
                feedback.push('Segurança: Domínio insuficiente das práticas de segurança. Necessário treinamento específico.');
              }
              break;
            case 'tecnica':
              feedback.push('Técnica: Habilidades técnicas abaixo do esperado. Necessário treinamento prático intensivo.');
              break;
            case 'comunicacao':
              feedback.push('Comunicação: Dificuldades na comunicação com grupos. Essencial para condução segura de atividades.');
              break;
            case 'aptidaoFisica':
              feedback.push('Aptidão Física: Condicionamento físico inadequado para as demandas da função.');
              break;
            case 'lideranca':
              feedback.push('Liderança: Habilidades de liderança insuficientes para gestão segura de grupos.');
              break;
            case 'operacional':
              feedback.push('Operacional: Execução inadequada dos procedimentos operacionais fundamentais.');
              break;
          }
        }
      });

      feedback.push('Recomenda-se buscar treinamento adicional e prática supervisionada antes de nova tentativa de certificação.');
    }
    
    return feedback;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.criteria) return;

    const finalScore = calculateFinalScore(formData.criteria);
    const attendanceRate = formData.attendance ? 
      (formData.attendance.filter(Boolean).length / formData.attendance.length) * 100 : 0;
    
    const classification = getClassification(finalScore, attendanceRate);
    const feedback = generateFeedback(formData.criteria, classification, attendanceRate);

    const evaluationData: EvaluationData = {
      ...formData as EvaluationData,
      finalScore,
      classification,
      feedback,
      candidatePhoto,
      candidatePhotoUrl: photoPreview
    };

    onSubmit(evaluationData);
  };

  const isFormValid = () => {
    return formData.trainingTitle && 
           formData.candidateName && 
           formData.age && 
           formData.criteria &&
           Object.values(formData.criteria).every(criteria => 
             Object.values(criteria).every(value => typeof value === 'number' && value >= 0)
           );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informações Básicas */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Informações do Candidato</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Nome do Candidato</Label>
            <Input
              id="candidateName"
              value={formData.candidateName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              placeholder="Idade"
              min="18"
              max="70"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="candidatePhoto">Foto do Candidato (Opcional)</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="candidatePhoto"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
              className="flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>Câmera</span>
            </Button>
            {photoPreview && (
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="h-16 w-16 object-cover rounded-full border-2 border-gray-300"
              />
            )}
          </div>
        </div>

        {/* Modal da Câmera */}
        {isCapturing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Capturar Foto</h3>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  className="w-full rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopCamera}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informações do Treinamento */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Informações do Treinamento</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trainingTitle">Título do Treinamento</Label>
          <Input
            id="trainingTitle"
            value={formData.trainingTitle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, trainingTitle: e.target.value }))}
            placeholder="Ex: Condutor de Turismo de Aventura - Rapel"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="trainingDate">Data do Treinamento</Label>
            <Input
              id="trainingDate"
              type="date"
              value={formData.trainingDate ? format(formData.trainingDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                trainingDate: new Date(e.target.value) 
              }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysCount">Quantidade de Dias</Label>
            <Input
              id="daysCount"
              type="number"
              value={formData.daysCount || 1}
              onChange={(e) => updateDaysCount(parseInt(e.target.value) || 1)}
              min="1"
              max="30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoursCount">Carga Horária Total</Label>
            <Input
              id="hoursCount"
              type="number"
              value={formData.hoursCount || 8}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                hoursCount: parseInt(e.target.value) || 8 
              }))}
              min="1"
              max="300"
              required
            />
          </div>
        </div>

        {/* Controle de Presença */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <Label>Controle de Presença</Label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {Array.from({ length: formData.daysCount || 1 }, (_, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                <input
                  type="checkbox"
                  id={`day-${index}`}
                  checked={formData.attendance?.[index] || false}
                  onChange={(e) => updateAttendance(index, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`day-${index}`} className="text-sm">
                  Dia {index + 1}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Presença: {formData.attendance ? 
              `${formData.attendance.filter(Boolean).length}/${formData.attendance.length} dias 
              (${((formData.attendance.filter(Boolean).length / formData.attendance.length) * 100).toFixed(0)}%)` 
              : '0/0 dias (0%)'
            }
          </div>
        </div>
      </div>

      {/* Critérios de Avaliação */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Critérios de Avaliação</h2>
        </div>

        {criteriaConfig.map((criteria) => (
          <Card key={criteria.key} className="p-6 border-l-4 border-l-green-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {criteria.label}
              </h3>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Média: {formData.criteria?.[criteria.key]?.average.toFixed(1) || '0.0'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {criteria.subCriteria.map((sub) => (
                <div key={sub.key} className="space-y-2">
                  <Label htmlFor={`${criteria.key}-${sub.key}`} className="text-sm font-medium">
                    {sub.label}
                  </Label>
                  <p className="text-xs text-gray-600 mb-2">{sub.description}</p>
                  <Input
                    id={`${criteria.key}-${sub.key}`}
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.criteria?.[criteria.key]?.[sub.key as keyof any] || ''}
                    onChange={(e) => updateCriteriaScore(
                      criteria.key, 
                      sub.key, 
                      parseFloat(e.target.value) || 0
                    )}
                    placeholder="0.0"
                    className="text-center"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Botão de Submissão */}
      <div className="flex justify-center pt-6">
        <Button 
          type="submit" 
          size="lg"
          disabled={!isFormValid()}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          <Clock className="h-5 w-5 mr-2" />
          Gerar Relatório de Avaliação
        </Button>
      </div>
    </form>
  );
};

export default EvaluationForm;
