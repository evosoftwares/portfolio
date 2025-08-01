// AI Generator Service Tests
import aiGenerator from '../aiGenerator'

// Mock fetch globally
global.fetch = jest.fn()

describe('AI Generator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch.mockClear()
    console.log = jest.fn()
    console.error = jest.fn()
  })

  describe('Service Initialization', () => {
    test('initializes with environment variables', () => {
      expect(aiGenerator.apiKey).toBe('test-openai-key')
      expect(aiGenerator.baseUrl).toBe('https://test.openrouter.ai/api/v1')
      expect(aiGenerator.model).toBe('test-model')
    })

    test('detects missing API key configuration', () => {
      // Temporarily clear API key
      const originalKey = aiGenerator.apiKey
      aiGenerator.apiKey = ''
      
      expect(aiGenerator.isConfigured()).toBe(false)
      
      // Restore
      aiGenerator.apiKey = originalKey
    })
  })

  describe('Proposal Generation', () => {
    const mockProjectData = {
      description: 'Sistema de gestão de projetos',
      projectComplexity: 'medium',
      estimatedHours: 40,
      discount: 10,
      paymentMethod: 'half-start-half-end'
    }

    test('generates proposal successfully with real API', async () => {
      const mockApiResponse = {
        choices: [{
          message: {
            content: `---TELAS_E_COMPONENTES_INICIO---
# Sistema de Gestão de Projetos

## Análise do Projeto
Identificadas 5 telas principais para o sistema.

## Telas Identificadas
1. Dashboard principal
2. Lista de projetos
3. Formulário de projeto
4. Relatórios
5. Configurações

---TELAS_E_COMPONENTES_FIM---

---DADOS_ESTRUTURADOS_INICIO---
{
  "screens": [
    {"name": "Dashboard", "description": "Painel principal"},
    {"name": "Projects", "description": "Lista de projetos"}
  ],
  "summary": {
    "totalScreens": 2,
    "complexity": "medium",
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
---DADOS_ESTRUTURADOS_FIM---`
          }
        }]
      }

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      })

      const result = await aiGenerator.generateProposal(
        mockProjectData,
        [],
        []
      )

      expect(result.success).toBe(true)
      expect(result.type).toBe('proposal')
      expect(result.proposal).toContain('Sistema de Gestão de Projetos')
      expect(result.analysisData.screens).toHaveLength(2)
      expect(result.metadata.totalScreens).toBe(2)
    })

    test('handles API rate limiting with retry', async () => {
      // First call returns 429, second succeeds
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: () => Promise.resolve('Rate limit exceeded')
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: '---TELAS_E_COMPONENTES_INICIO---\nTest content\n---TELAS_E_COMPONENTES_FIM---'
              }
            }]
          })
        })

      const result = await aiGenerator.generateProposal(
        mockProjectData,
        [],
        []
      )

      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
    })

    test('falls back to mock after multiple API failures', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      const result = await aiGenerator.generateProposal(
        mockProjectData,
        [],
        []
      )

      expect(result.success).toBe(true)
      expect(result.metadata.isSimulation).toBe(true)
      expect(result.proposal).toContain('ANÁLISE COMPLETA DE TELAS')
    })

    test('handles empty API response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: { content: '' }
          }]
        })
      })

      const result = await aiGenerator.generateProposal(
        mockProjectData,
        [],
        []
      )

      // Should fall back to mock generation
      expect(result.success).toBe(true)
      expect(result.metadata.isSimulation).toBe(true)
    })

    test('validates required project data', async () => {
      const invalidProjectData = {
        description: '', // Empty description
        projectComplexity: 'medium'
      }

      const result = await aiGenerator.generateProposal(
        invalidProjectData,
        [],
        []
      )

      // Should still work but use fallback
      expect(result.success).toBe(true)
    })
  })


  describe('Mock Generation (Fallback)', () => {
    test('generates mock proposal with correct structure', async () => {
      const result = await aiGenerator.mockProposalGeneration(mockProjectData)

      expect(result.success).toBe(true)
      expect(result.type).toBe('proposal')
      expect(result.proposal).toContain('ANÁLISE COMPLETA DE TELAS')
      expect(result.analysisData.screens).toBeInstanceOf(Array)
      expect(result.metadata.totalFunctionPoints).toBeGreaterThan(0)
    })

    test('respects project complexity in mock generation', async () => {
      const simpleProject = { ...mockProjectData, projectComplexity: 'simple' }
      const complexProject = { ...mockProjectData, projectComplexity: 'complex' }

      const simpleResult = await aiGenerator.mockProposalGeneration(simpleProject)
      const complexResult = await aiGenerator.mockProposalGeneration(complexProject)

      expect(complexResult.metadata.totalFunctionPoints)
        .toBeGreaterThan(simpleResult.metadata.totalFunctionPoints)
    })
  })

  describe('Error Handling', () => {
    test('handles network timeouts gracefully', async () => {
      global.fetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )

      const result = await aiGenerator.generateProposal(
        mockProjectData,
        [],
        []
      )

      expect(result.success).toBe(true)
      expect(result.metadata.isSimulation).toBe(true)
    })

    test('logs detailed error information', async () => {
      const networkError = new Error('Connection failed')
      networkError.code = 'NETWORK_ERROR'

      global.fetch.mockRejectedValue(networkError)

      await aiGenerator.generateProposal(mockProjectData, [], [])

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao gerar proposta com IA')
      )
    })
  })
})