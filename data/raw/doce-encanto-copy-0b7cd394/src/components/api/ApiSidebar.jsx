import React from 'react';
import { Input } from '@/components/ui/input';
import { BookOpen, Search } from 'lucide-react';

export default function ApiSidebar({ categories, activeCategory, setActiveCategory, searchTerm, setSearchTerm }) {
  return (
    <aside className="w-72 h-screen sticky top-0 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">API Doce Encanto</h1>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Pesquisar endpoints..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <nav className="flex-grow overflow-y-auto">
        <ul>
          <li className="mb-2">
            <button
              onClick={() => setActiveCategory("Introdução")}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeCategory === "Introdução" ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Introdução
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.category} className="mb-2">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{cat.category}</h3>
              <ul>
                {cat.endpoints.map(endpoint => (
                  <li key={`${endpoint.method}-${endpoint.path}`}>
                    {/* Placeholder for future per-endpoint navigation */}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setActiveCategory(cat.category)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === cat.category ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.category}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}