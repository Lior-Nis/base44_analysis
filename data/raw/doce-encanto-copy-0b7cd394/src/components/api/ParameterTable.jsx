import React from 'react';

export default function ParameterTable({ title, parameters }) {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 font-medium text-gray-600">Nome</th>
              <th className="p-3 font-medium text-gray-600">Tipo</th>
              <th className="p-3 font-medium text-gray-600">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map(param => (
              <tr key={param.name} className="border-t border-gray-200">
                <td className="p-3 font-mono text-orange-600">{param.name}</td>
                <td className="p-3 text-gray-500">{param.type}</td>
                <td className="p-3 text-gray-600">{param.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}