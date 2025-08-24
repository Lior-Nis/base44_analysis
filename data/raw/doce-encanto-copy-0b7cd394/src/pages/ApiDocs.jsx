import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Shield, BookOpen, GitBranch, Cloud, Database, Cpu, Bot as BotIcon } from 'lucide-react';

const ApiSection = ({ title, icon, children }) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
      {children}
    </CardContent>
  </Card>
);

const Endpoint = ({ method, path, description, children }) => (
    <div className="my-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-4 mb-2">
            <Badge className={`${
                method === 'GET' ? 'bg-blue-600' :
                method === 'POST' ? 'bg-green-600' :
                method === 'PUT' ? 'bg-yellow-600' :
                'bg-red-600'
            } text-white`}>{method}</Badge>
            <code className="text-lg font-mono text-gray-800">{path}</code>
        </div>
        <p className="text-gray-600">{description}</p>
        {children && <div className="mt-4">{children}</div>}
    </div>
);

export default function ApiDocs() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">Documentação da API - Confeitaria Nexus</h1>
          <p className="text-xl text-gray-600">A planta técnica para uma confeitaria inteligente e conectada.</p>
        </header>

        <ApiSection title="I. Arquitetura Fundamental de IA: O Núcleo Java" icon={<Cpu className="w-8 h-8 text-purple-600"/>}>
            <p>Esta seção estabelece os princípios arquitetônicos e as tecnologias que possibilitam um agente de IA poderoso, escalável e com aprendizado contínuo. A escolha do Java é estratégica, impulsionada pela sua robustez, performance e adequação para ambientes corporativos.</p>
            
            <h3>A. Frameworks e Bibliotecas Essenciais</h3>
            <ul>
                <li><strong>Deeplearning4j (DL4J):</strong> Framework de código aberto para deep learning, essencial para redes neurais (CNNs e RNNs) e computação distribuída.</li>
                <li><strong>Spring AI & LangChain4J:</strong> Frameworks modernos para integração com LLMs, gerenciamento de conversas e construção de aplicações RAG (Geração Aumentada por Recuperação).</li>
                <li><strong>PLN (Processamento de Linguagem Natural):</strong> Uso de bibliotecas como Stanford CoreNLP, Apache OpenNLP, MALLET e LingPipe para análise de sentimento, reconhecimento de entidades e modelagem de tópicos.</li>
                <li><strong>Visão Computacional:</strong> Uso de OpenCV (via JavaCV), ImageJ e BoofCV para análise de imagem em tempo real, detecção de objetos e processamento de imagem científica.</li>
            </ul>

            <h3>B. Construindo o Loop do Agente de IA Conversacional</h3>
            <p>A IA é arquitetada em torno do paradigma do "Loop do Agente", operando em ciclos contínuos de decisão, execução e aprendizado. Uma arquitetura multiagente com um orquestrador central delega tarefas a agentes especializados (Marketing, Análise de Vídeo, etc.), garantindo eficiência e escalabilidade.</p>
            <ul>
                <li><strong>Mensagens:</strong> Uma classe `Message` mantém o contexto e a memória da conversa.</li>
                <li><strong>Ferramentas:</strong> Objetos `Tool` definem as capacidades do agente, como interagir com a API da confeitaria ou gerar conteúdo.</li>
                <li><strong>Ações:</strong> Um objeto `Action` encapsula a ferramenta a ser usada e seus parâmetros, permitindo a execução de tarefas complexas.</li>
            </ul>

            <h3>C. Habilitando o Aprendizado Contínuo e a Memória de Longo Prazo</h3>
            <p>Para que a IA "aprenda com o tempo sem limites", implementamos estratégias para mitigar o "esquecimento catastrófico" e garantir uma memória persistente e de longo prazo.</p>
            <ul>
                <li><strong>Estratégias de Aprendizado:</strong> Buffers de Replay, técnicas de regularização e arquiteturas de crescimento dinâmico.</li>
                <li><strong>Memória de Longo Prazo:</strong>
                    <ul>
                        <li><strong>Memória de Chat:</strong> Armazenamento persistente do histórico de conversas (ex: `JdbcChatMemoryRepository`).</li>
                        <li><strong>Armazenamentos de Vetores:</strong> Bancos de dados de vetores para pesquisa semântica eficiente e RAG.</li>
                        <li><strong>Grafo de Conhecimento:</strong> O "cérebro" da IA, um banco de dados de grafos (Neo4j) que armazena dados de negócios interconectados, permitindo raciocínio complexo.</li>
                    </ul>
                </li>
            </ul>
        </ApiSection>

        <ApiSection title="II. Capacidades Essenciais de IA" icon={<BotIcon className="w-8 h-8 text-green-600"/>}>
            <p>Esta seção detalha as funcionalidades específicas da IA, demonstrando como ela impulsiona o crescimento do negócio.</p>
            
            <h3>A. Otimização e Geração Inteligente de Conteúdo</h3>
            <p>A IA atua como um estrategista de conteúdo, analisando a qualidade, sentimento e SEO, além de gerar e reescrever conteúdo automaticamente.</p>

            <h3>B. Orquestração Dinâmica de Campanhas de Marketing</h3>
            <p>A IA é um estrategista de marketing proativo, realizando segmentação de público, análise preditiva e otimização de campanhas e orçamentos em tempo real.</p>
            
            <h3>C. Inteligência de Vídeo Avançada e Geração de Roteiros</h3>
            <p>A IA analisa vídeos (conteúdo, ritmo, estética) e gera roteiros personalizados, adaptando-se a exemplos para capturar a "energia" desejada.</p>
            
            <h3>D. Orientação de Negócios Interativa e Resolução de Problemas</h3>
            <p>Utilizando o Grafo de Conhecimento, a IA diagnostica problemas, sugere soluções e oferece orientação interativa passo a passo, como um coach digital.</p>
        </ApiSection>

        <ApiSection title="III. Endpoints da API da Confeitaria" icon={<GitBranch className="w-8 h-8 text-blue-600"/>}>
             <p>A API REST será construída com Spring Boot, seguindo os melhores padrões de design para garantir segurança e escalabilidade.</p>
             
             <h4>Gestão de Produtos</h4>
             <Endpoint method="GET" path="/api/products" description="Lista todos os produtos com filtros opcionais (categoria, destaque)."/>
             <Endpoint method="GET" path="/api/products/{id}" description="Obtém os detalhes completos de um produto específico."/>
             
             <h4>Pedidos Online</h4>
             <Endpoint method="POST" path="/api/orders" description="Cria um novo pedido com itens, personalizações e dados do cliente."/>
             <Endpoint method="GET" path="/api/orders/{orderId}" description="Consulta o status e detalhes de um pedido."/>
             <Endpoint method="GET" path="/api/users/{userId}/orders" description="Lista o histórico de pedidos de um usuário."/>

             <h4>Recomendações e Fidelidade</h4>
             <Endpoint method="GET" path="/api/users/{userId}/recommendations" description="Gera recomendações de produtos personalizadas."/>
             <Endpoint method="GET" path="/api/users/{userId}/loyalty" description="Consulta o saldo de pontos de fidelidade."/>
             <Endpoint method="POST" path="/api/loyalty/redeem" description="Resgata pontos de fidelidade por recompensas."/>

             <h4>Avaliações e Galeria</h4>
             <Endpoint method="POST" path="/api/products/{productId}/reviews" description="Registra uma nova avaliação para um produto."/>
             <Endpoint method="POST" path="/api/gallery/upload" description="Envia uma foto para a galeria de clientes."/>
             <Endpoint method="GET" path="/api/gallery" description="Exibe a galeria de fotos aprovadas."/>

             <h4>Reservas e Orçamentos</h4>
             <Endpoint method="POST" path="/api/reservations/quote" description="Solicita um orçamento para um bolo personalizado ou evento."/>
        </ApiSection>
        
        <ApiSection title="IV. Visão Conclusiva e Recomendações" icon={<BookOpen className="w-8 h-8 text-orange-600"/>}>
            <p>A implementação do Agente de IA Confeitaria Nexus é uma revolução para o negócio. Para maximizar seu potencial, recomendamos:</p>
            <ul>
                <li><strong>Desenvolvimento Faseado:</strong> Adotar uma abordagem ágil, começando com funcionalidades essenciais e iterando com base no feedback.</li>
                <li><strong>Governança de Dados:</strong> Manter dados de alta qualidade como base para uma IA eficaz.</li>
                <li><strong>Colaboração Interfuncional:</strong> Promover a colaboração entre as equipes de negócio, marketing e desenvolvimento.</li>
                <li><strong>Monitoramento Contínuo (MLOps):</strong> Manter práticas robustas de MLOps para garantir o aprendizado e desempenho da IA.</li>
                <li><strong>Segurança em Primeiro Lugar:</strong> Integrar segurança em todo o ciclo de vida do desenvolvimento.</li>
            </ul>
        </ApiSection>
      </div>
    </div>
  );
}