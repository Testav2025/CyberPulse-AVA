import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number | string;
    label: string;
    positive?: boolean;
  };
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  isLoading,
  onClick,
  className = ""
}: StatCardProps) {
  const isInteractive = !!onClick;
  
  const content = (
    <Card 
      className={`h-full overflow-hidden transition-all duration-200 ${isInteractive ? 'hover:border-primary/50 hover-elevate cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground/70 bg-muted/50 p-2 rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            {description && <Skeleton className="h-4 w-32" />}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            
            {(description || trend) && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {trend && (
                  <span className={`mr-2 font-medium flex items-center ${
                    trend.positive === true ? 'text-emerald-500' : 
                    trend.positive === false ? 'text-red-500' : 
                    'text-amber-500'
                  }`}>
                    {trend.value}
                  </span>
                )}
                {description}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isInteractive) return content;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      className="h-full"
    >
      {content}
    </motion.div>
  );
}
