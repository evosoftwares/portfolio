// services/ai/AIGeneratorService.js
import { OpenRouterClient } from './clients/OpenRouterClient.js';
import { PromptBuilder } from './prompts/PromptBuilder.js';
import { ResponseParser } from './parsers/ResponseParser.js';
import { AnalysisPipeline } from './pipeline/AnalysisPipeline.js';
import { Cache } from './utils/Cache.js';
import { RateLimiter } from './utils/RateLimiter.js';
import aiConfig from './config/ai.config.js';
import { AIError, AIRateLimitError } from './errors/AIError.js';

/**
 * @class AIGeneratorService
 * @description Serviço principal para análise de projetos usando IA
 * 
 * @example
 * const service = new AIGeneratorService();
 * const analysis = await service.generateAnalysis({
 *   description: 'Sistema de e-commerce com gestão de estoque',
 *   complexity: 'high'
 * });
 * 
 * // Resultado esperado:
 * {
 *   roles: [
 *     { name: 'Admin', permissions: ['manage_products', 'view_reports'] },
 *     { name: 'Customer', permissions: ['browse_products', 'make_purchases'] }
 *   ],
 *   flows: [
 *     { name: 'Purchase Flow', role: 'Customer', steps: [...] }
 *   ]
 * }
 */
export class AIGeneratorService {
  constructor(aiClient, promptBuilder, responseParser, config = aiConfig) {
    this.aiClient = aiClient || new OpenRouterClient(config);
    this.promptBuilder = promptBuilder || new PromptBuilder();
    this.responseParser = responseParser || new ResponseParser();
    this.config = config;
    
    // Utilitários
    this.cache = new Cache(config);
    this.rateLimiter = new RateLimiter(config);
    this.pipeline = new AnalysisPipeline(
      this.aiClient,
      this.promptBuilder,
      this.responseParser,
      config
    );

    // Métricas
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      tokenUsage: 0
    };

    console.log('🤖 AIGeneratorService inicializado');
    console.log('📡 Configuração:', this.aiClient.getModelInfo());
  }

  /**
   * Gera análise completa de um projeto usando IA
   * @param {Object} projectData - Dados do projeto
   * @returns {Promise<Object>} Resultado da análise
   */
  async generateAnalysis(projectData) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Verifica rate limiting
      if (!this.rateLimiter.canMakeRequest('default')) {
        throw new AIRateLimitError({
          info: this.rateLimiter.getRateLimitInfo('default')
        });
      }

      // Registra a requisição
      this.rateLimiter.registerRequest('default');

      // Processa através do pipeline
      const result = await this.pipeline.process(projectData);

      // Atualiza métricas
      this.metrics.successfulRequests++;
      this.updateAverageResponseTime(Date.now() - startTime);

      return result;
    } catch (error) {
      this.metrics.failedRequests++;
      
      console.error('❌ Erro na geração de análise:', error);
      
      throw new AIError(
        'Falha na geração de análise',
        'ANALYSIS_FAILED',
        { 
          originalError: error.message,
          projectData: projectData?.description?.substring(0, 100) + '...'
        }
      );
    }
  }

  /**
   * Gera análise com retry e backoff exponencial
   * @param {Object} projectData - Dados do projeto
   * @param {Object} retryConfig - Configuração de retry
   * @returns {Promise<Object>} Resultado da análise
   */
  async generateAnalysisWithRetry(projectData, retryConfig = this.config.retry) {
    const maxRetries = retryConfig?.maxRetries || 5;
    const backoffMultiplier = retryConfig?.backoffMultiplier || 2;
    const initialDelay = retryConfig?.initialDelay || 1000;
    const maxDelay = retryConfig?.maxDelay || 30000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateAnalysis(projectData);
      } catch (error) {
        console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries + 1} falhou:`, error.message);
        
        // Se for a última tentativa, lança o erro
        if (attempt === maxRetries) {
          console.error(`❌ Todas as tentativas falharam após ${maxRetries + 1} tentativas`);
          throw this.createEnhancedError(error, projectData, attempt + 1);
        }

        // Calcula delay com backoff exponencial, limitado pelo maxDelay
        let delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );

        // Se for rate limiting, usa delay específico
        if (this.isRateLimitError(error)) {
          delay = retryConfig?.rateLimitBackoffMs || 60000;
          console.log(`⏳ Rate limit detectado, aguardando ${delay}ms...`);
        } else {
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        }

        await this.delay(delay);
      }
    }
  }

  /**
   * Verifica se o erro é relacionado a rate limiting
   * @param {Error} error - Erro a verificar
   * @returns {boolean} True se for rate limiting
   */
  isRateLimitError(error) {
    return error instanceof AIRateLimitError ||
           error.message.includes('429') ||
           error.message.includes('rate-limited') ||
           error.message.includes('Rate limit');
  }

  /**
   * Cria um erro aprimorado com contexto adicional
   * @param {Error} originalError - Erro original
   * @param {Object} projectData - Dados do projeto
   * @param {number} attempts - Número de tentativas
   * @returns {AIError} Erro aprimorado
   */
  createEnhancedError(originalError, projectData, attempts) {
    if (this.isRateLimitError(originalError)) {
      return new AIRateLimitError({
        originalError: originalError.message,
        attempts: attempts,
        projectDescription: projectData?.description?.substring(0, 100) + '...',
        suggestion: 'Tente novamente em alguns minutos ou configure uma API key própria',
        rateLimitInfo: this.rateLimiter.getRateLimitInfo('default')
      });
    }

    return new AIError(
      'Falha na geração de análise após múltiplas tentativas',
      'ANALYSIS_FAILED_AFTER_RETRIES',
      { 
        originalError: originalError.message,
        attempts: attempts,
        projectDescription: projectData?.description?.substring(0, 100) + '...',
        modelInfo: this.aiClient.getModelInfo()
      }
    );
  }

  /**
   * Atualiza tempo médio de resposta
   * @param {number} responseTime - Tempo de resposta em ms
   */
  updateAverageResponseTime(responseTime) {
    const total = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1) + responseTime;
    this.metrics.averageResponseTime = total / this.metrics.successfulRequests;
  }

  /**
   * Delay assíncrono
   * @param {number} ms - Milissegundos
   * @returns {Promise<void>}
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica se o serviço está configurado corretamente
   * @returns {boolean} True se configurado corretamente
   */
  isConfigured() {
    return this.aiClient.isConfigured();
  }

  /**
   * Obtém métricas do serviço
   * @returns {Object} Métricas atuais
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? this.metrics.successfulRequests / this.metrics.totalRequests 
        : 0,
      cacheStats: this.cache.getStats(),
      rateLimitInfo: this.rateLimiter.getRateLimitInfo('default')
    };
  }

  /**
   * Limpa o cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache limpo');
  }
}

// Exporta instância padrão
const defaultService = new AIGeneratorService();
export default defaultService;