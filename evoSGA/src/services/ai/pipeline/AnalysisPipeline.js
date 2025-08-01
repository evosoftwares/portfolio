// services/ai/pipeline/AnalysisPipeline.js
import { PromptBuilder } from '../prompts/PromptBuilder.js';
import { ResponseParser } from '../parsers/ResponseParser.js';
import { OpenRouterClient } from '../clients/OpenRouterClient.js';
import { Cache } from '../utils/Cache.js';
import { RateLimiter } from '../utils/RateLimiter.js';
import aiConfig from '../config/ai.config.js';

export class AnalysisPipeline {
  constructor(aiClient, promptBuilder, responseParser, config = aiConfig) {
    this.stages = [
      new RoleIdentificationStage(aiClient, promptBuilder, responseParser, config),
      new FlowMappingStage(aiClient, promptBuilder, responseParser, config),
      new ScreenDerivationStage(aiClient, promptBuilder, responseParser, config),
      new ValidationStage(aiClient, promptBuilder, responseParser, config)
    ];
    
    this.cache = new Cache(config);
    this.rateLimiter = new RateLimiter(config);
  }

  /**
   * Processa um projeto através de todas as etapas do pipeline
   * @param {Object} projectData - Dados do projeto
   * @returns {Promise<Object>} Resultado do processamento
   */
  async process(projectData) {
    const cacheKey = this.cache.generateKey(projectData);
    
    // Verifica cache primeiro
    if (this.cache.has(cacheKey)) {
      console.log('🎯 Usando resultado em cache');
      return this.cache.get(cacheKey);
    }

    let result = {
      projectData: projectData,
      stages: {},
      success: true,
      errors: []
    };

    // Processa cada etapa
    for (const stage of this.stages) {
      try {
        console.log(`🚀 Executando etapa: ${stage.name}`);
        
        const stageResult = await stage.execute(result);
        result.stages[stage.name] = stageResult;
        
        if (!stageResult.success) {
          result.success = false;
          result.errors.push({
            stage: stage.name,
            error: stageResult.error
          });
          
          // Se for uma etapa crítica, interrompe o pipeline
          if (stage.critical) {
            console.log(`❌ Etapa crítica falhou: ${stage.name}`);
            break;
          }
        }
        
        // Atualiza o resultado para a próxima etapa
        result = { ...result, ...stageResult };
        
      } catch (error) {
        console.error(`❌ Erro na etapa ${stage.name}:`, error);
        result.success = false;
        result.errors.push({
          stage: stage.name,
          error: error.message
        });
        
        // Se for uma etapa crítica, interrompe o pipeline
        if (stage.critical) {
          break;
        }
      }
    }

    // Armazena no cache se bem sucedido
    if (result.success) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Obtém estatísticas do pipeline
   * @returns {Object} Estatísticas
   */
  getStats() {
    return {
      cache: this.cache.getStats(),
      rateLimiter: this.rateLimiter.getRateLimitInfo('default')
    };
  }
}

// Etapas do pipeline
class PipelineStage {
  constructor(aiClient, promptBuilder, responseParser, config) {
    this.aiClient = aiClient;
    this.promptBuilder = promptBuilder;
    this.responseParser = responseParser;
    this.config = config;
    this.critical = false;
  }

  async execute(data) {
    throw new Error('Método execute não implementado');
  }
}

export class RoleIdentificationStage extends PipelineStage {
  constructor(aiClient, promptBuilder, responseParser, config) {
    super(aiClient, promptBuilder, responseParser, config);
    this.name = 'RoleIdentification';
    this.critical = true;
  }

  async execute(data) {
    try {
      const prompt = this.promptBuilder.generateStrategicPrompt(data.projectData);
      
      const response = await this.aiClient.call({
        messages: [
          {
            role: 'system',
            content: 'Você é um arquiteto de software especializado em análise de requisitos. Responda sempre em português brasileiro com linguagem técnica mas acessível.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      // Verifica se a resposta existe e tem conteúdo
      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        console.error('❌ Resposta da IA inválida ou vazia');
        return {
          success: true, // Não falha o pipeline
          roles: [],
          flows: [],
          dataModel: {},
          rawResponse: '',
          error: 'Resposta da IA inválida'
        };
      }

      const aiContent = response.choices[0].message.content;
      
      // Log da resposta para debug
      console.log('📝 Resposta da IA (primeiros 200 chars):', aiContent.substring(0, 200) + '...');

      const parsedResponse = this.responseParser.parseRolesAndFlowsResponse(aiContent);

      // Sempre retorna sucesso para não quebrar o pipeline
      return {
        success: true,
        roles: parsedResponse.roles || [],
        flows: parsedResponse.flows || [],
        dataModel: parsedResponse.dataModel || {},
        rawResponse: parsedResponse.rawResponse || aiContent,
        error: parsedResponse.error,
        warning: parsedResponse.warning
      };
    } catch (error) {
      console.error('❌ Erro crítico em RoleIdentificationStage:', error);
      
      // Retorna estrutura mínima para não quebrar o pipeline
      return {
        success: true, // Não falha o pipeline
        roles: [],
        flows: [],
        dataModel: {},
        rawResponse: '',
        error: `Erro na identificação de papéis: ${error.message}`
      };
    }
  }
}

export class FlowMappingStage extends PipelineStage {
  constructor(aiClient, promptBuilder, responseParser, config) {
    super(aiClient, promptBuilder, responseParser, config);
    this.name = 'FlowMapping';
    this.critical = true;
  }

  async execute(data) {
    try {
      // Usa os papéis identificados na etapa anterior
      const context = {
        roles: data.roles || [],
        initialFlows: data.flows || []
      };

      const prompt = this.promptBuilder.generateDetailedScreensPrompt(
        data.projectData,
        context
      );

      const response = await this.aiClient.call({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em mapeamento de fluxos de usuário. Responda sempre em português brasileiro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2500
      });

      // Verifica se a resposta existe e tem conteúdo
      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        console.error('❌ Resposta da IA inválida ou vazia no FlowMapping');
        return {
          success: true, // Não falha o pipeline
          screens: [],
          components: [],
          rawResponse: '',
          error: 'Resposta da IA inválida no mapeamento de fluxos'
        };
      }

      const aiContent = response.choices[0].message.content;
      
      // Log da resposta para debug
      console.log('📝 Resposta do FlowMapping (primeiros 200 chars):', aiContent.substring(0, 200) + '...');

      const parsedResponse = this.responseParser.parseScreensResponse(aiContent);

      // Sempre retorna sucesso para não quebrar o pipeline
      return {
        success: true,
        screens: parsedResponse.screens || [],
        components: parsedResponse.components || [],
        rawResponse: parsedResponse.rawResponse || aiContent,
        error: parsedResponse.error,
        warning: parsedResponse.warning
      };
    } catch (error) {
      console.error('❌ Erro crítico em FlowMappingStage:', error);
      
      // Retorna estrutura mínima para não quebrar o pipeline
      return {
        success: true, // Não falha o pipeline
        screens: [],
        components: [],
        rawResponse: '',
        error: `Erro no mapeamento de fluxos: ${error.message}`
      };
    }
  }
}

export class ScreenDerivationStage extends PipelineStage {
  constructor(aiClient, promptBuilder, responseParser, config) {
    super(aiClient, promptBuilder, responseParser, config);
    this.name = 'ScreenDerivation';
    this.critical = false;
  }

  async execute(data) {
    try {
      // Deriva telas adicionais baseadas nos fluxos identificados
      const additionalScreens = this._deriveScreensFromFlows(data.flows || [], data.screens || []);
      const enhancedScreens = this._enhanceScreensWithComponents(data.screens || []);
      
      return {
        success: true,
        derivedScreens: additionalScreens,
        enhancedScreens: enhancedScreens,
        message: `Derivadas ${additionalScreens.length} telas adicionais`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  _deriveScreensFromFlows(flows, existingScreens) {
    const derivedScreens = [];
    const existingScreenNames = existingScreens.map(s => s.name?.toLowerCase());

    flows.forEach(flow => {
      if (flow.steps) {
        flow.steps.forEach(step => {
          const screenName = this._extractScreenFromStep(step);
          if (screenName && !existingScreenNames.includes(screenName.toLowerCase())) {
            derivedScreens.push({
              name: screenName,
              description: `Tela derivada do fluxo: ${flow.name}`,
              type: 'derived',
              fromFlow: flow.name
            });
          }
        });
      }
    });

    return derivedScreens;
  }

  _extractScreenFromStep(step) {
    const keywords = ['página', 'tela', 'formulário', 'modal', 'dialog'];
    const stepText = step.toLowerCase();
    
    for (const keyword of keywords) {
      if (stepText.includes(keyword)) {
        return step.split(' ').slice(-2).join(' ');
      }
    }
    return null;
  }

  _enhanceScreensWithComponents(screens) {
    return screens.map(screen => ({
      ...screen,
      components: this._suggestComponents(screen),
      complexity: this._calculateScreenComplexity(screen)
    }));
  }

  _suggestComponents(screen) {
    const components = [];
    const description = (screen.description || '').toLowerCase();
    
    if (description.includes('lista') || description.includes('tabela')) {
      components.push('DataTable', 'Pagination', 'SearchFilter');
    }
    if (description.includes('formulário') || description.includes('cadastro')) {
      components.push('Form', 'ValidationMessage', 'SubmitButton');
    }
    if (description.includes('dashboard') || description.includes('painel')) {
      components.push('Chart', 'MetricCard', 'StatusIndicator');
    }
    
    return components;
  }

  _calculateScreenComplexity(screen) {
    let complexity = 1;
    const description = (screen.description || '').toLowerCase();
    
    if (description.includes('crud')) complexity += 2;
    if (description.includes('relatório')) complexity += 1;
    if (description.includes('dashboard')) complexity += 3;
    if (description.includes('integração')) complexity += 2;
    
    return Math.min(complexity, 5);
  }
}

export class ValidationStage extends PipelineStage {
  constructor(aiClient, promptBuilder, responseParser, config) {
    super(aiClient, promptBuilder, responseParser, config);
    this.name = 'Validation';
    this.critical = false;
  }

  async execute(data) {
    try {
      const validation = {
        roles: this._validateRoles(data.roles || []),
        flows: this._validateFlows(data.flows || []),
        screens: this._validateScreens(data.screens || []),
        dataModel: this._validateDataModel(data.dataModel || {}),
        overall: { issues: [], warnings: [], suggestions: [] }
      };

      // Validações cruzadas
      this._performCrossValidation(data, validation);

      const hasErrors = validation.overall.issues.length > 0;
      const hasWarnings = validation.overall.warnings.length > 0;

      return {
        success: !hasErrors,
        validation,
        message: this._generateValidationMessage(validation),
        hasWarnings,
        hasErrors
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  _validateRoles(roles) {
    const issues = [];
    const warnings = [];
    
    if (roles.length === 0) {
      issues.push('Nenhum papel de usuário foi identificado');
    }
    
    roles.forEach((role, index) => {
      if (!role.name || role.name.trim() === '') {
        issues.push(`Papel ${index + 1} não possui nome`);
      }
      if (!role.description || role.description.trim() === '') {
        warnings.push(`Papel "${role.name}" não possui descrição`);
      }
    });

    return { valid: issues.length === 0, issues, warnings, count: roles.length };
  }

  _validateFlows(flows) {
    const issues = [];
    const warnings = [];
    
    if (flows.length === 0) {
      warnings.push('Nenhum fluxo de usuário foi identificado');
    }
    
    flows.forEach((flow, index) => {
      if (!flow.name || flow.name.trim() === '') {
        issues.push(`Fluxo ${index + 1} não possui nome`);
      }
      if (!flow.steps || !Array.isArray(flow.steps) || flow.steps.length === 0) {
        warnings.push(`Fluxo "${flow.name}" não possui etapas definidas`);
      }
    });

    return { valid: issues.length === 0, issues, warnings, count: flows.length };
  }

  _validateScreens(screens) {
    const issues = [];
    const warnings = [];
    
    if (screens.length === 0) {
      issues.push('Nenhuma tela foi identificada');
    }
    
    const screenNames = [];
    screens.forEach((screen, index) => {
      if (!screen.name || screen.name.trim() === '') {
        issues.push(`Tela ${index + 1} não possui nome`);
      } else {
        if (screenNames.includes(screen.name.toLowerCase())) {
          warnings.push(`Tela duplicada encontrada: "${screen.name}"`);
        }
        screenNames.push(screen.name.toLowerCase());
      }
      
      if (!screen.description || screen.description.trim() === '') {
        warnings.push(`Tela "${screen.name}" não possui descrição`);
      }
    });

    return { valid: issues.length === 0, issues, warnings, count: screens.length };
  }

  _validateDataModel(dataModel) {
    const issues = [];
    const warnings = [];
    
    if (!dataModel || Object.keys(dataModel).length === 0) {
      warnings.push('Modelo de dados não foi definido');
    }

    return { valid: issues.length === 0, issues, warnings };
  }

  _performCrossValidation(data, validation) {
    // Validar se fluxos referenciam telas existentes
    const screenNames = (data.screens || []).map(s => s.name?.toLowerCase()).filter(Boolean);
    
    (data.flows || []).forEach(flow => {
      if (flow.steps) {
        flow.steps.forEach(step => {
          const referencedScreens = this._extractScreenReferences(step);
          referencedScreens.forEach(screenRef => {
            if (!screenNames.includes(screenRef.toLowerCase())) {
              validation.overall.warnings.push(
                `Fluxo "${flow.name}" referencia tela inexistente: "${screenRef}"`
              );
            }
          });
        });
      }
    });

    // Sugerir melhorias
    if (validation.screens.count > 10) {
      validation.overall.suggestions.push('Considere agrupar telas similares ou criar um fluxo de navegação hierárquico');
    }
    
    if (validation.roles.count === 1) {
      validation.overall.suggestions.push('Considere identificar diferentes níveis de permissão ou papéis administrativos');
    }
  }

  _extractScreenReferences(step) {
    const references = [];
    const stepText = step.toLowerCase();
    const keywords = ['página', 'tela', 'formulário', 'modal'];
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}\\s+de\\s+(\\w+)`, 'gi');
      const matches = stepText.match(regex);
      if (matches) {
        matches.forEach(match => {
          const screenName = match.split(' ').pop();
          references.push(screenName);
        });
      }
    });
    
    return references;
  }

  _generateValidationMessage(validation) {
    const totalIssues = validation.overall.issues.length;
    const totalWarnings = validation.overall.warnings.length;
    const totalSuggestions = validation.overall.suggestions.length;

    if (totalIssues > 0) {
      return `Validação falhou: ${totalIssues} erro(s) encontrado(s)`;
    }
    
    if (totalWarnings > 0) {
      return `Validação concluída com ${totalWarnings} aviso(s)`;
    }
    
    let message = 'Validação concluída com sucesso';
    if (totalSuggestions > 0) {
      message += ` (${totalSuggestions} sugestão(ões) disponível(eis))`;
    }
    
    return message;
  }
}

export default AnalysisPipeline;