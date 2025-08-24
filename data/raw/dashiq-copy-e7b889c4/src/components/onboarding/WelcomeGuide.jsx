import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, Upload, PieChart, Target } from 'lucide-react';
import { t, isRTL } from '@/components/utils/i18n';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const WelcomeGuide = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const isRTLLayout = isRTL();

  const steps = [
    {
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description'),
      icon: <Sparkles className="w-12 h-12 text-blue-500" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">{t('onboarding.welcome.subtitle')}</p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">{t('onboarding.welcome.features')}</p>
          </div>
        </div>
      )
    },
    {
      title: t('onboarding.upload.title'),
      description: t('onboarding.upload.description'),
      icon: <Upload className="w-12 h-12 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('onboarding.upload.instruction')}</p>
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-green-800">{t('onboarding.upload.supportedFormats')}</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• CSV {t('onboarding.upload.csvFormat')}</li>
              <li>• {t('onboarding.upload.currencySupport')}</li>
              <li>• {t('onboarding.upload.hebrewSupport')}</li>
            </ul>
          </div>
        </div>
      ),
      action: {
        label: t('onboarding.upload.goToUpload'),
        onClick: () => navigate(createPageUrl('Upload'))
      }
    },
    {
      title: t('onboarding.categories.title'),
      description: t('onboarding.categories.description'),
      icon: <PieChart className="w-12 h-12 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('onboarding.categories.instruction')}</p>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800">{t('onboarding.categories.autoCreated')}</p>
          </div>
        </div>
      ),
      action: {
        label: t('onboarding.categories.manageCategories'),
        onClick: () => navigate(createPageUrl('CategoryManagement'))
      }
    },
    {
      title: t('onboarding.budget.title'),
      description: t('onboarding.budget.description'),
      icon: <Target className="w-12 h-12 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t('onboarding.budget.instruction')}</p>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-800">{t('onboarding.budget.benefits')}</p>
          </div>
        </div>
      ),
      action: {
        label: t('onboarding.budget.createBudget'),
        onClick: () => navigate(createPageUrl('Budget'))
      }
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipGuide = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={isRTLLayout ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {currentStepData.title}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {currentStepData.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-500' : 
                  index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  {isRTLLayout ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  {t('common.previous')}
                </Button>
              )}
              <Button variant="ghost" onClick={skipGuide} className="text-gray-500">
                {t('onboarding.skip')}
              </Button>
            </div>
            
            <div className="flex gap-2">
              {currentStepData.action && (
                <Button variant="outline" onClick={currentStepData.action.onClick}>
                  {currentStepData.action.label}
                </Button>
              )}
              <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('onboarding.getStarted')}
                  </>
                ) : (
                  <>
                    {t('common.next')}
                    {isRTLLayout ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeGuide;