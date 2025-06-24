import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, User, Camera } from 'lucide-react';
import { EvaluationData, CriteriaConfig } from '@/types/evaluation';
import { cn } from '@/lib/utils';

const criteriaConfig: CriteriaConfig[] = [
  {
    key: 'seguranca',
    label: 'Segurança',
    weight: 2,
    subCriteria: [
      { key: 'prevencao', label: 'Prevenção', description: 'Identificação e prevenção de riscos' },
      { key: 'epi', label: 'EPI', description: 'Uso correto de equipamentos de proteção' },
      { key: 'procedimentos', label: 'Procedimentos', description: 'Seguimento de protocolos de segurança' }
    ]
  },
  {
    key: 'tecnica',
    label: 'Técnica',
    weight: 2,
    subCriteria: [
      { key: 'conhecimento', label: 'Conhecimento', description: 'Domínio técnico teórico' },
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
      { key: 'assertividade', label: 'Assertividade', description: 'Firmeza e confiança na comunicação' },
      { key: 'consistencia', label: 'Consistência', description: 'Manutenção do padrão comunicativo' }
    ]
  },
  {
    key: 'aptidaoFisica',
    label: 'Aptidão Física',
    weight: 1,
    subCriteria: [
      { key: 'resistencia', label: 'Resistência', description: 'Capacidade de sustentação do esforço' },
      { key: 'forca', label: 'Força', description: 'Potência física demonstrada' },
      { key: 'agilidade', label: 'Agilidade', description: 'Velocidade e coordenação motora' }
    ]
  },
  {
    key: 'lideranca',
    label: 'Liderança',
    weight: 1,
    subCriteria: [
      { key: 'motivacao', label: 'Motivação', description: 'Capacidade de inspirar e engajar' },
      { key: 'gestaoConflitos', label: 'Gestão de Conflitos', description: 'Resolução de situações tensas' },
      { key: 'tomadaDecisao', label: 'Tomada de Decisão', description: 'Decisões rápidas e assertivas' }
    ]
  },
  {
    key: 'operacional',
    label: 'Operacional',
    weight: 1,
    subCriteria: [
      { key: 'equipagem', label: 'Equipagem', description: 'Preparação e checagem de equipamentos' },
      { key: 'lancamento', label: 'Lançamento', description: 'Procedimentos de início da atividade' },
      { key: 'frenagem', label: 'Frenagem', description: 'Controle e parada segura' }
    ]
  }
];

interface EvaluationFormProps {
  onSubmit: (data: EvaluationData) => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    trainingTitle: '',
    candidateName: '',
    age: '',
    trainingDate: '',
    daysCount: '',
    candidatePhoto: null as File | null,
  });

  const [attendance, setAttendance] = useState<boolean[]>([]);
  
  // Inicializar critérios com subtópicos
  const [criteria, setCriteria] = useState(() => {
    const initialCriteria: any = {};
    criteriaConfig.forEach(config => {
      initialCriteria[config.key] = {
        average: 5
      };
      config.subCriteria.forEach(sub => {
        initialCriteria[config.key][sub.key] = 5;
      });
    });
    return initialCriteria;
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Calcular horas automaticamente (8h por dia)
  const hoursCount = parseInt(formData.daysCount) * 8 || 0;

  // Calcular média quando subtópicos mudarem
  const updateCriteriaAverage = (criteriaKey: string, subKey: string, value: number) => {
    setCriteria(prev => {
      const updated = { ...prev };
      updated[criteriaKey] = { ...updated[criteriaKey], [subKey]: value };
      
      // Calcular média dos subtópicos
      const config = criteriaConfig.find(c => c.key === criteriaKey);
      if (config) {
        const subValues = config.subCriteria.map(sub => updated[criteriaKey][sub.key]);
        const average = subValues.reduce((sum, val) => sum + val, 0) / subValues.length;
        updated[criteriaKey].average = average;
      }
      
      return updated;
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'daysCount') {
      const days = parseInt(value) || 0;
      setAttendance(new Array(days).fill(true));
    }
  };

  // Verificar se é dispositivo móvel
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, candidatePhoto: file }));
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Criar um elemento de vídeo temporário para capturar a imagem
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            setFormData(prev => ({ ...prev, candidatePhoto: file }));
            const url = URL.createObjectURL(file);
            setPhotoPreview(url);
          }
        }, 'image/jpeg', 0.8);
        
        // Parar o stream da câmera
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      // Fallback para upload de arquivo
      document.getElementById('photo-upload')?.click();
    }
  };

  const handleAttendanceChange = (dayIndex: number, present: boolean) => {
    setAttendance(prev => {
      const updated = [...prev];
      updated[dayIndex] = present;
      return updated;
    });
  };

  const generateDetailedFeedback = (classification: string, criteriaScores: any) => {
    const feedback: string[] = [];
    
    const improvementSuggestions = {
      seguranca: {
        prevencao: 'Realize cursos de identificação de riscos e análise de cenários perigosos.',
        epi: 'Pratique o uso correto dos equipamentos de proteção individual e faça treinamentos específicos.',
        procedimentos: 'Estude e pratique os protocolos de segurança estabelecidos.'
      },
      tecnica: {
        conhecimento: 'Dedique mais tempo ao estudo teórico e participe de workshops técnicos.',
        execucao: 'Pratique as técnicas com supervisão e busque mentoria especializada.',
        eficiencia: 'Trabalhe na otimização de processos e gestão de tempo durante as atividades.'
      },
      comunicacao: {
        clareza: 'Pratique técnicas de oratória e comunicação assertiva.',
        assertividade: 'Desenvolva confiança através de exercícios de liderança e comunicação.',
        consistencia: 'Mantenha um padrão comunicativo através de prática regular.'
      },
      aptidaoFisica: {
        resistencia: 'Implemente um programa de condicionamento físico focado em resistência.',
        forca: 'Desenvolva um plano de treinamento de força específico para a atividade.',
        agilidade: 'Pratique exercícios de coordenação motora e velocidade.'
      },
      lideranca: {
        motivacao: 'Desenvolva habilidades de coaching e técnicas motivacionais.',
        gestaoConflitos: 'Estude técnicas de mediação e resolução de conflitos.',
        tomadaDecisao: 'Pratique cenários de tomada de decisão sob pressão.'
      },
      operacional: {
        equipagem: 'Pratique os procedimentos de checagem e preparação de equipamentos.',
        lancamento: 'Revise e pratique os protocolos de início das atividades.',
        frenagem: 'Treine técnicas de controle e parada segura.'
      }
    };

    if (classification === 'rejected') {
      feedback.push('🔴 REPROVADO - Ações necessárias para aprovação:');
    } else if (classification === 'reevaluation') {
      feedback.push('🟡 REAVALIAÇÃO - Pontos que precisam ser aprimorados:');
    }

    criteriaConfig.forEach(config => {
      const criteriaScore = criteriaScores[config.key];
      if (criteriaScore.average < 8) {
        const lowSubCriteria = config.subCriteria.filter(sub => 
          criteriaScores[config.key][sub.key] < 8
        );
        
        if (lowSubCriteria.length > 0) {
          feedback.push(`\n📋 ${config.label} (Nota: ${criteriaScore.average.toFixed(1)}):`);
          
          lowSubCriteria.forEach(sub => {
            const score = criteriaScores[config.key][sub.key];
            const suggestion = improvementSuggestions[config.key as keyof typeof improvementSuggestions]?.[sub.key as keyof any];
            feedback.push(`   • ${sub.label} (${score}): ${suggestion}`);
          });
        }
      }
    });

    if (classification === 'rejected') {
      feedback.push('\n💡 Recomendação: Participe de um treinamento adicional focado nos pontos de melhoria identificados antes de uma nova avaliação.');
    } else if (classification === 'reevaluation') {
      feedback.push('\n💡 Recomendação: Dedique tempo extra aos pontos mencionados e solicite uma reavaliação em 30 dias.');
    }

    return feedback;
  };

  const calculateResults = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    criteriaConfig.forEach(config => {
      const score = criteria[config.key].average;
      totalWeightedScore += score * config.weight;
      totalWeight += config.weight;
    });

    const finalScore = totalWeightedScore / totalWeight;
    
    let classification: 'approved' | 'reevaluation' | 'rejected';
    if (finalScore > 8) {
      classification = 'approved';
    } else if (finalScore >= 7) {
      classification = 'reevaluation';
    } else {
      classification = 'rejected';
    }

    const feedback = generateDetailedFeedback(classification, criteria);

    return { finalScore, classification, feedback };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { finalScore, classification, feedback } = calculateResults();
    
    // Converter string da data para Date object
    const trainingDateObj = formData.trainingDate ? new Date(formData.trainingDate) : new Date();
    
    const evaluationData: EvaluationData = {
      trainingTitle: formData.trainingTitle,
      candidateName: formData.candidateName,
      age: parseInt(formData.age),
      trainingDate: trainingDateObj,
      daysCount: parseInt(formData.daysCount),
      attendance,
      hoursCount,
      candidatePhoto: formData.candidatePhoto || undefined,
      candidatePhotoUrl: photoPreview || undefined,
      criteria: criteria as EvaluationData['criteria'],
      finalScore,
      classification,
      feedback
    };

    onSubmit(evaluationData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dados Básicos */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2" style={{borderColor: '#103722'}}>
        <h2 className="text-xl font-semibold mb-4" style={{color: '#103722'}}>Dados Básicos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trainingTitle">Título do Treinamento</Label>
            <Input
              id="trainingTitle"
              value={formData.trainingTitle}
              onChange={(e) => handleInputChange('trainingTitle', e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="candidateName">Nome do Candidato</Label>
            <Input
              id="candidateName"
              value={formData.candidateName}
              onChange={(e) => handleInputChange('candidateName', e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="trainingDate">Data do Treinamento</Label>
            <Input
              id="trainingDate"
              type="date"
              value={formData.trainingDate}
              onChange={(e) => handleInputChange('trainingDate', e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="daysCount">Quantidade de Dias</Label>
            <Input
              id="daysCount"
              type="number"
              value={formData.daysCount}
              onChange={(e) => handleInputChange('daysCount', e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="hoursCount">Quantidade de Horas (Automático)</Label>
            <Input
              id="hoursCount"
              type="number"
              value={hoursCount}
              readOnly
              className="mt-1 bg-gray-100"
              title="Calculado automaticamente: 8 horas por dia"
            />
            <p className="text-xs text-gray-600 mt-1">8 horas por dia de treinamento</p>
          </div>
        </div>

        {/* Presença */}
        {parseInt(formData.daysCount) > 0 && (
          <div className="mt-6">
            <Label>Presença por Dia</Label>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {attendance.map((present, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${index}`}
                    checked={present}
                    onCheckedChange={(checked) => handleAttendanceChange(index, checked as boolean)}
                  />
                  <Label htmlFor={`day-${index}`} className="text-sm">
                    Dia {index + 1}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload de Foto */}
        <div className="mt-6">
          <Label>Foto do Candidato</Label>
          <div className="mt-2 flex items-center space-x-4">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-full border-2"
                style={{borderColor: '#103722'}}
              />
            ) : (
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex space-x-2">
              {isMobile && (
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={handleCameraCapture}
                  className="hover:bg-opacity-10"
                  style={{borderColor: '#103722', color: '#103722'}}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Câmera
                </Button>
              )}
              
              <label htmlFor="photo-upload">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer hover:bg-opacity-10"
                  style={{borderColor: '#103722', color: '#103722'}}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
            </div>
            
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              capture={isMobile ? "user" : undefined}
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      {/* Critérios de Avaliação */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2" style={{borderColor: '#103722'}}>
        <h2 className="text-xl font-semibold mb-6" style={{color: '#103722'}}>Critérios de Avaliação</h2>
        
        <div className="space-y-8">
          {criteriaConfig.map((config) => (
            <div key={config.key} className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold" style={{color: '#103722'}}>
                    {config.label} {config.weight > 1 && <span className="text-sm" style={{color: '#006633'}}>(Peso {config.weight})</span>}
                  </h3>
                  <p className="text-lg font-bold mt-1" style={{color: '#006633'}}>
                    Média: {criteria[config.key].average.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Subtópicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-4">
                {config.subCriteria.map((subCriteria) => (
                  <div key={subCriteria.key} className="space-y-2 p-4 bg-white rounded-lg border" style={{borderColor: '#103722'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="font-medium" style={{color: '#103722'}}>
                          {subCriteria.label}
                        </Label>
                        <p className="text-xs text-gray-600">{subCriteria.description}</p>
                      </div>
                      <div className="text-xl font-bold min-w-[2rem] text-center" style={{color: '#006633'}}>
                        {criteria[config.key][subCriteria.key]}
                      </div>
                    </div>
                    
                    <Slider
                      value={[criteria[config.key][subCriteria.key]]}
                      onValueChange={(value) => updateCriteriaAverage(config.key, subCriteria.key, value[0])}
                      max={10}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button 
        type="submit" 
        className="w-full py-3 text-lg text-white hover:opacity-90"
        style={{backgroundColor: '#006633'}}
      >
        Gerar Relatório de Avaliação
      </Button>
    </form>
  );
};

export default EvaluationForm;
