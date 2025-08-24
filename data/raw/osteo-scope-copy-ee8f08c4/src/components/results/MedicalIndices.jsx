import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bone, Target, Calculator, Microscope, Activity, Brain } from "lucide-react";

// Helper component for a consistent card style
const IndexCard = ({ icon: Icon, title, value, unit, description, interpretation, interpretationColor }) => (
  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col">
    <div className="flex items-center gap-3 mb-3">
      <Icon className="w-6 h-6 text-blue-600" />
      <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
    </div>
    <div className="flex-grow space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
    {interpretation && (
      <div className="mt-4 pt-3 border-t border-slate-200">
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${interpretationColor}`}>
          Interpretation: {interpretation}
        </span>
      </div>
    )}
  </div>
);

// Helper for Texture Values
const TextureCard = ({ analysis }) => {
  const textureMetrics = [
    { name: "GLCM Contrast", value: analysis.texture_contrast?.toFixed(3), icon: Activity },
    { name: "GLCM Homogeneity", value: analysis.texture_homogeneity?.toFixed(3), icon: Target },
    { name: "Fractal Dimension", value: analysis.fractal_dimension?.toFixed(3), icon: Brain },
  ];

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
      <div className="flex items-center gap-3 mb-4">
        <Microscope className="w-6 h-6 text-blue-600" />
        <h3 className="font-semibold text-lg text-slate-900">Texture Analysis Summary</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {textureMetrics.map((metric, i) => (
          <div key={i} className="text-center p-3 bg-white rounded-lg border">
            <metric.icon className="w-5 h-5 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">{metric.name}</p>
            <p className="text-xl font-bold text-slate-900">{metric.value || 'N/A'}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3 text-center">Quantitative assessment of bone microarchitecture.</p>
    </div>
  );
};


export default function MedicalIndices({ analysis }) {

  const getInterpretationColor = (interpretation) => {
    switch (interpretation) {
      case 'Normal': return 'text-green-800 bg-green-100';
      case 'Osteopenic':
      case 'Reduced': return 'text-yellow-800 bg-yellow-100';
      case 'Osteoporotic':
      case 'Severely Reduced': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const renderContent = () => {
    switch (analysis.anatomical_region) {
      case 'proximal_femur':
        const singhInterpretation = analysis.singh_index >= 5 ? "Normal" : analysis.singh_index >= 3 ? "Osteopenic" : "Osteoporotic";
        return (
          <IndexCard
            icon={Bone}
            title="Singh Index"
            value={analysis.singh_index}
            unit="/ 6"
            description="Assessment of trabecular patterns in the proximal femur to evaluate bone strength."
            interpretation={singhInterpretation}
            interpretationColor={getInterpretationColor(singhInterpretation)}
          />
        );

      case 'calcaneus':
        const jhamariaInterpretation = analysis.jhamaria_index >= 8 ? "Normal" : analysis.jhamaria_index >= 5 ? "Osteopenic" : "Osteoporotic";
        return (
          <IndexCard
            icon={Target}
            title="Jhamaria Index"
            value={analysis.jhamaria_index}
            unit="/ 10"
            description="Evaluation of trabecular architecture in the calcaneus (heel bone)."
            interpretation={jhamariaInterpretation}
            interpretationColor={getInterpretationColor(jhamariaInterpretation)}
          />
        );

      case 'clavicle':
        const clavicleInterpretation = analysis.cortical_thickness_mm >= 4 ? "Normal" : analysis.cortical_thickness_mm >= 2.5 ? "Reduced" : "Severely Reduced";
        return (
          <IndexCard
            icon={Calculator}
            title="Radiogrammetry"
            value={analysis.cortical_thickness_mm?.toFixed(2)}
            unit="mm"
            description="Measurement of cortical bone thickness in the clavicle."
            interpretation={clavicleInterpretation}
            interpretationColor={getInterpretationColor(clavicleInterpretation)}
          />
        );

      case 'wrist_radius':
        const wristInterpretation = analysis.cortical_thickness_mm >= 4 ? "Normal" : analysis.cortical_thickness_mm >= 2.5 ? "Reduced" : "Severely Reduced";
        return (
          <div className="space-y-6">
            <IndexCard
              icon={Calculator}
              title="Radiogrammetry"
              value={analysis.cortical_thickness_mm?.toFixed(2)}
              unit="mm"
              description="Measurement of cortical bone thickness in the distal radius."
              interpretation={wristInterpretation}
              interpretationColor={getInterpretationColor(wristInterpretation)}
            />
            <TextureCard analysis={analysis} />
          </div>
        );

      case 'lumbar_spine':
        return <TextureCard analysis={analysis} />;

      default:
        return (
          <div className="text-center py-8 text-slate-500">
            <p>No specific clinical index is applicable for the analyzed region.</p>
          </div>
        );
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Clinical Diagnostic Indices</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}