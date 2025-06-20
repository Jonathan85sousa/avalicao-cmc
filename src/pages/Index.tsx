
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import EvaluationForm from '@/components/EvaluationForm';
import EvaluationReport from '@/components/EvaluationReport';
import { EvaluationData } from '@/types/evaluation';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'report'>('form');
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);

  const handleFormSubmit = (data: EvaluationData) => {
    setEvaluationData(data);
    setCurrentStep('report');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setEvaluationData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'form' ? (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Avaliação de Desempenho
                </h1>
                <p className="text-lg text-gray-600">
                  Treinamento de Condutor de Turismo de Aventura
                </p>
              </div>
              
              <EvaluationForm onSubmit={handleFormSubmit} />
            </Card>
          </div>
        ) : (
          evaluationData && (
            <EvaluationReport 
              data={evaluationData} 
              onBack={handleBackToForm}
            />
          )
        )}
      </main>
    </div>
  );
};

export default Index;
