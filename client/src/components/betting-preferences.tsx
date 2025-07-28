import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings2, Target, Grid3X3, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface BettingPreference {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  description: string;
  icon: React.ReactNode;
}

interface BettingPreferencesProps {
  className?: string;
}

export function BettingPreferences({ className }: BettingPreferencesProps) {
  const queryClient = useQueryClient();
  
  const { data: preferences = [], isLoading } = useQuery<BettingPreference[]>({
    queryKey: ['/api/betting-preferences'],
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiRequest('PUT', `/api/betting-preferences/${id}`, { enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/betting-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
    }
  });

  const handleToggle = (id: string, enabled: boolean) => {
    updatePreferenceMutation.mutate({ id, enabled });
  };

  const getPreferenceIcon = (type: string) => {
    switch (type) {
      case 'straight_up':
        return <Target className="text-blue-400" size={16} />;
      case 'neighbors':
        return <Users className="text-purple-400" size={16} />;
      case 'dozens':
        return <Grid3X3 className="text-green-400" size={16} />;
      case 'columns':
        return <Grid3X3 className="text-yellow-400" size={16} />;
      case 'colors':
        return <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-black"></div>;
      default:
        return <Settings2 className="text-gray-400" size={16} />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings2 className="text-casino-gold mr-2" size={20} />
            Preferências de Apostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <div className="w-24 h-4 bg-gray-600 rounded"></div>
                </div>
                <div className="w-10 h-5 bg-gray-600 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Settings2 className="text-casino-gold mr-2" size={20} />
          Preferências de Apostas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {preferences.map((preference) => (
            <div
              key={preference.id}
              className={`flex items-center justify-between p-3 border rounded transition-all ${
                preference.enabled 
                  ? 'bg-green-900/20 border-green-600/50' 
                  : 'bg-gray-900/30 border-gray-600/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getPreferenceIcon(preference.type)}
                <div>
                  <Label className="text-sm font-medium cursor-pointer">
                    {preference.name}
                  </Label>
                  <p className="text-xs text-gray-400 mt-1">
                    {preference.description}
                  </p>
                </div>
              </div>
              
              <Switch
                checked={preference.enabled}
                onCheckedChange={(enabled) => handleToggle(preference.id, enabled)}
                disabled={updatePreferenceMutation.isPending}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/50 rounded">
          <p className="text-xs text-blue-300">
            💡 As estratégias serão automaticamente ajustadas baseadas nas suas preferências ativas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}