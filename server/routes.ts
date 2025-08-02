import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRouletteResultSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";
import { AIServices } from "./ai-services";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.post('/api/results', async (req, res) => {
    try {
      const body = insertRouletteResultSchema.parse(req.body);
      const result = await storage.addResult(body);
      res.json(result);
    } catch (error) {
      console.error('Error adding result:', error);
      res.status(400).json({ error: 'Invalid result data' });
    }
  });

  app.get('/api/results', async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });

  // Simplified patterns endpoint - client does analysis
  app.get('/api/patterns', async (req, res) => {
    try {
      const patterns = await storage.getPatterns();
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      res.status(500).json({ error: 'Failed to fetch patterns' });
    }
  });

  app.get('/api/strategies', async (req, res) => {
    try {
      const strategies = await storage.getStrategies();
      res.json(strategies);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      res.status(500).json({ error: 'Failed to fetch strategies' });
    }
  });

  app.put('/api/strategies/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const strategy = await storage.updateStrategy(id, updates);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      res.json(strategy);
    } catch (error) {
      console.error('Error updating strategy:', error);
      res.status(500).json({ error: 'Failed to update strategy' });
    }
  });

  app.get('/api/alerts', async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.post('/api/alerts', async (req, res) => {
    try {
      const body = insertAlertSchema.parse(req.body);
      const alert = await storage.addAlert(body);
      res.json(alert);
    } catch (error) {
      console.error('Error adding alert:', error);
      res.status(400).json({ error: 'Invalid alert data' });
    }
  });

  app.get('/api/session/stats', async (req, res) => {
    try {
      const session = await storage.getCurrentSession();
      const results = await storage.getResults();
      const patterns = await storage.getPatterns();
      
      const stats = {
        session: session || {
          id: 'default',
          name: 'Sessão Principal',
          startTime: new Date(),
          endTime: null,
          totalSpins: 0,
          patternsDetected: 0,
          successRate: 0,
          isActive: true
        },
        totalSpins: results.length,
        patternsDetected: patterns.length,
        lastZero: results.find(r => r.number === 0)?.timestamp || null,
        colorDistribution: results.reduce((acc: any, result) => {
          acc[result.color] = (acc[result.color] || 0) + 1;
          return acc;
        }, {}),
        successRate: patterns.length > 0 ? Math.round((patterns.length / results.length) * 100) : 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching session stats:', error);
      res.status(500).json({ error: 'Failed to fetch session stats' });
    }
  });

  app.get('/api/betting-preferences', async (req, res) => {
    try {
      const preferences = await storage.getBettingPreferences();
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching betting preferences:', error);
      res.status(500).json({ error: 'Failed to fetch betting preferences' });
    }
  });

  app.put('/api/betting-preferences/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const preference = await storage.updateBettingPreference(id, updates);
      
      if (!preference) {
        return res.status(404).json({ error: 'Betting preference not found' });
      }
      
      res.json(preference);
    } catch (error) {
      console.error('Error updating betting preference:', error);
      res.status(500).json({ error: 'Failed to update betting preference' });
    }
  });

  // AI Analysis endpoints
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { results, provider = 'openai' } = req.body;
      
      if (!results || !Array.isArray(results)) {
        return res.status(400).json({ error: 'Results array is required' });
      }

      if (results.length < 15) {
        return res.status(400).json({ error: 'Minimum 15 results required for AI analysis' });
      }

      let analysis;
      if (provider === 'anthropic') {
        analysis = await AIServices.analyzeWithClaude(results);
      } else {
        analysis = await AIServices.analyzeWithOpenAI(results);
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error in AI analysis:', error);
      res.status(500).json({ error: 'AI analysis failed', details: error.message });
    }
  });

  // WebSocket server
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);

        // Handle different message types
        switch (message.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          
          case 'subscribe':
            // Handle subscription logic
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              channel: message.channel 
            }));
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'welcome', 
        message: 'Connected to Roulette Analysis System' 
      }));
    }
  });

  return httpServer;
}