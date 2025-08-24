import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from 'lucide-react';
import CodeBlock from './CodeBlock';
import ParameterTable from './ParameterTable';
import ResponseTabs from './ResponseTabs';

const methodColors = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function EndpointCard({ endpoint }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${methodColors[endpoint.method]}`}>
            {endpoint.method}
          </span>
          <span className="font-mono text-sm font-medium text-gray-800">{endpoint.path}</span>
          <p className="text-sm text-gray-500">{endpoint.summary}</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-gray-200">
              <p className="text-gray-600 mb-6">{endpoint.description}</p>
              
              {endpoint.parameters?.path?.length > 0 && (
                <ParameterTable title="Parâmetros de Caminho (Path)" parameters={endpoint.parameters.path} />
              )}
              {endpoint.parameters?.query?.length > 0 && (
                <ParameterTable title="Parâmetros de Consulta (Query)" parameters={endpoint.parameters.query} />
              )}
              
              {endpoint.requestBody && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Corpo da Requisição (Request Body)</h4>
                  <p className="text-sm text-gray-600 mb-2">{endpoint.requestBody.description}</p>
                  <CodeBlock language="json" code={JSON.stringify(endpoint.requestBody.example, null, 2)} />
                </div>
              )}

              <ResponseTabs responses={endpoint.responses} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}