import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock from './CodeBlock';

const statusColors = {
  '200': 'text-green-600',
  '201': 'text-green-600',
  '400': 'text-yellow-600',
  '401': 'text-red-600',
  '404': 'text-red-600',
  '500': 'text-purple-600',
};

export default function ResponseTabs({ responses }) {
  const responseCodes = Object.keys(responses);
  
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-2">Respostas Possíveis</h4>
      <Tabs defaultValue={responseCodes[0]} className="w-full">
        <TabsList>
          {responseCodes.map(code => (
            <TabsTrigger key={code} value={code} className={statusColors[code] || 'text-gray-700'}>
              {code} {responses[code].description}
            </TabsTrigger>
          ))}
        </TabsList>
        {responseCodes.map(code => (
          <TabsContent key={code} value={code}>
            <CodeBlock language="json" code={JSON.stringify(responses[code].example, null, 2)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}