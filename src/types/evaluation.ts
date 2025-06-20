
export interface EvaluationData {
  // Dados básicos
  trainingTitle: string;
  candidateName: string;
  age: number;
  trainingDate: Date;
  daysCount: number;
  attendance: boolean[];
  hoursCount: number;
  candidatePhoto?: File;
  candidatePhotoUrl?: string;
  
  // Critérios de avaliação
  criteria: {
    seguranca: number;
    tecnica: number;
    comunicacao: number;
    aptidaoFisica: number;
    lideranca: number;
    operacional: number;
  };
  
  // Resultados calculados
  finalScore: number;
  classification: 'approved' | 'reevaluation' | 'rejected';
  feedback: string[];
}

export interface CriteriaConfig {
  key: keyof EvaluationData['criteria'];
  label: string;
  description: string;
  weight: number;
}
