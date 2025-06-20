
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
    description: 'Prevenção, EPI, procedimentos',
    weight: 2
  },
  {
    key: 'tecnica',
    label: 'Técnica', 
    description: 'Conhecimento, execução, eficiência',
    weight: 2
  },
  {
    key: 'comunicacao',
    label: 'Comunicação',
    description: 'Clareza, assertividade, consistência', 
    weight: 1
  },
  {
    key: 'aptidaoFisica',
    label: 'Aptidão Física',
    description: 'Resistência, força, agilidade',
    weight: 1
  },
  {
    key: 'lideranca',
    label: 'Liderança',
    description: 'Motivação, gestão de conflitos, tomada de decisão',
    weight: 1
  },
  {
    key: 'operacional',
    label: 'Operacional',
    description: 'Equipagem, lançamento, frenagem',
    weight: 1
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
  const [criteria, setCriteria] = useState<Record<string, number>>({
    seguranca: 5,
    tecnica: 5,
    comunicacao: 5,
    aptidaoFisica: 5,
    lideranca: 5,
    operacional: 5,
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');

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
      const score = criteria[config.key];
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
      const score = criteria[config.key];
      if (score < 8) {
        feedback.push(`${config.label}: Necessário melhorar ${config.description.toLowerCase()}.`);
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
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Dados Básicos</h2>
        
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
                className="h-20 w-20 object-cover rounded-full border-2 border-blue-200"
              />
            ) : (
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <label htmlFor="photo-upload">
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
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
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Critérios de Avaliação</h2>
        
        <div className="space-y-6">
          {criteriaConfig.map((config) => (
            <div key={config.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-lg font-medium">
                    {config.label} {config.weight > 1 && <span className="text-sm text-blue-600">(Peso {config.weight})</span>}
                  </Label>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
                <div className="text-2xl font-bold text-blue-600 min-w-[3rem] text-center">
                  {criteria[config.key]}
                </div>
              </div>
              
              <Slider
                value={[criteria[config.key]]}
                onValueChange={(value) => setCriteria(prev => ({ ...prev, [config.key]: value[0] }))}
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
      </Card>

      <Button 
        type="submit" 
        className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
      >
        Gerar Relatório de Avaliação
      </Button>
    </form>
  );
};

export default EvaluationForm;
