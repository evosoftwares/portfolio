import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Select, Slider } from './ui';
import aiGenerator from '../services/ai/AIGeneratorService.js';
import { saveProposal, linkProposalToCard, getLatestProposalByCard } from '../lib/proposalService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import IFPUGTab from './ifpug/IFPUGTab';

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
  const [ifpugData, setIfpugData] = useState(null);
  const [savingProposal, setSavingProposal] = useState(false);
  const [savedProposal, setSavedProposal] = useState(null);
  const [loadingExistingProposal, setLoadingExistingProposal] = useState(false);

  // Função para acessar dados IFPUG (para uso posterior)
  const getIfpugData = () => ifpugData;

  // Carregar proposta existente quando o modal é aberto
  useEffect(() => {
    const loadExistingProposal = async () => {
      if (isOpen && cardData?.id && cardData?.hasProposal && !loadingExistingProposal && !aiResults) {
        setLoadingExistingProposal(true);
        try {
          const existingProposal = await getLatestProposalByCard(cardData.id);
          if (existingProposal) {
            setAiResults({
              success: true,
              type: 'proposal',
              proposal: existingProposal.proposal,
              analysisData: existingProposal.analysisData,
              metadata: existingProposal.metadata
            });
            setSavedProposal(existingProposal);
            setActiveTab('preview'); // Ir direto para a aba de preview
          }
        } catch (error) {
          console.error('Erro ao carregar proposta existente:', error);
        } finally {
          setLoadingExistingProposal(false);
        }
      } else if (isOpen && !cardData?.hasProposal) {
        // Se o modal é aberto mas não há proposta, garantir que não esteja em loading
        setLoadingExistingProposal(false);
      }
    };

    loadExistingProposal();
  }, [isOpen, cardData?.id, cardData?.hasProposal]);

  // Limpar estados quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setAiResults(null);
      setSavedProposal(null);
      setLoadingExistingProposal(false);
      setAiGenerating(false);
      setErrors({});
      setActiveTab('config');
      clearIfpugData();
    }
  }, [isOpen]);

  // Função para limpar dados IFPUG
  const clearIfpugData = () => {
    setIfpugData(null);
  };

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
      id: 'preview',
      label: 'Visualização',
      icon: <i className="fi fi-rr-eye"></i>
    },
    {
      id: 'ifpug',
      label: 'IFPUG',
      icon: <i className="fi fi-rr-calculator"></i>
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

  // Função para formatar análise como proposta
  const formatAnalysisAsProposal = (analysisResult) => {
    if (!analysisResult.success) {
      return "# Erro na Análise\n\nNão foi possível gerar a proposta automaticamente. Por favor, tente novamente.";
    }
    
    let proposal = "# 📋 Proposta Técnica\n\n";
    proposal += "## 🎯 Papéis Identificados\n\n";
    
    const roles = analysisResult.roles || analysisResult.stages?.RoleIdentification?.roles || [];
    roles.forEach((role, index) => {
      proposal += `### ${index + 1}. ${role.name}\n`;
      proposal += `- **Permissões**: ${role.permissions?.join(', ') || 'Não especificadas'}\n`;
      proposal += `- **Objetivos**: ${role.primaryGoals?.join(', ') || 'Não especificados'}\n\n`;
    });
    
    proposal += "## 🔄 Fluxos de Usuário\n\n";
    const flows = analysisResult.flows || analysisResult.stages?.RoleIdentification?.flows || [];
    flows.forEach((flow, index) => {
      proposal += `### ${index + 1}. ${flow.name}\n`;
      proposal += `- **Papel**: ${flow.role}\n`;
      proposal += `- **Passos**: ${flow.steps?.length || 0} etapas identificadas\n\n`;
    });
    
    if (analysisResult.stages?.FlowMapping?.screens?.length > 0) {
      proposal += "## 📱 Telas Sugeridas\n\n";
      analysisResult.stages.FlowMapping.screens.forEach((screen, index) => {
        proposal += `### ${index + 1}. ${screen.name}\n`;
        proposal += `- **Tipo**: ${screen.type}\n`;
        proposal += `- **Componentes**: ${screen.components?.join(', ') || 'Não especificados'}\n\n`;
      });
    }
    
    proposal += "## 📊 Estimativa\n\n";
    proposal += "Esta proposta foi gerada automaticamente com base na análise de requisitos usando inteligência artificial.\n\n";
    proposal += "Para uma estimativa mais precisa, entre em contato conosco para uma reunião de detalhamento.\n";
    
    return proposal;
  };

  // Função para calcular pontos de função
  const calculateFunctionPoints = (analysisResult) => {
    // Cálculo simplificado de pontos de função baseado na análise
    const roles = analysisResult.roles || analysisResult.stages?.RoleIdentification?.roles || [];
    const flows = analysisResult.flows || analysisResult.stages?.RoleIdentification?.flows || [];
    const screens = analysisResult.stages?.FlowMapping?.screens || [];
    
    // Estimativa básica: 3 pontos por papel, 2 por fluxo, 5 por tela
    return (roles.length * 3) + (flows.length * 2) + (screens.length * 5);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Verificar se há dados da IA para salvar
    if (!aiResults || !aiResults.success) {
      console.warn('⚠️ Nenhuma proposta gerada pela IA para salvar');
      return;
    }

    setSavingProposal(true);
    
    try {
      console.log('💾 Salvando proposta no Firestore...');
      
      // Preparar dados da proposta para salvar
      const proposalData = {
        cardId: cardData.id,
        title: `Proposta para: ${cardData.title || 'Projeto'}`,
        description: formData.description,
        proposal: aiResults.proposal,
        analysisData: aiResults.analysisData,
        metadata: aiResults.metadata,
        status: 'draft',
        version: 1,
        isSimulation: aiResults.type === 'simulation',
        // Dados adicionais do formulário
        formData: {
          paymentMethod: formData.paymentMethod,
          discount: formData.discount,
          projectComplexity: formData.projectComplexity,
          estimatedHours: formData.estimatedHours
        }
      };

      // Salvar proposta no Firestore
      const savedProposalData = await saveProposal(proposalData);
      
      // Relacionar proposta ao card
      await linkProposalToCard(savedProposalData.id, cardData.id);
      
      console.log('✅ Proposta salva e relacionada ao card com sucesso!');
      console.log('📋 Dados salvos:', {
        proposalId: savedProposalData.id,
        cardId: cardData.id,
        isSimulation: savedProposalData.isSimulation
      });
      
      setSavedProposal(savedProposalData);
      
      // Mostrar feedback de sucesso
      setErrors({});
      
      // Fechar modal após um breve delay para mostrar feedback
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erro ao salvar proposta:', error);
      setErrors({
        ...errors,
        save: 'Erro ao salvar proposta. Tente novamente.'
      });
    } finally {
      setSavingProposal(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!validateForm()) {
      return;
    }

    // Mudar imediatamente para aba Preview
    setActiveTab('preview');
    setAiGenerating(true);
    
    try {
      console.log('🚀 Iniciando geração de proposta com IA...');
      console.log('📋 Dados enviados para IA:', {
        description: formData.description,
        paymentMethod: formData.paymentMethod,
        discount: formData.discount,
        projectComplexity: formData.projectComplexity,
        estimatedHours: formData.estimatedHours
      });
      
      // Validação prévia de configuração
      if (!aiGenerator.isConfigured()) {
        console.error('❌ Serviço de IA não configurado corretamente');
        setErrors({ 
          aiGeneration: 'Serviço de IA não configurado. Verifique as variáveis de ambiente NEXT_PUBLIC_OPENAI_API_KEY e NEXT_PUBLIC_OPENAI_BASE_URL no arquivo .env.local',
          aiGenerationType: 'error'
        });
        return;
      }
      
      console.log('✅ Serviço de IA configurado corretamente');
      
      // Usar a função real de geração de proposta
      // Usar o novo serviço de geração de análise
      const analysisResult = await aiGenerator.generateAnalysisWithRetry({
        description: formData.description,
        complexity: formData.projectComplexity,
        estimatedHours: formData.estimatedHours
      });
      
      // Converter resultado da análise para formato de proposta compatível
      const aiResponse = {
        success: analysisResult.success,
        type: 'proposal',
        proposal: formatAnalysisAsProposal(analysisResult),
        analysisData: {
          screens: analysisResult.stages?.FlowMapping?.screens || [],
          features: [] // Será preenchido com base na análise
        },
        metadata: {
          totalValue: formData.estimatedHours * 120, // Valor hora padrão
          estimatedHours: formData.estimatedHours,
          totalFunctionPoints: calculateFunctionPoints(analysisResult),
          complexity: formData.projectComplexity
        }
      };
      
      // LOGGING DETALHADO DO OUTPUT DA IA
      console.log('✅ IA gerou proposta comercial automaticamente!');
      console.log('📊 ESTRUTURA COMPLETA DA RESPOSTA DA IA:', {
        success: aiResponse.success,
        type: aiResponse.type,
        hasProposal: !!aiResponse.proposal,
        proposalLength: aiResponse.proposal?.length || 0,
        hasAnalysisData: !!aiResponse.analysisData,
        hasMetadata: !!aiResponse.metadata
      });

      // VERIFICAÇÃO DE CONTEÚDO DA RESPOSTA
      if (!aiResponse.proposal || aiResponse.proposal.trim() === '') {
        console.error('❌ RESPOSTA DA IA ESTÁ VAZIA!');
        console.log('🔍 Resposta completa recebida:', aiResponse);
        throw new Error('A IA retornou uma resposta vazia. Verifique a configuração da API.');
      }
      
      if (aiResponse.proposal) {
        console.log('📝 PROPOSTA COMPLETA GERADA PELA IA:');
        console.log('=' .repeat(80));
        console.log(aiResponse.proposal);
        console.log('=' .repeat(80));
      }
      
      if (aiResponse.analysisData) {
        console.log('🔍 DADOS DE ANÁLISE ESTRUTURADOS:');
        console.log('📱 Telas identificadas:', aiResponse.analysisData.screens?.length || 0);
        aiResponse.analysisData.screens?.forEach((screen, index) => {
          console.log(`   ${index + 1}. ${screen.name} - ${screen.description}`);
          console.log(`      Campos: ${screen.fields?.map(f => f.name).join(', ') || 'Nenhum'}`);
        });
        
        console.log('⚙️ Funcionalidades identificadas:', aiResponse.analysisData.features?.length || 0);
        aiResponse.analysisData.features?.forEach((feature, index) => {
          console.log(`   ${index + 1}. ${feature.name} - ${feature.description}`);
        });
      }
      
      if (aiResponse.metadata) {
        console.log('📊 MÉTRICAS CALCULADAS:');
        console.log(`   • Pontos de Função: ${aiResponse.metadata.totalFunctionPoints}`);
        console.log(`   • Horas Estimadas: ${aiResponse.metadata.estimatedHours}`);
        console.log(`   • Valor Total: R$ ${aiResponse.metadata.totalValue?.toLocaleString('pt-BR')}`);
        console.log(`   • Complexidade: ${aiResponse.metadata.complexity}`);
        console.log(`   • Gerado em: ${aiResponse.metadata.generatedAt}`);
      }
      
      // Armazenar resultados da IA
      setAiResults(aiResponse);
      
      // Salvar dados para cálculos IFPUG posteriores
      const ifpugCalculationData = {
        screens: aiResponse.analysisData?.screens || [],
        features: aiResponse.analysisData?.features || [],
        functionPoints: aiResponse.metadata?.totalFunctionPoints || 0,
        estimatedHours: aiResponse.metadata?.estimatedHours || 0,
        complexity: aiResponse.metadata?.complexity || 'medium',
        projectDescription: formData.description,
        generatedAt: new Date().toISOString()
      };
      
      setIfpugData(ifpugCalculationData);
      console.log('💾 Dados IFPUG salvos localmente:', ifpugCalculationData);
      
    } catch (error) {
      console.error('❌ Erro na geração automática:', error);
      console.error('🔍 Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        details: error.details
      });
      
      // Feedback detalhado de erro para o usuário
      let errorMessage = '';
      let errorType = 'error';
      
      if (error.name === 'AIRateLimitError' || error.message.includes('Rate limit') || error.message.includes('429')) {
        errorMessage = '⏳ Limite de requisições atingido. O sistema tentou usar modelos alternativos, mas todos estão temporariamente indisponíveis. ';
        
        if (error.details?.suggestion) {
          errorMessage += error.details.suggestion;
        } else {
          errorMessage += 'Aguarde alguns minutos e tente novamente, ou configure sua própria API key para evitar limitações.';
        }
        
        errorType = 'warning';
        
        // Log adicional para rate limiting
        console.log('📊 Informações de Rate Limiting:', {
          attempts: error.details?.attempts,
          rateLimitInfo: error.details?.rateLimitInfo,
          suggestion: error.details?.suggestion
        });
        
      } else if (error.message.includes('API Key')) {
        errorMessage = '🔑 Problema de autenticação. Verifique se a API Key está configurada corretamente.';
        errorType = 'error';
        
      } else if (error.message.includes('empty') || error.message.includes('vazia')) {
        errorMessage = '📝 A IA retornou uma resposta vazia. Isso pode ser temporário - tente novamente.';
        errorType = 'warning';
        
      } else if (error.message.includes('Todos os modelos falharam')) {
        errorMessage = '🤖 Todos os modelos de IA estão temporariamente indisponíveis. Aguarde alguns minutos e tente novamente.';
        errorType = 'warning';
        
      } else if (error.code === 'ANALYSIS_FAILED_AFTER_RETRIES') {
        errorMessage = `🔄 Falha após ${error.details?.attempts || 'múltiplas'} tentativas. O serviço pode estar sobrecarregado. Tente novamente em alguns minutos.`;
        errorType = 'warning';
        
      } else {
        errorMessage = '❌ Erro inesperado na geração automática. Você pode continuar manualmente ou tentar novamente.';
        errorType = 'error';
      }
      
      setErrors({
        ...errors,
        aiGeneration: errorMessage,
        aiGenerationType: errorType
      });
      
      // Se for rate limiting, mostrar informações adicionais no console
      if (errorType === 'warning') {
        console.log('💡 Dica: Para evitar limitações de rate limiting, considere:');
        console.log('   • Aguardar alguns minutos entre tentativas');
        console.log('   • Configurar sua própria API key do OpenRouter');
        console.log('   • Usar o sistema em horários de menor demanda');
      }
      
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

  // Função para renderizar markdown
  const renderMarkdown = (content) => {
    if (!content) return null;
    
    return (
      <div className="prose prose-sm max-w-none text-gray-600">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Customizar componentes do markdown
            p: ({children}) => <p className="mb-2 text-sm text-gray-600">{children}</p>,
            strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
            em: ({children}) => <em className="italic text-gray-700">{children}</em>,
            ul: ({children}) => <ul className="list-disc list-inside mb-2 text-sm text-gray-600">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-sm text-gray-600">{children}</ol>,
            li: ({children}) => <li className="mb-1">{children}</li>,
            code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
            a: ({children, href}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            h1: ({children}) => <h1 className="text-lg font-bold text-gray-800 mb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-base font-bold text-gray-800 mb-2">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm font-bold text-gray-800 mb-1">{children}</h3>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">{children}</blockquote>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };


  const renderPreviewTab = () => {
    // Estado de carregamento com indicadores visuais melhorados
    if (aiGenerating) {
      return (
        <div className="space-y-6">


          {/* Etapas do Processo */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="fi fi-rr-refresh mr-3 text-blue-500 animate-spin"></i>
                Processamento em Andamento
              </h3>
              <p className="text-sm text-gray-600 mt-2">Estimativa: 30-60 segundos</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Etapa 1 */}
                <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">Analisando Descrição do Projeto</h4>
                    <p className="text-sm text-blue-700 mt-1">Identificando palavras-chave e requisitos funcionais...</p>
                  </div>
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Em andamento
                  </div>
                </div>

                {/* Etapa 2 */}
                <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-2xl opacity-60">
                  <div className="rounded-full h-6 w-6 border-2 border-gray-300 mr-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Identificando Telas e Componentes</h4>
                    <p className="text-sm text-gray-600 mt-1">Determinando quais interfaces são necessárias...</p>
                  </div>
                  <div className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    Aguardando
                  </div>
                </div>

                {/* Etapa 3 */}
                <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-2xl opacity-60">
                  <div className="rounded-full h-6 w-6 border-2 border-gray-300 mr-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Calculando Pontos de Função IFPUG</h4>
                    <p className="text-sm text-gray-600 mt-1">Aplicando metodologia IFPUG para estimativa...</p>
                  </div>
                  <div className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    Aguardando
                  </div>
                </div>

                {/* Etapa 4 */}
                <div className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-2xl opacity-60">
                  <div className="rounded-full h-6 w-6 border-2 border-gray-300 mr-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Gerando Proposta Comercial</h4>
                    <p className="text-sm text-gray-600 mt-1">Formatando documento final com preços e cronograma...</p>
                  </div>
                  <div className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    Aguardando
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton da Proposta */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded-lg mt-8 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-32 bg-gray-200 rounded-2xl"></div>
                  <div className="h-32 bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mt-6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Dica */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-xl mr-4">
                <i className="fi fi-rr-lightbulb text-white text-lg"></i>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2"><i className="fi fi-rr-bulb text-yellow-500 mr-2"></i>Dica Profissional</h4>
                <p className="text-blue-800 text-sm">
                  Nossa IA está analisando sua descrição usando metodologia IFPUG para garantir estimativas precisas. 
                  Em breve você terá acesso à proposta comercial completa com todos os detalhes técnicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Verificar se há erro na geração
    if (errors.aiGeneration) {
      return (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8">
            <div className="flex items-start">
              <div className="bg-red-500 p-3 rounded-2xl mr-4">
                <i className="fi fi-rr-exclamation text-white text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Erro na Geração</h3>
                <p className="text-red-800 mb-4">{errors.aiGeneration}</p>
                <button
                  onClick={() => {
                    setErrors({...errors, aiGeneration: undefined});
                    setActiveTab('config');
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!aiResults || !aiResults.success || aiResults.type !== 'proposal') {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <i className="fi fi-rr-document text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">Proposta não gerada ainda</h3>
            <p className="text-sm">Volte para a aba &ldquo;Configurações&rdquo; e clique em &ldquo;Gerar Proposta com IA&rdquo; para iniciar.</p>
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
              <h2 className="text-2xl font-bold mb-2"><i className="fi fi-rr-document text-white mr-2"></i>Proposta Comercial</h2>
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
              {renderMarkdown(aiResults.proposal)}
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

  // Função para copiar para clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Proposta copiada para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Função para download PDF
  const downloadAsPDF = () => {
    try {
      // Criar conteúdo HTML da proposta
      const proposalContent = aiResults?.proposal || '';
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Proposta de Projeto</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1, h2 { color: #333; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .content { white-space: pre-wrap; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Proposta de Projeto</h1>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="content">${proposalContent.replace(/\n/g, '<br>')}</div>
          <div class="footer">
            <p><small>Documento gerado automaticamente pelo Sistema de Análise de Projetos</small></p>
          </div>
        </body>
        </html>
      `;

      // Criar blob e fazer download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposta-projeto-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Proposta baixada como arquivo HTML! Você pode abri-lo no navegador e imprimir como PDF.');
    } catch (error) {
      console.error('Erro ao gerar arquivo:', error);
      alert('Erro ao gerar arquivo para download. Tente novamente.');
    }
  };

  // Função para enviar por email
  const sendProposal = () => {
    try {
      const proposalContent = aiResults?.proposal || '';
      const projectTitle = formData?.description?.substring(0, 50) || 'Projeto';
      
      // Criar conteúdo do email
      const subject = encodeURIComponent(`Proposta: ${projectTitle}`);
      const emailBody = encodeURIComponent(`
Olá,

Segue a proposta para o projeto solicitado:

${proposalContent}

---
Documento gerado automaticamente pelo Sistema de Análise de Projetos
Data: ${new Date().toLocaleDateString('pt-BR')}

Atenciosamente,
Equipe de Desenvolvimento
      `);

      // Abrir cliente de email padrão
      const mailtoLink = `mailto:?subject=${subject}&body=${emailBody}`;
      window.location.href = mailtoLink;
      
    } catch (error) {
      console.error('Erro ao abrir cliente de email:', error);
      alert('Erro ao abrir cliente de email. Tente copiar a proposta e enviar manualmente.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'config':
        return renderConfigTab();
      case 'preview':
        return renderPreviewTab();
      case 'ifpug':
        return (
          <IFPUGTab 
            ifpugData={ifpugData}
            onDataChange={setIfpugData}
            aiResults={aiResults}
          />
        );
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
          {loadingExistingProposal ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 font-medium">Carregando proposta existente...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>

      {/* Footer com botões */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 -mx-8 -mb-6 px-8 py-6 mt-8">
        {/* Mensagem de erro de salvamento */}
        {errors.save && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 flex items-center">
              <i className="fi fi-rr-exclamation mr-2"></i>
              {errors.save}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-2xl transition-all duration-200 font-medium"
          >
            <i className="fi fi-rr-cross mr-2"></i>
            Cancelar
          </button>
          
          <div className="flex gap-3">
            {activeTab === 'config' && (
              <button
                onClick={handleGenerateProposal}
                disabled={!isFormValid || aiGenerating}
                className={`w-full sm:w-auto px-8 py-3 rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:transform-none ${
                  aiGenerating 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white'
                }`}
              >
                {aiGenerating ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="flex items-center">
                        🤖 IA Processando
                        <span className="ml-2 flex space-x-0.5">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </span>
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <i className="fi fi-rr-magic-wand mr-3 text-lg"></i>
                      <span className="relative">
                        Gerar Proposta com IA
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                      </span>
                    </div>
                  </>
                )}
              </button>
            )}

            {(activeTab === 'preview' || activeTab === 'ifpug') && aiResults && aiResults.success && (
              <button
                onClick={handleSave}
                disabled={savingProposal}
                className={`w-full sm:w-auto px-8 py-3 rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:transform-none ${
                  savingProposal 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                }`}
              >
                {savingProposal ? (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>Salvando...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <i className="fi fi-rr-disk mr-3 text-lg"></i>
                      <span>Salvar Proposta</span>
                    </div>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};


export default ProposalModal;