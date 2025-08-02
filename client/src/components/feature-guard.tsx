interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGuard({ feature, children, showUpgrade = true }: FeatureGuardProps) {
  // Demo mode - sempre mostrar todas as features
  return <>{children}</>;
}