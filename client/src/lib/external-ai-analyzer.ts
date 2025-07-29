import { RouletteResult } from '@/../../shared/schema';

export interface ExternalAIInsight {
  provider: 'openai' | 'anthropic';
  analysis: string;
  recommendations: number[];
  confidence: number;
  reasoning: string;
  patterns_detected: string[];
  next_probable_numbers: Array<{
    number: number;
    probability: number;
    reasoning: string;
  }>;
}

export class ExternalAIAnalyzer {
  private static async callOpenAI(results: RouletteResult[]): Promise<ExternalAIInsight | null> {
    try {
      const sequence = results.slice(-20).map(r => r.number).join(', ');
      const response = await fetch('/api/ai-analysis/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence, results: results.slice(-20) })
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  private static async callClaude(results: RouletteResult[]): Promise<ExternalAIInsight | null> {
    try {
      const sequence = results.slice(-20).map(r => r.number).join(', ');
      const response = await fetch('/api/ai-analysis/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence, results: results.slice(-20) })
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Claude API error:', error);
      return null;
    }
  }

  public static async analyzeWithExternalAI(results: RouletteResult[]): Promise<ExternalAIInsight[]> {
    if (results.length < 15) return [];

    try {
      // Chamar ambas as APIs em paralelo
      const [openaiResult, claudeResult] = await Promise.allSettled([
        this.callOpenAI(results),
        this.callClaude(results)
      ]);

      const insights: ExternalAIInsight[] = [];

      if (openaiResult.status === 'fulfilled' && openaiResult.value) {
        insights.push(openaiResult.value);
      }

      if (claudeResult.status === 'fulfilled' && claudeResult.value) {
        insights.push(claudeResult.value);
      }

      return insights;
    } catch (error) {
      console.error('External AI analysis error:', error);
      return [];
    }
  }

  public static combineInsights(insights: ExternalAIInsight[]): {
    consensusNumbers: number[];
    conflictingViews: Array<{ number: number; providers: string[]; confidence: number }>;
    averageConfidence: number;
    combinedRecommendations: Array<{ number: number; votes: number; avgConfidence: number }>;
  } {
    if (insights.length === 0) {
      return {
        consensusNumbers: [],
        conflictingViews: [],
        averageConfidence: 0,
        combinedRecommendations: []
      };
    }

    // Combinar recomendações
    const numberVotes = new Map<number, { votes: number; totalConfidence: number; providers: string[] }>();

    insights.forEach(insight => {
      insight.recommendations.forEach(num => {
        if (!numberVotes.has(num)) {
          numberVotes.set(num, { votes: 0, totalConfidence: 0, providers: [] });
        }
        const current = numberVotes.get(num)!;
        current.votes++;
        current.totalConfidence += insight.confidence;
        current.providers.push(insight.provider);
      });
    });

    // Números com consenso (mais de 1 voto)
    const consensusNumbers = Array.from(numberVotes.entries())
      .filter(([_, data]) => data.votes > 1)
      .map(([number]) => number)
      .sort();

    // Recomendações combinadas
    const combinedRecommendations = Array.from(numberVotes.entries())
      .map(([number, data]) => ({
        number,
        votes: data.votes,
        avgConfidence: data.totalConfidence / data.votes
      }))
      .sort((a, b) => b.votes - a.votes || b.avgConfidence - a.avgConfidence)
      .slice(0, 10);

    // Confiança média
    const averageConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;

    return {
      consensusNumbers,
      conflictingViews: [], // Implementar se necessário
      averageConfidence,
      combinedRecommendations
    };
  }
}