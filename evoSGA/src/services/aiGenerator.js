/**
 * Serviço de Integração com IA para Geração Automática de Componentes
 * Conecta o modal "Gerar Proposta" com sistemas de IA para geração de código
 */

class AIGeneratorService {
  constructor() {
    this.apiKey = process.env.REACT_APP_AI_API_KEY || '';
    this.baseUrl = process.env.REACT_APP_AI_BASE_URL || 'https://api.openai.com/v1';
    this.model = process.env.REACT_APP_AI_MODEL || 'gpt-4';
  }

  /**
   * Gera o prompt para proposta comercial detalhada
   */
  generateProposalPrompt(projectData, screenDatabase, featuresDatabase) {
    return `
# 🎯 **Geração de Proposta Comercial Profissional**

## 🧠 **Contexto**

Você é um **Analista de Sistemas Especializado** em elaboração de propostas comerciais para projetos de software. Sua missão é:

1. **ANALISAR** a descrição do projeto fornecida
2. **DETERMINAR AUTOMATICAMENTE** quais telas e componentes são necessários
3. **CLASSIFICAR** cada componente segundo metodologia IFPUG
4. **CALCULAR** pontos de função para cada item
5. **GERAR** proposta comercial completa e detalhada

## 📋 **Dados do Projeto para Análise**

\`\`\`json
${JSON.stringify({
  projectData,
  availableScreens: screenDatabase,
  availableFeatures: featuresDatabase
}, null, 2)}
\`\`\`

## 🔍 **TAREFA PRINCIPAL: ANÁLISE AUTOMÁTICA**

Baseado na descrição: **"${projectData.description}"**

Você deve:
1. **Identificar automaticamente** todas as telas necessárias
2. **Determinar** funcionalidades adicionais requeridas  
3. **Justificar** cada escolha baseada na descrição
4. **Classificar** cada item segundo IFPUG
5. **Calcular** pontos de função total

## 📝 **Estrutura da Proposta Solicitada**

Gere uma proposta comercial completa seguindo esta estrutura:

### **IMPORTANTE: ESPECIFICAÇÃO IFPUG OBRIGATÓRIA**

Para cada tela/componente selecionado, você DEVE gerar uma especificação técnica detalhada incluindo:

#### **Análise de Pontos de Função (IFPUG)**
- **Entradas Externas (EI)**: Processos que recebem dados do usuário
- **Saídas Externas (EO)**: Processos que enviam dados processados
- **Consultas Externas (EQ)**: Processos de consulta sem processamento
- **Arquivos Lógicos Internos (ALI)**: Grupos de dados mantidos pela aplicação
- **Arquivos de Interface Externa (AIE)**: Grupos de dados de outras aplicações

#### **Para cada componente, especifique:**
1. **Nome e descrição funcional completa**
2. **Tipo de função (EI/EO/EQ/ALI/AIE)**
3. **Complexidade (Simples/Média/Complexa)**
4. **Pontos de função estimados**
5. **Campos de entrada (se aplicável)**
6. **Regras de negócio**
7. **Validações necessárias**
8. **Integrações com outros componentes**

### 1. **RESUMO EXECUTIVO**
- Visão geral do projeto
- Objetivos principais
- Valor esperado para o cliente

### 2. **ANÁLISE AUTOMÁTICA DE REQUISITOS**
OBRIGATÓRIO: Baseado na descrição do projeto, identifique e justifique:
- Telas e componentes necessários (com justificativa)
- Funcionalidades adicionais requeridas (com justificativa)
- Integrações identificadas na descrição
- Fluxos de processo inferidos

### 3. **ESPECIFICAÇÃO TÉCNICA DETALHADA (IFPUG)**
OBRIGATÓRIO: Para cada tela/componente IDENTIFICADO AUTOMATICAMENTE, gere especificação completa incluindo:
- Descrição funcional detalhada
- Justificativa para inclusão (baseada na descrição)
- Classificação IFPUG (EI/EO/EQ/ALI/AIE)
- Complexidade e pontos de função
- Campos de entrada/saída
- Regras de negócio e validações
- Fluxos de processo
- Integrações necessárias

### 4. **ESCOPO DO PROJETO**
- Descrição detalhada das funcionalidades
- Lista completa de telas/componentes identificados
- Resumo dos pontos de função totais

### 5. **ANÁLISE DE PONTOS DE FUNÇÃO (RESUMO)**
- Total de pontos de função por categoria
- Fator de ajuste técnico
- Pontos de função ajustados
- Estimativa de esforço baseada em PF

### 6. **METODOLOGIA E PROCESSO**
- Metodologia de desenvolvimento (Ágil/Scrum)
- Fases do projeto
- Cronograma detalhado

### 7. **TECNOLOGIAS E ARQUITETURA**
- Stack tecnológico recomendado
- Arquitetura da solução
- Justificativas técnicas

### 8. **ENTREGAS E MARCOS**
- Principais entregas por fase
- Marcos de aprovação
- Critérios de aceite

### 9. **EQUIPE E RECURSOS**
- Perfis profissionais necessários
- Dedicação por papel
- Estrutura organizacional

### 10. **INVESTIMENTO E CONDIÇÕES**
- Estimativa baseada em análise automática
- Estimativa baseada em pontos de função
- Estrutura de pagamento: ${projectData.paymentMethod}
- Desconto aplicado: ${projectData.discount}%
- Condições comerciais

### 11. **RISCOS E MITIGAÇÕES**
- Principais riscos identificados
- Estratégias de mitigação
- Planos de contingência

### 12. **GARANTIAS E SUPORTE**
- Período de garantia
- Suporte pós-entrega
- Manutenções evolutivas

### 13. **PRÓXIMOS PASSOS**
- Processo de aprovação
- Início do projeto
- Cronograma de kick-off

## 🎨 **Diretrizes de Formatação**

- Use **markdown** para formatação
- Inclua **emojis** para melhor visual
- Crie **tabelas** para cronogramas e custos
- Use **listas** bem estruturadas
- Mantenha tom **profissional** mas **acessível**

## 📊 **Instruções Específicas de Análise**

1. **ANÁLISE AUTOMÁTICA OBRIGATÓRIA**: Não use telas pré-selecionadas. Analise a descrição e determine quais são necessárias.

2. **JUSTIFICATIVA**: Para cada tela/componente identificado, explique POR QUE é necessário baseado na descrição.

3. **CÁLCULOS IFPUG**: Para cada componente, calcule pontos de função considerando:
   - Complexidade do projeto: "${projectData.projectComplexity}"
   - Tipo de função (EI/EO/EQ/ALI/AIE)
   - Fatores de complexidade

4. **ESTIMATIVAS**: 
   - Use pontos de função para calcular esforço
   - Compare com estimativa base fornecida
   - Aplique desconto de ${projectData.discount}%
   - Estruture pagamento: "${projectData.paymentMethod}"

**CRÍTICO**: 
- **NÃO** use telas pré-selecionadas
- **SEMPRE** analise a descrição primeiro
- **JUSTIFIQUE** cada escolha de componente
- **CALCULE** pontos de função para cada item
- A proposta deve ser **comercialmente viável** e **tecnicamente sólida**
`;
  }

  /**
   * Gera o prompt estratégico para IA baseado nos dados da proposta (versão anterior mantida)
   */
  generateComponentsPrompt(projectData, screenDatabase, featuresDatabase) {
    return `
# 🎯 **Prompt Estratégico para IA - Geração Automática de Componentes e Telas**

## 🧠 **Contexto do Sistema**

Você é um **Arquiteto de Software Especializado** em geração automática de componentes React/Next.js. Sua missão é analisar os dados estruturados de uma proposta de projeto e gerar automaticamente todos os componentes, telas e funcionalidades necessárias, seguindo os padrões de design e arquitetura estabelecidos no sistema evoSGA.

## 📋 **Dados de Entrada da Proposta**

\`\`\`json
${JSON.stringify({
  projectData,
  screenDatabase,
  featuresDatabase
}, null, 2)}
\`\`\`

## 🏗️ **Arquitetura de Saída Esperada**

Para cada tela selecionada, você deve gerar:

### **1. Componente React Principal**
\`\`\`javascript
// Estrutura base para cada componente
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../ui';

const [NomeDoComponente] = () => {
  // Estado e lógica baseados na complexidade: ${projectData.projectComplexity}
  // Implementação completa da funcionalidade
  // Integração com Firebase (se necessário)
  
  return (
    // JSX completo com design system estabelecido
  );
};

export default [NomeDoComponente];
\`\`\`

### **2. Padrões de Design Obrigatórios**
- **Border Radius**: \`rounded-2xl\` (16px) e \`rounded-3xl\` (24px)
- **Cores Primárias**: 
  - Azul: \`blue-500\` (#3b82f6)
  - Verde: \`green-500\` para sucessos
  - Vermelho: \`red-500\` para erros
  - Cinza: \`gray-50\` a \`gray-900\` para neutros
- **Espaçamento**: Sistema Tailwind (p-4, p-6, p-8, etc.)
- **Ícones**: Flaticon (\`fi fi-rr-[nome]\`)
- **Sombras**: \`shadow-sm\`, \`shadow-md\`, \`shadow-lg\`
- **Transições**: \`transition-all duration-200\`

### **3. Regras de Complexidade**

**Complexidade: ${projectData.projectComplexity.toUpperCase()}**

${this.getComplexityRules(projectData.projectComplexity)}

### **4. Funcionalidades Adicionais Selecionadas**

${projectData.additionalFeatures.map(featureId => {
  const feature = featuresDatabase.find(f => f.id === featureId);
  return feature ? `- **${feature.name}**: ${feature.description}` : '';
}).filter(Boolean).join('\n')}

### **5. Estimativas do Projeto**
- **Telas Selecionadas**: ${projectData.selectedScreens.length}
- **Funcionalidades Adicionais**: ${projectData.additionalFeatures.length}
- **Horas Estimadas**: ${projectData.estimatedHours}h
- **Desconto Aplicado**: ${projectData.discount}%

## 🚀 **Instruções de Execução**

1. **Análise dos Dados**: Processe o JSON de entrada e identifique padrões
2. **Geração de Componentes**: Crie cada componente seguindo os padrões estabelecidos
3. **Integração Automática**: Configure rotas e navegação
4. **Testes Básicos**: Gere testes unitários simples
5. **Documentação**: Crie README para cada componente gerado

## 📝 **Formato de Resposta Esperado**

Retorne um JSON estruturado com todos os arquivos gerados, suas dependências e instruções de integração.

**IMPORTANTE**: Gere código funcional e pronto para produção, seguindo exatamente os padrões visuais e de arquitetura do evoSGA.
`;
  }

  /**
   * Retorna as regras específicas para cada nível de complexidade
   */
  getComplexityRules(complexity) {
    const rules = {
      simple: `
- Layout básico com componentes UI existentes
- Formulários simples com validação básica
- Listagens com paginação simples
- Sem animações complexas
- Componentes funcionais diretos`,
      
      medium: `
- Componentes interativos com estado
- Validações avançadas
- Filtros e busca
- Modais e dropdowns
- Animações sutis
- Integração com APIs básicas`,
      
      complex: `
- Componentes com lógica avançada
- Integrações com APIs complexas
- Animações e transições elaboradas
- Drag & drop
- Gráficos e visualizações
- Real-time updates
- Micro-interações avançadas`
    };

    return rules[complexity] || rules.medium;
  }

  /**
   * Extrai detalhes das telas selecionadas
   */
  getSelectedScreenDetails(selectedScreenIds, screenDatabase) {
    const allScreens = screenDatabase.categories.flatMap(category => 
      category.screens.map(screen => ({ ...screen, category: category.category }))
    );
    
    return selectedScreenIds.map(id => 
      allScreens.find(screen => screen.id === id)
    ).filter(Boolean);
  }

  /**
   * Extrai detalhes das funcionalidades selecionadas
   */
  getSelectedFeatureDetails(selectedFeatureIds, featuresDatabase) {
    return selectedFeatureIds.map(id => 
      featuresDatabase.find(feature => feature.id === id)
    ).filter(Boolean);
  }

  /**
   * Gera proposta comercial completa
   */
  async generateProposal(projectData, screenDatabase, featuresDatabase) {
    try {
      const prompt = this.generateProposalPrompt(projectData, screenDatabase, featuresDatabase);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Você é um consultor de tecnologia especializado em elaboração de propostas comerciais profissionais para projetos de software. Sempre responda em português brasileiro com linguagem técnica mas acessível.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        proposal: data.choices[0].message.content,
        success: true,
        type: 'proposal'
      };
      
    } catch (error) {
      console.error('Erro ao gerar proposta com IA:', error);
      throw new Error(`Falha na geração da proposta: ${error.message}`);
    }
  }

  /**
   * Envia dados para IA e recebe componentes gerados
   */
  async generateComponents(projectData, screenDatabase, featuresDatabase) {
    try {
      const prompt = this.generatePrompt(projectData, screenDatabase, featuresDatabase);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Você é um arquiteto de software especializado em React/Next.js e geração automática de componentes. Responda sempre em JSON estruturado.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      return this.parseAIResponse(data.choices[0].message.content);
      
    } catch (error) {
      console.error('Erro ao gerar componentes com IA:', error);
      throw new Error(`Falha na geração automática: ${error.message}`);
    }
  }

  /**
   * Processa e valida a resposta da IA
   */
  parseAIResponse(aiResponse) {
    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonString);
      }

      // Se não encontrou JSON, retorna estrutura padrão
      return {
        generatedFiles: [],
        projectStructure: {
          totalFiles: 0,
          totalLines: 0,
          estimatedDevelopmentTime: "0 horas"
        },
        integrationInstructions: [],
        error: "Resposta da IA não contém JSON válido"
      };

    } catch (error) {
      console.error('Erro ao processar resposta da IA:', error);
      return {
        generatedFiles: [],
        projectStructure: {
          totalFiles: 0,
          totalLines: 0,
          estimatedDevelopmentTime: "0 horas"
        },
        integrationInstructions: [],
        error: `Erro ao processar resposta: ${error.message}`
      };
    }
  }

  /**
   * Analisa automaticamente a descrição do projeto e determina componentes necessários
   */
  analyzeProjectDescription(description, screenDatabase, featuresDatabase, complexity) {
    // Análise por palavras-chave na descrição
    const lowerDescription = description.toLowerCase();
    
    // Mapear palavras-chave para componentes
    const keywordMapping = {
      // Autenticação
      'login': ['login'],
      'cadastro': ['register'],
      'registro': ['register'],
      'senha': ['login', 'forgot-password'],
      'perfil': ['profile'],
      'usuário': ['profile', 'user-settings'],
      
      // Dashboard
      'dashboard': ['dashboard'],
      'painel': ['dashboard'],
      'resumo': ['dashboard'],
      'métricas': ['dashboard', 'analytics-dashboard'],
      
      // Gestão
      'gerenciar': ['user-management', 'data-table'],
      'administrar': ['admin-panel', 'user-management'],
      'crud': ['data-table', 'form-create', 'form-edit'],
      'tabela': ['data-table'],
      'listagem': ['data-table'],
      'formulário': ['form-create', 'form-edit'],
      
      // E-commerce
      'produto': ['product-catalog', 'product-detail'],
      'loja': ['product-catalog', 'shopping-cart'],
      'carrinho': ['shopping-cart'],
      'pagamento': ['checkout'],
      'compra': ['checkout', 'order-history'],
      
      // Comunicação
      'chat': ['chat'],
      'mensagem': ['chat', 'notifications'],
      'notificação': ['notifications'],
      'email': ['email-templates'],
      
      // Relatórios
      'relatório': ['reports', 'analytics-dashboard'],
      'gráfico': ['charts'],
      'export': ['export-data']
    };

    // Determinar telas necessárias baseado na análise
    const identifiedScreenIds = new Set();
    
    Object.entries(keywordMapping).forEach(([keyword, screenIds]) => {
      if (lowerDescription.includes(keyword)) {
        screenIds.forEach(screenId => identifiedScreenIds.add(screenId));
      }
    });

    // Se nenhuma tela específica foi identificada, usar conjunto padrão baseado no tipo de projeto
    if (identifiedScreenIds.size === 0) {
      // Projeto padrão inclui funcionalidades básicas
      ['login', 'register', 'dashboard', 'profile'].forEach(id => identifiedScreenIds.add(id));
    }

    // Adicionar telas complementares baseadas no que foi identificado
    if (identifiedScreenIds.has('login')) {
      identifiedScreenIds.add('forgot-password');
    }
    if (identifiedScreenIds.has('product-catalog')) {
      identifiedScreenIds.add('product-detail');
    }
    if (identifiedScreenIds.has('dashboard')) {
      identifiedScreenIds.add('sidebar');
      identifiedScreenIds.add('header');
    }

    // Converter IDs para objetos completos
    const allScreens = screenDatabase.categories.flatMap(category => 
      category.screens.map(screen => ({ ...screen, category: category.category }))
    );
    
    const screens = Array.from(identifiedScreenIds)
      .map(id => allScreens.find(screen => screen.id === id))
      .filter(Boolean);

    // Determinar funcionalidades adicionais
    const identifiedFeatures = [];
    
    // Análise de funcionalidades baseada na descrição
    if (lowerDescription.includes('mobile') || lowerDescription.includes('responsiv')) {
      identifiedFeatures.push(featuresDatabase.find(f => f.id === 'responsive'));
    }
    if (lowerDescription.includes('escuro') || lowerDescription.includes('dark')) {
      identifiedFeatures.push(featuresDatabase.find(f => f.id === 'dark-mode'));
    }
    if (lowerDescription.includes('animaç') || lowerDescription.includes('transição')) {
      identifiedFeatures.push(featuresDatabase.find(f => f.id === 'animations'));
    }
    if (lowerDescription.includes('offline') || lowerDescription.includes('sem internet')) {
      identifiedFeatures.push(featuresDatabase.find(f => f.id === 'offline'));
    }
    if (lowerDescription.includes('idioma') || lowerDescription.includes('multilíng')) {
      identifiedFeatures.push(featuresDatabase.find(f => f.id === 'multi-language'));
    }

    // Funcionalidades padrão baseadas na complexidade
    const defaultFeatures = ['responsive'];
    if (complexity === 'medium' || complexity === 'complex') {
      defaultFeatures.push('dark-mode');
    }
    if (complexity === 'complex') {
      defaultFeatures.push('animations');
    }

    defaultFeatures.forEach(featureId => {
      const feature = featuresDatabase.find(f => f.id === featureId);
      if (feature && !identifiedFeatures.find(f => f?.id === featureId)) {
        identifiedFeatures.push(feature);
      }
    });

    return {
      screens: screens,
      features: identifiedFeatures.filter(Boolean),
      analysis: {
        keywordsFound: Object.keys(keywordMapping).filter(keyword => lowerDescription.includes(keyword)),
        screensIdentified: Array.from(identifiedScreenIds),
        featuresIdentified: identifiedFeatures.map(f => f?.id).filter(Boolean),
        description: description
      }
    };
  }

  /**
   * Analisa automaticamente a descrição do projeto sem dependências externas
   */
  analyzeProjectDescriptionAutomatic(description, complexity = 'medium') {
    const lowerDescription = description.toLowerCase();
    
    // Base de dados interna simplificada de componentes
    const internalScreenDatabase = [
      // Autenticação
      { id: 'login', name: 'Tela de Login', category: 'Autenticação', description: 'Formulário de autenticação com email/senha', keywords: ['login', 'entrar', 'acesso', 'senha'] },
      { id: 'register', name: 'Tela de Cadastro', category: 'Autenticação', description: 'Formulário de registro de novos usuários', keywords: ['cadastro', 'registro', 'criar conta'] },
      { id: 'profile', name: 'Perfil do Usuário', category: 'Usuário', description: 'Visualização e edição de dados pessoais', keywords: ['perfil', 'usuário', 'dados pessoais'] },
      
      // Dashboard
      { id: 'dashboard', name: 'Dashboard Principal', category: 'Dashboard', description: 'Painel principal com métricas e resumos', keywords: ['dashboard', 'painel', 'resumo', 'métricas'] },
      { id: 'sidebar', name: 'Menu Lateral', category: 'Navegação', description: 'Navegação principal do sistema', keywords: ['menu', 'navegação', 'sidebar'] },
      
      // Gestão de Dados
      { id: 'data-table', name: 'Tabela de Dados', category: 'Gestão', description: 'Listagem com filtros, ordenação e paginação', keywords: ['tabela', 'listagem', 'dados', 'gerenciar'] },
      { id: 'form-create', name: 'Formulário de Criação', category: 'Gestão', description: 'Formulário para adicionar novos registros', keywords: ['formulário', 'criar', 'adicionar', 'novo'] },
      { id: 'form-edit', name: 'Formulário de Edição', category: 'Gestão', description: 'Formulário para editar registros existentes', keywords: ['editar', 'modificar', 'atualizar'] },
      
      // E-commerce
      { id: 'product-catalog', name: 'Catálogo de Produtos', category: 'E-commerce', description: 'Listagem de produtos com filtros', keywords: ['produto', 'catálogo', 'loja', 'venda'] },
      { id: 'shopping-cart', name: 'Carrinho de Compras', category: 'E-commerce', description: 'Gestão de itens selecionados', keywords: ['carrinho', 'compra', 'item'] },
      { id: 'checkout', name: 'Finalização de Compra', category: 'E-commerce', description: 'Processo de pagamento e entrega', keywords: ['pagamento', 'finalizar', 'checkout'] },
      
      // Comunicação
      { id: 'notifications', name: 'Central de Notificações', category: 'Comunicação', description: 'Lista de alertas e avisos', keywords: ['notificação', 'alerta', 'aviso'] },
      { id: 'chat', name: 'Chat/Mensagens', category: 'Comunicação', description: 'Sistema de comunicação interna', keywords: ['chat', 'mensagem', 'conversa'] },
      
      // Relatórios
      { id: 'reports', name: 'Relatórios', category: 'Relatórios', description: 'Geração de relatórios personalizados', keywords: ['relatório', 'report', 'análise'] },
      { id: 'charts', name: 'Gráficos', category: 'Relatórios', description: 'Visualizações de dados dinâmicas', keywords: ['gráfico', 'chart', 'visualização'] },
      
      // Administração
      { id: 'admin-panel', name: 'Painel Administrativo', category: 'Administração', description: 'Interface de gestão do sistema', keywords: ['admin', 'administrativo', 'gestão'] },
      { id: 'user-management', name: 'Gestão de Usuários', category: 'Administração', description: 'CRUD de usuários e permissões', keywords: ['usuário', 'permissão', 'acesso'] }
    ];

    const internalFeaturesDatabase = [
      { id: 'responsive', name: 'Design Responsivo', description: 'Adaptação para mobile, tablet e desktop', keywords: ['responsivo', 'mobile', 'tablet'] },
      { id: 'dark-mode', name: 'Modo Escuro', description: 'Alternância entre temas claro e escuro', keywords: ['escuro', 'dark', 'tema'] },
      { id: 'animations', name: 'Animações e Transições', description: 'Efeitos visuais e micro-interações', keywords: ['animação', 'transição', 'efeito'] },
      { id: 'multi-language', name: 'Multi-idioma', description: 'Suporte a múltiplos idiomas', keywords: ['idioma', 'multilíng', 'internacional'] },
      { id: 'offline', name: 'Modo Offline', description: 'Funcionamento sem conexão com internet', keywords: ['offline', 'sem internet'] },
      { id: 'accessibility', name: 'Acessibilidade', description: 'Conformidade com padrões WCAG', keywords: ['acessibilidade', 'wcag', 'inclusão'] }
    ];

    // Identificar componentes baseado nas keywords
    const identifiedScreens = internalScreenDatabase.filter(screen => 
      screen.keywords.some(keyword => lowerDescription.includes(keyword))
    );

    const identifiedFeatures = internalFeaturesDatabase.filter(feature => 
      feature.keywords.some(keyword => lowerDescription.includes(keyword))
    );

    // Se nenhum componente foi identificado, usar conjunto padrão
    if (identifiedScreens.length === 0) {
      identifiedScreens.push(
        ...internalScreenDatabase.filter(s => ['login', 'dashboard', 'profile'].includes(s.id))
      );
    }

    // Adicionar funcionalidades padrão baseadas na complexidade
    if (!identifiedFeatures.find(f => f.id === 'responsive')) {
      identifiedFeatures.push(internalFeaturesDatabase.find(f => f.id === 'responsive'));
    }
    
    if (complexity === 'medium' || complexity === 'complex') {
      if (!identifiedFeatures.find(f => f.id === 'dark-mode')) {
        identifiedFeatures.push(internalFeaturesDatabase.find(f => f.id === 'dark-mode'));
      }
    }

    // Adicionar informações de IFPUG e justificativas
    const screensWithDetails = identifiedScreens.map(screen => ({
      ...screen,
      ifpugType: this.getIFPUGType(screen.id),
      functionPoints: this.getFunctionPoints(screen.id, complexity),
      justification: this.getJustification(screen.id, description)
    }));

    const featuresWithDetails = identifiedFeatures.filter(Boolean).map(feature => ({
      ...feature,
      functionPoints: 2,
      justification: this.getFeatureJustification(feature.id, complexity)
    }));

    return {
      screens: screensWithDetails,
      features: featuresWithDetails,
      analysis: {
        keywordsFound: [...identifiedScreens.flatMap(s => s.keywords), ...identifiedFeatures.flatMap(f => f.keywords)]
          .filter(keyword => lowerDescription.includes(keyword)),
        description: description
      }
    };
  }

  /**
   * Determina tipo IFPUG para uma tela
   */
  getIFPUGType(screenId) {
    const types = {
      'login': 'Entrada Externa (EI)',
      'register': 'Entrada Externa (EI)',
      'form-create': 'Entrada Externa (EI)',
      'form-edit': 'Entrada Externa (EI)',
      'dashboard': 'Consulta Externa (EQ)',
      'data-table': 'Consulta Externa (EQ)',
      'reports': 'Saída Externa (EO)',
      'charts': 'Saída Externa (EO)'
    };
    return types[screenId] || 'Consulta Externa (EQ)';
  }

  /**
   * Calcula pontos de função para uma tela
   */
  getFunctionPoints(screenId, complexity) {
    const basePoints = {
      'login': 3,
      'register': 4,
      'dashboard': 5,
      'data-table': 4,
      'form-create': 4,
      'form-edit': 4,
      'product-catalog': 5,
      'checkout': 6,
      'reports': 5,
      'admin-panel': 6
    };
    
    const complexityMultiplier = {
      'simple': 0.8,
      'medium': 1.0,
      'complex': 1.3
    };
    
    const base = basePoints[screenId] || 3;
    return Math.ceil(base * (complexityMultiplier[complexity] || 1.0));
  }

  /**
   * Simula geração de proposta comercial para desenvolvimento/teste
   */
  async mockProposalGeneration(projectData) {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 3000));

    // IA ANALISA AUTOMATICAMENTE a descrição e determina componentes necessários
    const analyzedComponents = this.analyzeProjectDescriptionAutomatic(projectData.description, projectData.projectComplexity);
    const selectedScreens = analyzedComponents.screens;
    const selectedFeatures = analyzedComponents.features;
    
    const valorHora = 120; // R$ por hora
    const valorTotal = projectData.estimatedHours * valorHora;
    const valorComDesconto = valorTotal * (1 - projectData.discount / 100);

    const mockProposal = `# 📋 PROPOSTA COMERCIAL - PROJETO DE SOFTWARE

## 1. 📊 RESUMO EXECUTIVO

**Projeto:** ${projectData.description || 'Sistema Web Personalizado'}
**Complexidade:** ${projectData.projectComplexity === 'simple' ? 'Simples' : projectData.projectComplexity === 'medium' ? 'Média' : 'Complexa'}
**Estimativa:** ${projectData.estimatedHours} horas de desenvolvimento
**Investimento:** R$ ${valorComDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

### 🎯 Objetivos Principais
- Desenvolver solução web moderna e responsiva
- Implementar ${selectedScreens.length} telas/componentes principais
- Integrar ${selectedFeatures.length} funcionalidades avançadas
- Garantir experiência de usuário excepcional

## 2. 🔍 ANÁLISE AUTOMÁTICA DE REQUISITOS

Baseado na descrição: **"${projectData.description}"**

### Componentes Identificados Automaticamente pela IA:

**Palavras-chave encontradas:** ${analyzedComponents.analysis.keywordsFound.join(', ') || 'Análise de contexto aplicada'}

**Justificativa da Seleção:**
${selectedScreens.map(screen => `- **${screen.name}**: Necessário para ${this.getJustification(screen.id, projectData.description)}`).join('\n')}

**Funcionalidades Determinadas:**
${selectedFeatures.map(feature => `- **${feature.name}**: ${this.getFeatureJustification(feature.id, projectData.projectComplexity)}`).join('\n')}

## 3. 📋 ESPECIFICAÇÃO TÉCNICA DETALHADA (IFPUG)

${this.generateIFPUGSpecification(selectedScreens, selectedFeatures, projectData)}

## 4. 🔧 ESCOPO DO PROJETO

### Resumo de Componentes Identificados (${selectedScreens.length} telas + ${selectedFeatures.length} funcionalidades)
${selectedScreens.map(screen => `- **${screen.name}** (${screen.category}): ${screen.description}`).join('\n')}

### Funcionalidades Adicionais Determinadas
${selectedFeatures.map(feature => `- **${feature.name}**: ${feature.description}`).join('\n')}

### Total de Pontos de Função Calculados
${this.calculateTotalFunctionPoints(selectedScreens, selectedFeatures, projectData)} PF

## 5. 📊 ANÁLISE DE PONTOS DE FUNÇÃO (RESUMO)

${this.generateFunctionPointSummary(selectedScreens, selectedFeatures, projectData)}

## 6. 💻 STACK TECNOLÓGICO

### Frontend
- **React.js/Next.js** - Framework moderno e performático
- **TailwindCSS** - Estilização responsiva e profissional
- **TypeScript** - Maior segurança e produtividade

### Backend & Infraestrutura
- **Node.js** - Ambiente de execução JavaScript
- **Firebase/Firestore** - Banco de dados em tempo real
- **Vercel/Netlify** - Deploy e hospedagem otimizada

## 7. 📅 CRONOGRAMA DE DESENVOLVIMENTO

| Fase | Atividade | Duração | Entregáveis |
|------|-----------|---------|-------------|
| 1 | Planejamento e Design | 15% | Wireframes, Protótipo |
| 2 | Desenvolvimento Core | 60% | Funcionalidades principais |
| 3 | Integrações e Testes | 20% | Testes, Ajustes |
| 4 | Deploy e Treinamento | 5% | Produção, Documentação |

**Prazo Total Estimado:** ${Math.ceil(this.calculateTotalFunctionPoints(selectedScreens, selectedFeatures, projectData) * 15 / 8)} dias úteis (baseado em PF)

## 8. 💰 INVESTIMENTO E CONDIÇÕES

### Estrutura de Custos
- **Valor/Hora:** R$ ${valorHora.toLocaleString('pt-BR')}
- **Horas Estimadas:** ${projectData.estimatedHours}h
- **Subtotal:** R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- **Desconto:** ${projectData.discount}%
- **VALOR FINAL:** R$ ${valorComDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

### Forma de Pagamento
${this.getPaymentDescription(projectData.paymentMethod)}

### Incluso no Projeto
✅ Desenvolvimento completo das funcionalidades
✅ Design responsivo (mobile, tablet, desktop)
✅ Testes de qualidade e performance
✅ Deploy em ambiente de produção
✅ Documentação técnica
✅ 30 dias de garantia e suporte

## 9. 🛡️ GARANTIAS E SUPORTE

- **Garantia:** 30 dias para correção de bugs
- **Suporte:** Suporte técnico durante desenvolvimento
- **Documentação:** Manual técnico e de usuário
- **Treinamento:** Sessão de treinamento da equipe

## 10. ⚡ PRÓXIMOS PASSOS

1. **Aprovação da Proposta** - Análise e aceite comercial
2. **Kickoff Meeting** - Reunião de alinhamento técnico  
3. **Início do Desenvolvimento** - Sprint de planejamento
4. **Acompanhamento Semanal** - Reviews e feedbacks

---

### 📞 Contato
Esta proposta tem validade de **30 dias** e está sujeita à disponibilidade da equipe.

**Dúvidas?** Entre em contato para esclarecimentos adicionais.

---
*Proposta gerada automaticamente pelo sistema evoSGA em ${new Date().toLocaleDateString('pt-BR')}*`;

    // Calcular total de pontos de função
    const totalFunctionPoints = selectedScreens.reduce((sum, screen) => sum + (screen.functionPoints || 3), 0) +
                                selectedFeatures.reduce((sum, feature) => sum + (feature.functionPoints || 2), 0);

    return {
      proposal: mockProposal,
      success: true,
      type: 'proposal',
      analysisData: {
        screens: selectedScreens,
        features: selectedFeatures,
        analysis: analyzedComponents.analysis
      },
      metadata: {
        totalValue: valorComDesconto,
        originalValue: valorTotal,
        discount: projectData.discount,
        estimatedHours: projectData.estimatedHours,
        screenCount: selectedScreens.length,
        featureCount: selectedFeatures.length,
        totalFunctionPoints: totalFunctionPoints
      }
    };
  }

  /**
   * Gera especificação IFPUG detalhada para cada componente
   */
  generateIFPUGSpecification(selectedScreens, selectedFeatures, projectData) {
    let specification = '';
    
    // Especificação das telas
    selectedScreens.forEach((screen, index) => {
      const ifpugData = this.getIFPUGDataForScreen(screen, projectData.projectComplexity);
      
      specification += `
### ${index + 1}. **${screen.name}** (${screen.category})

**Descrição Funcional:** ${screen.description}

**Análise IFPUG:**
- **Tipo de Função:** ${ifpugData.type}
- **Complexidade:** ${ifpugData.complexity}
- **Pontos de Função:** ${ifpugData.points} PF

**Especificação Detalhada:**
${ifpugData.specification}

**Campos de Entrada:**
${ifpugData.inputFields.map(field => `- ${field}`).join('\n')}

**Regras de Negócio:**
${ifpugData.businessRules.map(rule => `- ${rule}`).join('\n')}

**Validações:**
${ifpugData.validations.map(validation => `- ${validation}`).join('\n')}

**Integrações:**
${ifpugData.integrations.map(integration => `- ${integration}`).join('\n')}

---
`;
    });

    // Especificação das funcionalidades adicionais
    if (selectedFeatures.length > 0) {
      specification += '\n### Funcionalidades Adicionais\n\n';
      
      selectedFeatures.forEach((feature, index) => {
        const ifpugData = this.getIFPUGDataForFeature(feature, projectData.projectComplexity);
        
        specification += `
#### ${selectedScreens.length + index + 1}. **${feature.name}**

**Descrição:** ${feature.description}

**Análise IFPUG:**
- **Tipo:** ${ifpugData.type}
- **Complexidade:** ${ifpugData.complexity}
- **Pontos de Função:** ${ifpugData.points} PF

**Especificação:**
${ifpugData.specification}

---
`;
      });
    }

    return specification;
  }

  /**
   * Gera dados IFPUG para uma tela específica
   */
  getIFPUGDataForScreen(screen, complexity) {
    const screenTypes = {
      'login': {
        type: 'Entrada Externa (EI)',
        complexity: complexity === 'simple' ? 'Simples' : complexity === 'complex' ? 'Complexa' : 'Média',
        points: complexity === 'simple' ? 3 : complexity === 'complex' ? 6 : 4,
        specification: 'Processo de autenticação que recebe credenciais do usuário, valida contra base de dados e retorna token de acesso.',
        inputFields: ['Email/Username', 'Senha', 'Lembrar-me (opcional)', 'Captcha (se necessário)'],
        businessRules: [
          'Validar formato de email',
          'Verificar senha com critérios de segurança',
          'Implementar bloqueio após tentativas falhidas',
          'Registrar logs de acesso'
        ],
        validations: [
          'Campo email obrigatório e formato válido',
          'Campo senha obrigatório, mínimo 8 caracteres',
          'Verificar se usuário está ativo',
          'Validar captcha se aplicável'
        ],
        integrations: ['Banco de dados de usuários', 'Sistema de autenticação', 'Logs de auditoria']
      },
      'register': {
        type: 'Entrada Externa (EI)',
        complexity: complexity === 'simple' ? 'Média' : complexity === 'complex' ? 'Complexa' : 'Média',
        points: complexity === 'simple' ? 4 : complexity === 'complex' ? 6 : 5,
        specification: 'Processo de cadastro que coleta dados do usuário, valida informações e cria nova conta no sistema.',
        inputFields: ['Nome completo', 'Email', 'Senha', 'Confirmação de senha', 'Telefone (opcional)', 'Termos de uso'],
        businessRules: [
          'Email deve ser único no sistema',
          'Senha deve atender critérios de segurança',
          'Enviar email de confirmação',
          'Ativar conta após confirmação'
        ],
        validations: [
          'Todos os campos obrigatórios preenchidos',
          'Formato de email válido',
          'Senha e confirmação devem coincidir',
          'Aceite dos termos obrigatório'
        ],
        integrations: ['Banco de dados de usuários', 'Serviço de email', 'Sistema de validação']
      },
      'dashboard': {
        type: 'Consulta Externa (EQ)',
        complexity: complexity === 'simple' ? 'Média' : complexity === 'complex' ? 'Complexa' : 'Média',
        points: complexity === 'simple' ? 3 : complexity === 'complex' ? 5 : 4,
        specification: 'Tela principal que apresenta resumo de informações, métricas e atalhos para principais funcionalidades.',
        inputFields: ['Filtros de data', 'Seleção de período', 'Parâmetros de visualização'],
        businessRules: [
          'Mostrar apenas dados do usuário logado',
          'Aplicar filtros de segurança por perfil',
          'Atualizar dados em tempo real',
          'Cachear informações quando possível'
        ],
        validations: [
          'Verificar permissões do usuário',
          'Validar parâmetros de filtro',
          'Limitar quantidade de dados exibidos'
        ],
        integrations: ['Múltiplas fontes de dados', 'Sistema de cache', 'APIs de terceiros']
      },
      'user-management': {
        type: 'Arquivo Lógico Interno (ALI)',
        complexity: complexity === 'simple' ? 'Média' : complexity === 'complex' ? 'Complexa' : 'Média',
        points: complexity === 'simple' ? 7 : complexity === 'complex' ? 15 : 10,
        specification: 'Grupo de dados e funcionalidades para gerenciar usuários, perfis e permissões do sistema.',
        inputFields: ['Dados pessoais', 'Informações de contato', 'Perfil de acesso', 'Status da conta', 'Permissões'],
        businessRules: [
          'Hierarquia de permissões',
          'Auditoria de alterações',
          'Workflow de aprovação',
          'Notificações automáticas'
        ],
        validations: [
          'Permissão para alteração',
          'Integridade referencial',
          'Campos obrigatórios por perfil'
        ],
        integrations: ['Sistema de autenticação', 'Workflow engine', 'Sistema de notificações']
      }
    };

    // Retorna dados específicos ou dados genéricos baseados no tipo
    return screenTypes[screen.id] || {
      type: 'Entrada Externa (EI)',
      complexity: complexity === 'simple' ? 'Simples' : complexity === 'complex' ? 'Complexa' : 'Média',
      points: complexity === 'simple' ? 3 : complexity === 'complex' ? 6 : 4,
      specification: `Funcionalidade ${screen.name} que ${screen.description.toLowerCase()}`,
      inputFields: ['Campos de entrada padrão', 'Botões de ação', 'Controles de navegação'],
      businessRules: ['Validar dados de entrada', 'Aplicar regras de negócio específicas', 'Registrar operações'],
      validations: ['Campos obrigatórios', 'Formato dos dados', 'Integridade das informações'],
      integrations: ['Banco de dados principal', 'APIs relacionadas', 'Sistemas externos']
    };
  }

  /**
   * Gera dados IFPUG para funcionalidade adicional
   */
  getIFPUGDataForFeature(feature, complexity) {
    const featureMultiplier = complexity === 'simple' ? 0.8 : complexity === 'complex' ? 1.5 : 1.0;
    const basePoints = 4;

    return {
      type: 'Funcionalidade Transversal',
      complexity: complexity === 'simple' ? 'Simples' : complexity === 'complex' ? 'Complexa' : 'Média',
      points: Math.round(basePoints * featureMultiplier),
      specification: `${feature.description} - Implementação integrada em múltiplos componentes do sistema com configuração centralizada e impacto em toda a aplicação.`
    };
  }

  /**
   * Calcula total de pontos de função
   */
  calculateTotalFunctionPoints(selectedScreens, selectedFeatures, projectData) {
    let total = 0;
    
    // Pontos das telas
    selectedScreens.forEach(screen => {
      const ifpugData = this.getIFPUGDataForScreen(screen, projectData.projectComplexity);
      total += ifpugData.points;
    });
    
    // Pontos das funcionalidades
    selectedFeatures.forEach(feature => {
      const ifpugData = this.getIFPUGDataForFeature(feature, projectData.projectComplexity);
      total += ifpugData.points;
    });
    
    return total;
  }

  /**
   * Gera resumo de pontos de função
   */
  generateFunctionPointSummary(selectedScreens, selectedFeatures, projectData) {
    const totalPF = this.calculateTotalFunctionPoints(selectedScreens, selectedFeatures, projectData);
    const adjustmentFactor = 1.0; // Fator de ajuste técnico neutro
    const adjustedPF = Math.round(totalPF * adjustmentFactor);
    
    // Estimativa de produtividade: 10-20 horas por PF dependendo da complexidade
    const productivityFactor = projectData.projectComplexity === 'simple' ? 10 : 
                              projectData.projectComplexity === 'complex' ? 20 : 15;
    const estimatedHours = adjustedPF * productivityFactor;

    return `
### Contagem de Pontos de Função

| Tipo de Função | Quantidade | Pontos | Subtotal |
|----------------|------------|---------|----------|
| Entradas Externas (EI) | ${selectedScreens.filter(s => this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Entrada')).length} | Variável | ${selectedScreens.reduce((sum, s) => sum + (this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Entrada') ? this.getIFPUGDataForScreen(s, projectData.projectComplexity).points : 0), 0)} PF |
| Saídas Externas (EO) | ${selectedScreens.filter(s => this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Saída')).length} | Variável | ${selectedScreens.reduce((sum, s) => sum + (this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Saída') ? this.getIFPUGDataForScreen(s, projectData.projectComplexity).points : 0), 0)} PF |
| Consultas Externas (EQ) | ${selectedScreens.filter(s => this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Consulta')).length} | Variável | ${selectedScreens.reduce((sum, s) => sum + (this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Consulta') ? this.getIFPUGDataForScreen(s, projectData.projectComplexity).points : 0), 0)} PF |
| Arquivos Lógicos Internos (ALI) | ${selectedScreens.filter(s => this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Arquivo')).length} | Variável | ${selectedScreens.reduce((sum, s) => sum + (this.getIFPUGDataForScreen(s, projectData.projectComplexity).type.includes('Arquivo') ? this.getIFPUGDataForScreen(s, projectData.projectComplexity).points : 0), 0)} PF |
| Funcionalidades Adicionais | ${selectedFeatures.length} | ${selectedFeatures.length > 0 ? Math.round(selectedFeatures.reduce((sum, f) => sum + this.getIFPUGDataForFeature(f, projectData.projectComplexity).points, 0) / selectedFeatures.length) : 0} | ${selectedFeatures.reduce((sum, f) => sum + this.getIFPUGDataForFeature(f, projectData.projectComplexity).points, 0)} PF |

### Resumo dos Pontos de Função
- **Total de PF Não Ajustados:** ${totalPF} PF
- **Fator de Ajuste Técnico:** ${adjustmentFactor}
- **Total de PF Ajustados:** ${adjustedPF} PF
- **Produtividade Estimada:** ${productivityFactor}h/PF
- **Estimativa de Esforço:** ${estimatedHours}h (${Math.ceil(estimatedHours/8)} dias úteis)

### Comparação com Estimativa Inicial
- **Estimativa Inicial:** ${projectData.estimatedHours}h
- **Estimativa por PF:** ${estimatedHours}h
- **Diferença:** ${Math.abs(estimatedHours - projectData.estimatedHours)}h (${((Math.abs(estimatedHours - projectData.estimatedHours) / projectData.estimatedHours) * 100).toFixed(1)}%)
`;
  }

  /**
   * Gera justificativa para inclusão de tela baseada na descrição
   */
  getJustification(screenId, description) {
    const justifications = {
      'login': 'autenticação de usuários e controle de acesso ao sistema',
      'register': 'cadastro de novos usuários e expansão da base',
      'forgot-password': 'recuperação de senha e melhoria da experiência do usuário',
      'profile': 'gestão de dados pessoais e configurações da conta',
      'user-settings': 'personalização e configurações avançadas',
      'dashboard': 'visualização centralizada de informações e métricas',
      'sidebar': 'navegação intuitiva entre funcionalidades',
      'header': 'acesso rápido a funcionalidades principais',
      'breadcrumb': 'orientação de navegação hierárquica',
      'search': 'localização rápida de informações',
      'data-table': 'listagem e gestão de dados estruturados',
      'form-create': 'criação de novos registros no sistema',
      'form-edit': 'edição e atualização de dados existentes',
      'detail-view': 'visualização detalhada de informações específicas',
      'bulk-actions': 'operações em massa para eficiência operacional',
      'product-catalog': 'exibição organizada de produtos/serviços',
      'product-detail': 'informações detalhadas para decisão de compra',
      'shopping-cart': 'gestão de itens selecionados',
      'checkout': 'finalização de transações e pagamentos',
      'order-history': 'histórico e acompanhamento de pedidos',
      'notifications': 'comunicação de eventos e atualizações',
      'chat': 'comunicação em tempo real entre usuários',
      'email-templates': 'comunicação automatizada via email',
      'feedback': 'coleta de opiniões e melhorias',
      'help-center': 'suporte e documentação para usuários',
      'analytics-dashboard': 'análise de métricas e performance',
      'reports': 'geração de relatórios personalizados',
      'charts': 'visualização gráfica de dados',
      'export-data': 'exportação de dados em diversos formatos',
      'real-time-metrics': 'monitoramento em tempo real',
      'admin-panel': 'gestão administrativa do sistema',
      'user-management': 'controle de usuários e permissões',
      'role-permissions': 'segurança e controle de acesso granular',
      'system-logs': 'auditoria e monitoramento de atividades',
      'backup-restore': 'segurança e continuidade dos dados'
    };

    return justifications[screenId] || 'funcionalidade essencial identificada na análise do projeto';
  }

  /**
   * Gera justificativa para funcionalidade adicional
   */
  getFeatureJustification(featureId, complexity) {
    const justifications = {
      'responsive': 'Essencial para acessibilidade em dispositivos móveis e tablets',
      'dark-mode': 'Melhoria na experiência do usuário e redução de fadiga visual',
      'animations': 'Aprimoramento da experiência através de micro-interações',
      'pwa': 'Funcionalidades nativas e melhor performance',
      'offline': 'Continuidade de uso mesmo sem conexão com internet',
      'multi-language': 'Expansão para público internacional',
      'accessibility': 'Inclusão e conformidade com padrões de acessibilidade',
      'seo': 'Otimização para motores de busca e visibilidade online'
    };

    const complexityNote = complexity === 'complex' ? ' (essencial para projetos complexos)' : 
                          complexity === 'medium' ? ' (recomendado para projetos médios)' : '';

    return (justifications[featureId] || 'Funcionalidade identificada como necessária') + complexityNote;
  }

  /**
   * Descreve forma de pagamento
   */
  getPaymentDescription(paymentMethod) {
    const descriptions = {
      'half-start-half-end': '**50% no início** + **50% na entrega final**',
      'progress-payment': '**Pagamento por progresso** - Parcelas conforme entregas',
      'full-start-discount': '**100% antecipado** com **10% de desconto adicional**'
    };
    
    return descriptions[paymentMethod] || 'A definir conforme negociação';
  }

  /**
   * Simula geração de componentes para desenvolvimento/teste
   */
  async mockGeneration(projectData, screenDatabase, featuresDatabase) {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));

    const selectedScreens = screenDatabase.categories
      .flatMap(cat => cat.screens)
      .filter(screen => projectData.selectedScreens.includes(screen.id));

    const generatedFiles = selectedScreens.map(screen => ({
      path: `src/components/generated/${screen.id}/${this.capitalize(screen.id)}.js`,
      content: this.generateMockComponent(screen, projectData),
      dependencies: ['react', 'tailwindcss'],
      estimatedHours: this.calculateScreenHours(projectData.projectComplexity)
    }));

    return {
      generatedFiles,
      projectStructure: {
        totalFiles: generatedFiles.length,
        totalLines: generatedFiles.length * 150,
        estimatedDevelopmentTime: `${projectData.estimatedHours} horas`
      },
      integrationInstructions: [
        "Instalar dependências: npm install",
        "Adicionar rotas ao sistema de navegação",
        "Configurar Firebase se necessário",
        "Executar testes: npm test"
      ],
      success: true
    };
  }

  /**
   * Gera componente mock para demonstração
   */
  generateMockComponent(screen, projectData) {
    return `import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';

const ${this.capitalize(screen.id)} = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Inicialização do componente
    // Complexidade: ${projectData.projectComplexity}
  }, []);

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center mb-6">
        <i className="fi fi-rr-document mr-3 text-blue-500"></i>
        <h2 className="text-xl font-bold text-gray-800">${screen.name}</h2>
      </div>
      
      <div className="space-y-6">
        <p className="text-gray-600">${screen.description}</p>
        
        {/* Componente gerado automaticamente pela IA */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-500">
            Este componente foi gerado automaticamente baseado nas especificações da proposta.
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="secondary">Cancelar</Button>
          <Button variant="primary">Salvar</Button>
        </div>
      </div>
    </div>
  );
};

export default ${this.capitalize(screen.id)};`;
  }

  /**
   * Calcula horas estimadas por tela baseado na complexidade
   */
  calculateScreenHours(complexity) {
    const hours = {
      simple: 6,
      medium: 10,
      complex: 16
    };
    return hours[complexity] || 10;
  }

  /**
   * Capitaliza primeira letra
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, '');
  }

  /**
   * Valida se a API está configurada
   */
  isConfigured() {
    return !!(this.apiKey && this.baseUrl);
  }
}

const aiGeneratorService = new AIGeneratorService();
export default aiGeneratorService;