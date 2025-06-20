
export interface SubCriteria {
  [key: string]: number;
}

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
  
  // Critérios de avaliação com subtópicos
  criteria: {
    seguranca: {
      prevencao: number;
      epi: number;
      procedimentos: number;
      average: number;
    };
    tecnica: {
      conhecimento: number;
      execucao: number;
      eficiencia: number;
      average: number;
    };
    comunicacao: {
      clareza: number;
      assertividade: number;
      consistencia: number;
      average: number;
    };
    aptidaoFisica: {
      resistencia: number;
      forca: number;
      agilidade: number;
      average: number;
    };
    lideranca: {
      motivacao: number;
      gestaoConflitos: number;
      tomadaDecisao: number;
      average: number;
    };
    operacional: {
      equipagem: number;
      lancamento: number;
      frenagem: number;
      average: number;
    };
  };
  
  // Resultados calculados
  finalScore: number;
  classification: 'approved' | 'reevaluation' | 'rejected';
  feedback: string[];
}

export interface CriteriaConfig {
  key: keyof EvaluationData['criteria'];
  label: string;
  weight: number;
  subCriteria: {
    key: string;
    label: string;
    description: string;
  }[];
}
