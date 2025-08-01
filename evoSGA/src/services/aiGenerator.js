// services/aiGenerator.js
// Arquivo mantido para compatibilidade - redireciona para o novo serviço

import { AIGeneratorService } from './ai/AIGeneratorService.js';

/**
 * @deprecated Use AIGeneratorService from './ai/AIGeneratorService.js' instead
 * Este arquivo é mantido para compatibilidade com código existente
 */
class AIGeneratorServiceLegacy extends AIGeneratorService {
  constructor() {
    super();
    console.warn('⚠️ Usando serviço legado. Considere migrar para o novo serviço modular.');
  }

  /**
   * @deprecated Use generateAnalysis instead
   */
  async generateProposal(projectData, screenDatabase, featuresDatabase) {
    console.warn('⚠️ Usando método legado generateProposal. Use generateAnalysis.');
    
    // Converter dados para o novo formato
    const analysisData = {
      description: projectData.description,
      complexity: projectData.projectComplexity || 'medium',
      estimatedHours: projectData.estimatedHours || 0
    };

    return await this.generateAnalysisWithRetry(analysisData);
  }

}

// Manter a mesma interface para compatibilidade
const aiGeneratorService = new AIGeneratorServiceLegacy();

// Exportar métodos individuais para compatibilidade
export const generateProposal = aiGeneratorService.generateProposal.bind(aiGeneratorService);

// Exportar classe e instância para compatibilidade total
export { AIGeneratorServiceLegacy as AIGeneratorService };
export default aiGeneratorService;