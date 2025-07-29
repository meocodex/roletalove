/**
 * Gráficos Interativos Avançados
 * Visualizações em tempo real para análise de padrões
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";
import type { RouletteResult } from "../../../shared/schema";

interface AdvancedChartsProps {
  className?: string;
}

export default function AdvancedCharts({ className }: AdvancedChartsProps) {
  const { data: results = [] } = useQuery<RouletteResult[]>({
    queryKey: ['/api/results'],
    refetchInterval: 1000,
  });

  if (results.length < 10) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Gráfica Avançada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aguardando dados para gráficos</p>
            <p className="text-sm">Mínimo 10 resultados necessários</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para diferentes visualizações
  const frequencyData = prepareFrequencyData(results);
  const trendData = prepareTrendData(results);
  const heatmapData = prepareHeatmapData(results);
  const sectorData = prepareSectorData(results);
  const streakData = prepareStreakData(results);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Análise Gráfica Avançada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frequency" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="frequency">Frequência</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="sectors">Setores</TabsTrigger>
            <TabsTrigger value="streaks">Sequências</TabsTrigger>
          </TabsList>

          {/* Gráfico de Frequência */}
          <TabsContent value="frequency" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="number" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Aparições']}
                    labelFormatter={(label) => `Número ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8884d8"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-green-500">
                  {frequencyData.reduce((max, curr) => curr.count > max ? curr.count : max, 0)}
                </div>
                <div className="text-muted-foreground">Max Aparições</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-500">
                  {(frequencyData.reduce((sum, curr) => sum + curr.count, 0) / frequencyData.length).toFixed(1)}
                </div>
                <div className="text-muted-foreground">Média</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-500">
                  {frequencyData.filter(d => d.count === 0).length}
                </div>
                <div className="text-muted-foreground">Não Saíram</div>
              </div>
            </div>
          </TabsContent>

          {/* Gráfico de Tendências */}
          <TabsContent value="trends" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Resultado ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="number" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="movingAvg" 
                    stroke="#82ca9d" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Números Sorteados</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded border-dashed border-2"></div>
                <span>Média Móvel</span>
              </div>
            </div>
          </TabsContent>

          {/* Análise de Setores */}
          <TabsContent value="sectors" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={sectorData}>
                  <RadialBar 
                    dataKey="percentage" 
                    cornerRadius={10} 
                    fill="#8884d8"
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Frequência']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {sectorData.map((sector, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>{sector.name}</span>
                  <Badge variant="outline">{sector.percentage}%</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Análise de Sequências */}
          <TabsContent value="streaks" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Sequência Máxima']}
                  />
                  <Bar 
                    dataKey="maxStreak" 
                    fill="#ff7300"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {streakData.map((streak, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{streak.type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{streak.maxStreak}</Badge>
                    <span className="text-xs text-muted-foreground">
                      (atual: {streak.currentStreak})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Funções utilitárias para preparar dados

function prepareFrequencyData(results: RouletteResult[]) {
  const counts = new Array(37).fill(0);
  results.forEach(result => {
    counts[result.number]++;
  });
  
  return counts.map((count, number) => ({
    number,
    count,
    isHot: count > (results.length / 37) * 1.2,
    isCold: count < (results.length / 37) * 0.8
  }));
}

function prepareTrendData(results: RouletteResult[]) {
  return results.slice(-20).map((result, index) => {
    const recent = results.slice(Math.max(0, results.length - 20 + index - 4), results.length - 20 + index + 1);
    const movingAvg = recent.reduce((sum, r) => sum + r.number, 0) / recent.length;
    
    return {
      index: index + 1,
      number: result.number,
      movingAvg: Math.round(movingAvg * 10) / 10
    };
  });
}

function prepareHeatmapData(results: RouletteResult[]) {
  const grid = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 12; col++) {
      const number = row * 12 + col + 1;
      const count = results.filter(r => r.number === number).length;
      grid.push({
        row,
        col,
        number,
        count,
        intensity: count / Math.max(1, results.length / 37)
      });
    }
  }
  return grid;
}

function prepareSectorData(results: RouletteResult[]) {
  const sectors = {
    'Zero': [0],
    'Orphelins': [1, 6, 9, 14, 17, 20, 31, 34],
    'Tiers': [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36],
    'Voisins': [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]
  };
  
  return Object.entries(sectors).map(([name, numbers]) => {
    const count = results.filter(r => numbers.includes(r.number)).length;
    const percentage = Math.round((count / results.length) * 100);
    
    return {
      name,
      count,
      percentage,
      expected: Math.round((numbers.length / 37) * 100)
    };
  });
}

function prepareStreakData(results: RouletteResult[]) {
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  
  const streaks = [
    { type: 'Vermelho', check: (n: number) => redNumbers.includes(n) },
    { type: 'Preto', check: (n: number) => !redNumbers.includes(n) && n !== 0 },
    { type: 'Par', check: (n: number) => n > 0 && n % 2 === 0 },
    { type: 'Ímpar', check: (n: number) => n > 0 && n % 2 === 1 }
  ];
  
  return streaks.map(({ type, check }) => {
    let maxStreak = 0;
    let currentStreak = 0;
    let lastStreak = 0;
    
    results.forEach(result => {
      if (check(result.number)) {
        currentStreak++;
        lastStreak = currentStreak;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 0;
      }
    });
    
    maxStreak = Math.max(maxStreak, currentStreak);
    
    return {
      type,
      maxStreak,
      currentStreak: lastStreak
    };
  });
}