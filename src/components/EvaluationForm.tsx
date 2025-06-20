
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, User } from 'lucide-react';
import { format } from 'date-fns';
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
    trainingDate: undefined as Date | undefined,
    daysCount: '',
    hoursCount: '',
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, candidatePhoto: file }));
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleAttendanceChange = (dayIndex: number, present: boolean) => {
    setAttendance(prev => {
      const updated = [...prev];
      updated[dayIndex] = present;
      return updated;
    });
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

    const feedback: string[] = [];
    criteriaConfig.forEach(config => {
      const score = criteria[config.key].average;
      if (score < 8) {
        // Identificar subtópicos com nota baixa
        const lowSubCriteria = config.subCriteria.filter(sub => criteria[config.key][sub.key] < 8);
        if (lowSubCriteria.length > 0) {
          feedback.push(`${config.label}: Melhorar ${lowSubCriteria.map(sub => sub.label.toLowerCase()).join(', ')}.`);
        }
      }
    });

    return { finalScore, classification, feedback };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { finalScore, classification, feedback } = calculateResults();
    
    const evaluationData: EvaluationData = {
      trainingTitle: formData.trainingTitle,
      candidateName: formData.candidateName,
      age: parseInt(formData.age),
      trainingDate: formData.trainingDate!,
      daysCount: parseInt(formData.daysCount),
      attendance,
      hoursCount: parseInt(formData.hoursCount),
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
            <Label>Data do Treinamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !formData.trainingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.trainingDate ? format(formData.trainingDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.trainingDate}
                  onSelect={(date) => handleInputChange('trainingDate', date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
            <Label htmlFor="hoursCount">Quantidade de Horas</Label>
            <Input
              id="hoursCount"
              type="number"
              value={formData.hoursCount}
              onChange={(e) => handleInputChange('hoursCount', e.target.value)}
              required
              className="mt-1"
            />
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
            
            <label htmlFor="photo-upload">
              <Button 
                variant="outline" 
                size="sm" 
                className="cursor-pointer hover:bg-opacity-10"
                style={{borderColor: '#103722', color: '#103722'}}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Foto
                </span>
              </Button>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
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
