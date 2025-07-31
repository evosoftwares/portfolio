import React, { useState } from 'react';
import { Modal, Tabs, Select, Slider } from './ui';
import aiGenerator from '../services/aiGenerator';

const ProposalModal = ({ isOpen, onClose, cardData }) => {
  const [activeTab, setActiveTab] = useState('config');
  const [formData, setFormData] = useState({
    description: '',
    paymentMethod: '',
    discount: 0,
    // Campos para análise da IA
    projectComplexity: 'medium',
    estimatedHours: 0
  });

  const [errors, setErrors] = useState({});
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // Arrays removidos - IA analisa automaticamente a descrição para determinar componentes necessários

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Descrição do projeto é obrigatória';
    }
    
    if (formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = 'Desconto deve estar entre 0% e 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const tabs = [
    {
      id: 'config',
      label: 'Configurações',
      icon: <i className="fi fi-rr-settings"></i>
    },
    {
      id: 'details',
      label: 'Detalhes',
      icon: <i className="fi fi-rr-document"></i>
    },
    {
      id: 'preview',
      label: 'Visualização',
      icon: <i className="fi fi-rr-eye"></i>
    }
  ];

  const paymentOptions = [
    {
      value: 'half-start-half-end',
      label: 'Metade início, metade fim'
    },
    {
      value: 'progress-payment',
      label: 'Pagamento por avanço no projeto'
    },
    {
      value: 'full-start-discount',
      label: '100% início com 10% de desconto'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    // TODO: Implementar salvamento da proposta
    console.log('Dados da proposta:', formData);
    onClose();
  };

  const handleNextToDetails = async () => {
    if (!validateForm()) {
      return;
    }

    // Ativar loading state
    setAiGenerating(true);
    
    try {
      // A IA analisará automaticamente a descrição do projeto
      // Não precisa de dados de seleção manual - tudo é determinado pela análise
      const aiResponse = await aiGenerator.mockProposalGeneration(formData);
      
      // Armazenar resultados da IA
      setAiResults(aiResponse);
      
      // Navegar para aba de detalhes
      setActiveTab('details');
      
      // Exibir notificação de sucesso
      console.log('✅ IA gerou proposta comercial automaticamente:', aiResponse);
      
    } catch (error) {
      console.error('❌ Erro na geração automática:', error);
      
      // Em caso de erro, ainda permite navegar para detalhes
      setActiveTab('details');
      
      // TODO: Implementar toast/notificação de erro
      setErrors({
        ...errors,
        aiGeneration: 'Erro na geração automática. Você pode continuar manualmente.'
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const renderConfigTab = () => (
    <div className="space-y-8">
      {/* Campo de Descrição */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <label className="text-lg font-semibold text-gray-800 mb-4 block flex items-center">
          <i className="fi fi-rr-document mr-3 text-blue-500"></i>
          Descrição do Projeto
          <span className="text-red-500 ml-2">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descreva detalhadamente todos os requisitos, funcionalidades e expectativas discutidas com o cliente..."
          className={`w-full p-6 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all duration-200 ${
            errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
          }`}
          rows={8}
          required
        />
        {errors.description && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 flex items-center">
              <i className="fi fi-rr-exclamation mr-2"></i>
              {errors.description}
            </p>
          </div>
        )}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700 flex items-start">
            <i className="fi fi-rr-lightbulb mr-2 mt-0.5 text-blue-500"></i>
            <span>Inclua informações sobre tecnologias, prazos, reuniões de acompanhamento e entregas parciais para uma proposta mais completa.</span>
          </p>
        </div>
      </div>

      {/* Método de Pagamento */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <i className="fi fi-rr-credit-card mr-3 text-green-500"></i>
            Método de Pagamento
          </h3>
          <p className="text-sm text-gray-600 mt-2">Selecione a forma de pagamento que melhor se adequa ao projeto</p>
        </div>
        <Select
          value={formData.paymentMethod}
          onChange={(value) => handleInputChange('paymentMethod', value)}
          options={paymentOptions}
          placeholder="Selecione o método de pagamento"
          required
        />
      </div>

      {/* Informações Adicionais */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-3xl border border-blue-200 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-500 p-3 rounded-2xl">
            <i className="fi fi-rr-info text-white text-lg"></i>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">Dicas para uma proposta de sucesso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                  <i className="fi fi-rr-check-circle mr-2 text-green-500"></i>
                  Especificidade
                </h5>
                <p className="text-sm text-blue-700">Seja específico sobre funcionalidades, tecnologias e prazos</p>
              </div>
              <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                  <i className="fi fi-rr-calendar mr-2 text-orange-500"></i>
                  Cronograma
                </h5>
                <p className="text-sm text-blue-700">Inclua reuniões de acompanhamento e entregas parciais</p>
              </div>
              <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                  <i className="fi fi-rr-settings mr-2 text-purple-500"></i>
                  Tecnologias
                </h5>
                <p className="text-sm text-blue-700">Mencione as tecnologias e ferramentas a serem utilizadas</p>
              </div>
              <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                  <i className="fi fi-rr-handshake mr-2 text-pink-500"></i>
                  Comunicação
                </h5>
                <p className="text-sm text-blue-700">Estabeleça canais e frequência de comunicação</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => {
    const complexityOptions = [
      { value: 'simple', label: 'Simples - Layout básico, poucos componentes' },
      { value: 'medium', label: 'Médio - Interface padrão com componentes interativos' },
      { value: 'complex', label: 'Complexo - Interface avançada com animações e recursos especiais' }
    ];

    // Funções de toggle removidas - IA analisa automaticamente a descrição

    return (
       <div className="space-y-8">
         {/* Notificação de Erro da IA */}
         {errors.aiGeneration && (
           <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6">
             <div className="flex items-start">
               <i className="fi fi-rr-exclamation-triangle text-orange-500 text-xl mr-4 mt-1"></i>
               <div>
                 <h4 className="font-semibold text-orange-800 mb-2">Aviso da IA</h4>
                 <p className="text-sm text-orange-700">{errors.aiGeneration}</p>
               </div>
             </div>
           </div>
         )}

         {/* Análise Automática da IA */}
         {!aiResults && (
           <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center">
             <i className="fi fi-rr-brain text-4xl text-gray-400 mb-4"></i>
             <h3 className="text-lg font-semibold text-gray-700 mb-2">Análise Automática da IA</h3>
             <p className="text-gray-600 mb-4">
               A IA analisará automaticamente sua descrição do projeto e determinará:
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div className="bg-white p-4 rounded-2xl border">
                 <i className="fi fi-rr-apps text-blue-500 mb-2"></i>
                 <p className="font-medium">Telas Necessárias</p>
                 <p className="text-gray-600">Componentes identificados automaticamente</p>
               </div>
               <div className="bg-white p-4 rounded-2xl border">
                 <i className="fi fi-rr-magic-wand text-purple-500 mb-2"></i>
                 <p className="font-medium">Funcionalidades</p>
                 <p className="text-gray-600">Features determinadas pela IA</p>
               </div>
               <div className="bg-white p-4 rounded-2xl border">
                 <i className="fi fi-rr-calculator text-green-500 mb-2"></i>
                 <p className="font-medium">Pontos de Função</p>
                 <p className="text-gray-600">Cálculo IFPUG automático</p>
               </div>
               <div className="bg-white p-4 rounded-2xl border">
                 <i className="fi fi-rr-document text-orange-500 mb-2"></i>
                 <p className="font-medium">Proposta Completa</p>
                 <p className="text-gray-600">Documento comercial detalhado</p>
               </div>
             </div>
             <p className="text-sm text-gray-500 mt-4">
               Volte para &ldquo;Configurações&rdquo; e clique em &ldquo;Gerar Proposta com IA&rdquo; para iniciar a análise.
             </p>
           </div>
         )}

         {/* Componentes Identificados Automaticamente pela IA */}
         {aiResults && aiResults.success && aiResults.analysisData && (
           <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-3xl p-8 shadow-lg">
             <div className="flex items-center mb-6">
               <div className="bg-emerald-500 p-3 rounded-2xl mr-4">
                 <i className="fi fi-rr-brain text-white text-xl"></i>
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-emerald-800 text-lg">🧠 Componentes Identificados Automaticamente</h4>
                 <p className="text-sm text-emerald-700 mt-1">A IA analisou sua descrição e determinou os seguintes componentes necessários</p>
               </div>
             </div>

             {/* Telas Identificadas */}
             {aiResults.analysisData.screens && aiResults.analysisData.screens.length > 0 && (
               <div className="mb-6">
                 <h5 className="font-semibold text-emerald-800 mb-3 flex items-center">
                   <i className="fi fi-rr-apps mr-2 text-emerald-600"></i>
                   Telas/Componentes Identificados ({aiResults.analysisData.screens.length})
                 </h5>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {aiResults.analysisData.screens.map((screen, index) => (
                     <div key={index} className="bg-white/70 p-4 rounded-2xl border border-emerald-200/50">
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <h6 className="font-medium text-emerald-800 mb-1">{screen.name}</h6>
                           <p className="text-sm text-emerald-700 mb-2">{screen.description}</p>
                           <div className="flex items-center text-xs text-emerald-600">
                             <i className="fi fi-rr-info mr-1"></i>
                             <span>{screen.category}</span>
                           </div>
                         </div>
                         <div className="ml-3 text-right">
                           <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                             {screen.ifpugType || 'Função'}
                           </div>
                           <div className="text-sm font-bold text-emerald-600 mt-1">
                             {screen.functionPoints || 3} PF
                           </div>
                         </div>
                       </div>
                       {screen.justification && (
                         <div className="mt-3 p-2 bg-emerald-50/50 rounded-xl">
                           <p className="text-xs text-emerald-700">
                             <i className="fi fi-rr-lightbulb mr-1"></i>
                             <strong>IA:</strong> {screen.justification}
                           </p>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Funcionalidades Identificadas */}
             {aiResults.analysisData.features && aiResults.analysisData.features.length > 0 && (
               <div className="mb-6">
                 <h5 className="font-semibold text-emerald-800 mb-3 flex items-center">
                   <i className="fi fi-rr-magic-wand mr-2 text-emerald-600"></i>
                   Funcionalidades Identificadas ({aiResults.analysisData.features.length})
                 </h5>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {aiResults.analysisData.features.map((feature, index) => (
                     <div key={index} className="bg-white/70 p-4 rounded-2xl border border-emerald-200/50">
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <h6 className="font-medium text-emerald-800 mb-1">{feature.name}</h6>
                           <p className="text-sm text-emerald-700 mb-2">{feature.description}</p>
                         </div>
                         <div className="ml-3 text-right">
                           <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                             Feature
                           </div>
                           <div className="text-sm font-bold text-emerald-600 mt-1">
                             {feature.functionPoints || 2} PF
                           </div>
                         </div>
                       </div>
                       {feature.justification && (
                         <div className="mt-3 p-2 bg-emerald-50/50 rounded-xl">
                           <p className="text-xs text-emerald-700">
                             <i className="fi fi-rr-lightbulb mr-1"></i>
                             <strong>IA:</strong> {feature.justification}
                           </p>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Resumo da Análise */}
             <div className="bg-white/60 border border-emerald-200/50 rounded-2xl p-4">
               <h5 className="font-semibold text-emerald-800 mb-2 flex items-center">
                 <i className="fi fi-rr-calculator mr-2 text-emerald-600"></i>
                 Resumo da Análise Automática
               </h5>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                 <div>
                   <div className="text-lg font-bold text-emerald-600">
                     {aiResults.analysisData.screens?.length || 0}
                   </div>
                   <div className="text-xs text-emerald-700">Telas</div>
                 </div>
                 <div>
                   <div className="text-lg font-bold text-emerald-600">
                     {aiResults.analysisData.features?.length || 0}
                   </div>
                   <div className="text-xs text-emerald-700">Funcionalidades</div>
                 </div>
                 <div>
                   <div className="text-lg font-bold text-emerald-600">
                     {aiResults.metadata?.totalFunctionPoints || 0}
                   </div>
                   <div className="text-xs text-emerald-700">Total PF</div>
                 </div>
                 <div>
                   <div className="text-lg font-bold text-emerald-600">
                     {aiResults.metadata?.estimatedHours || 0}h
                   </div>
                   <div className="text-xs text-emerald-700">Estimativa</div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Resultados da IA - Proposta Gerada */}
         {aiResults && aiResults.success && aiResults.type === 'proposal' && (
           <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-3xl p-8 shadow-lg">
             <div className="flex items-center mb-6">
               <div className="bg-blue-500 p-3 rounded-2xl mr-4">
                 <i className="fi fi-rr-document text-white text-xl"></i>
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-blue-800 text-lg">📋 Proposta Comercial Gerada pela IA!</h4>
                 <p className="text-sm text-blue-700 mt-1">Sua proposta detalhada foi criada automaticamente com base nas especificações</p>
               </div>
               <div className="flex space-x-2">
                 <button className="px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 text-sm font-medium">
                   <i className="fi fi-rr-download mr-2"></i>
                   Download PDF
                 </button>
                 <button className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-2xl hover:bg-blue-50 transition-all duration-200 text-sm font-medium">
                   <i className="fi fi-rr-copy mr-2"></i>
                   Copiar
                 </button>
               </div>
             </div>
             
             {aiResults.metadata && (
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                 <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                   <h5 className="font-semibold text-blue-800 mb-1 text-sm flex items-center">
                     <i className="fi fi-rr-money mr-2 text-green-500"></i>
                     Valor Total
                   </h5>
                   <p className="text-lg font-bold text-green-600">
                     R$ {aiResults.metadata.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </p>
                 </div>
                 <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                   <h5 className="font-semibold text-blue-800 mb-1 text-sm flex items-center">
                     <i className="fi fi-rr-clock mr-2 text-orange-500"></i>
                     Horas Estimadas
                   </h5>
                   <p className="text-lg font-bold text-blue-600">{aiResults.metadata.estimatedHours}h</p>
                 </div>
                 <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                   <h5 className="font-semibold text-blue-800 mb-1 text-sm flex items-center">
                     <i className="fi fi-rr-apps mr-2 text-purple-500"></i>
                     Telas/Componentes
                   </h5>
                   <p className="text-lg font-bold text-purple-600">{aiResults.metadata.screenCount}</p>
                 </div>
                 <div className="bg-white/70 p-4 rounded-2xl border border-blue-200/50">
                   <h5 className="font-semibold text-blue-800 mb-1 text-sm flex items-center">
                     <i className="fi fi-rr-magic-wand mr-2 text-pink-500"></i>
                     Funcionalidades
                   </h5>
                   <p className="text-lg font-bold text-pink-600">{aiResults.metadata.featureCount}</p>
                 </div>
               </div>
             )}

             <div className="bg-white/60 border border-blue-200/50 rounded-2xl p-6 max-h-96 overflow-y-auto">
               <div className="flex items-center justify-between mb-4">
                 <h5 className="font-semibold text-blue-800 flex items-center">
                   <i className="fi fi-rr-eye mr-2 text-blue-500"></i>
                   Visualização da Proposta
                 </h5>
                 <button 
                   onClick={() => setActiveTab('preview')}
                   className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                 >
                   Ver em tela cheia →
                 </button>
               </div>
               <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                 <div dangerouslySetInnerHTML={{ 
                   __html: aiResults.proposal?.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                 }} />
               </div>
             </div>
           </div>
         )}

         {/* Configurações para IA */}
         {!aiResults && (
           <>
             {/* Complexidade do Projeto */}
             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <Select
                 label="Complexidade do Projeto"
                 value={formData.projectComplexity}
                 onChange={(value) => handleInputChange('projectComplexity', value)}
                 options={complexityOptions}
                 placeholder="Selecione a complexidade"
               />
               <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                 <p className="text-sm text-blue-700 flex items-start">
                   <i className="fi fi-rr-info mr-2 mt-0.5 text-blue-500"></i>
                   <span>A IA usará esta informação para determinar automaticamente a complexidade dos componentes e calcular os pontos de função apropriados.</span>
                 </p>
               </div>
             </div>

             {/* Slider de Desconto */}
             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <Slider
                 label="Desconto Aplicado"
                 value={formData.discount}
                 onChange={(value) => {
                   handleInputChange('discount', value);
                   if (errors.discount && value >= 0 && value <= 100) {
                     setErrors({...errors, discount: undefined});
                   }
                 }}
                 min={0}
                 max={20}
                 step={1}
                 suffix="%"
                 className={errors.discount ? 'border-red-500' : ''}
               />
               {errors.discount && (
                 <p className="mt-2 text-sm text-red-600">{errors.discount}</p>
               )}
             </div>
           </>
         )}
       </div>
     );
  };

  const renderPreviewTab = () => {
    if (!aiResults || !aiResults.success || aiResults.type !== 'proposal') {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <i className="fi fi-rr-document text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">Proposta não gerada ainda</h3>
            <p className="text-sm">Volte para a aba &ldquo;Configurações&rdquo; e clique em &ldquo;Próximo: Detalhes&rdquo; para gerar a proposta.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header da Proposta */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📋 Proposta Comercial</h2>
              <p className="text-blue-100">Gerada automaticamente pela IA em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              {aiResults.metadata && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-lg font-bold">
                    R$ {aiResults.metadata.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-blue-100">{aiResults.metadata.estimatedHours}h estimadas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações da Proposta */}
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => copyToClipboard(aiResults.proposal)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center"
          >
            <i className="fi fi-rr-copy mr-2"></i>
            Copiar Proposta
          </button>
          <button 
            onClick={() => downloadAsPDF(aiResults.proposal)}
            className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 font-medium flex items-center"
          >
            <i className="fi fi-rr-download mr-2"></i>
            Download PDF
          </button>
          <button 
            onClick={() => sendProposal(aiResults.proposal)}
            className="px-6 py-3 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all duration-200 font-medium flex items-center"
          >
            <i className="fi fi-rr-paper-plane mr-2"></i>
            Enviar por Email
          </button>
        </div>

        {/* Conteúdo da Proposta */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none"
              style={{ 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.6',
                color: '#374151'
              }}
            >
              <div dangerouslySetInnerHTML={{ 
                __html: formatProposalHTML(aiResults.proposal)
              }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Esta proposta foi gerada automaticamente pelo sistema evoSGA</p>
          <p>Validade: 30 dias a partir da data de geração</p>
        </div>
      </div>
    );
  };

  // Função para formatar HTML da proposta
  const formatProposalHTML = (proposal) => {
    if (!proposal) return '';
    
    return proposal
      // Headers
      .replace(/^# (.*$)/gm, '<h1 style="color: #1e40af; font-size: 2rem; font-weight: bold; margin: 2rem 0 1rem 0; border-bottom: 3px solid #3b82f6; padding-bottom: 0.5rem;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #1e40af; font-size: 1.5rem; font-weight: bold; margin: 1.5rem 0 1rem 0;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="color: #374151; font-size: 1.25rem; font-weight: bold; margin: 1rem 0 0.5rem 0;">$1</h3>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937; font-weight: 600;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: #4b5563;">$1</em>')
      
      // Lists
      .replace(/^- (.*$)/gm, '<li style="margin: 0.5rem 0; padding-left: 0.5rem;">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul style="margin: 1rem 0; padding-left: 2rem;">$1</ul>')
      
      // Tables (basic support)
      .replace(/\|/g, '</td><td style="border: 1px solid #d1d5db; padding: 0.75rem;">')
      .replace(/^(.*?)$/gm, (match) => {
        if (match.includes('</td><td')) {
          return '<tr><td style="border: 1px solid #d1d5db; padding: 0.75rem;">' + match + '</td></tr>';
        }
        return match;
      })
      
      // Line breaks
      .replace(/\n/g, '<br/>');
  };

  // Função para copiar para clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Proposta copiada para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Função para download PDF (placeholder)
  const downloadAsPDF = () => {
    // TODO: Implementar geração de PDF
    alert('Funcionalidade de PDF será implementada em breve!');
  };

  // Função para enviar por email (placeholder)
  const sendProposal = () => {
    // TODO: Implementar envio por email
    alert('Funcionalidade de envio por email será implementada em breve!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'config':
        return renderConfigTab();
      case 'details':
        return renderDetailsTab();
      case 'preview':
        return renderPreviewTab();
      default:
        return renderConfigTab();
    }
  };

  const isFormValid = formData.description && formData.description.trim() && formData.paymentMethod;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className="fi fi-rr-star mr-2"></i>
          Gerar Proposta
        </>
      }
      size="lg"
    >
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="min-h-[400px] -mx-8 -mb-6">
        <div className="px-8">
          {renderTabContent()}
        </div>
      </div>

      {/* Footer com botões */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 -mx-8 -mb-6 px-8 py-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-2xl transition-all duration-200 font-medium"
          >
            <i className="fi fi-rr-cross mr-2"></i>
            Cancelar
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {activeTab === 'config' && (
              <button
                onClick={handleNextToDetails}
                disabled={!isFormValid || aiGenerating}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 disabled:from-gray-50 disabled:to-gray-100 disabled:text-gray-400 text-blue-700 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:shadow-none"
              >
                {aiGenerating ? (
                  <>
                    <i className="fi fi-rr-spinner mr-2 animate-spin"></i>
                    IA Gerando Proposta...
                  </>
                ) : (
                  <>
                    <i className="fi fi-rr-magic-wand mr-2"></i>
                    Gerar Proposta com IA
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:transform-none"
            >
              <i className="fi fi-rr-check mr-2"></i>
              Salvar Proposta
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProposalModal;