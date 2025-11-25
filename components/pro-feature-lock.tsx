"use client";

import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradePlanDialog } from "@/components/upgrade-plan-dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ProFeatureLockProps {
  title?: string;
  description: string;
  variant?: "card" | "overlay" | "inline" | "detailed";
  className?: string;
  minHeight?: string;
  showButton?: boolean;
  buttonText?: string;
  features?: Array<{ icon?: ReactNode; text: string }>;
}

export function ProFeatureLock({
  title = "Pro Feature",
  description,
  variant = "card",
  className,
  minHeight = "200px",
  showButton = true,
  buttonText = "Upgrade to Pro",
  features,
}: ProFeatureLockProps) {
  const lockIcon = (
    <div className="flex justify-center">
      <div className="rounded-full bg-muted p-4 border-2 border-dashed">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
    </div>
  );

  // Detailed variant - for canvas page style with features list
  if (variant === "detailed") {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className={cn("max-w-md border-border/50 shadow-2xl", className)}>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
            <CardDescription className="text-base">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features && features.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">What you'll get:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.icon || <span className="text-primary mt-0.5">✦</span>}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showButton && (
              <UpgradePlanDialog
                trigger={<Button className="w-full" size="lg">{buttonText}</Button>}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = (
    <div className="text-center space-y-4">
      {lockIcon}
      <div className="space-y-2">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      </div>
      {showButton && (
        <UpgradePlanDialog
          trigger={<Button className="mt-2">{buttonText}</Button>}
        />
      )}
    </div>
  );

  // Overlay variant - for overlaying on existing content
  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "absolute inset-0 bg-background/60 backdrop-blur-sm rounded-md flex items-center justify-center z-10",
          className
        )}
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            transparent,
            transparent 15px,
            rgba(0, 0, 0, 0.03) 15px,
            rgba(0, 0, 0, 0.03) 17px
          )`,
        }}
      >
        <div className="text-center space-y-2">
          <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
          <UpgradePlanDialog
            trigger={
              <button className="text-xs font-medium hover:underline underline-offset-4">
                Upgrade to unlock
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // Inline variant - minimal, no card wrapper, shows description
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "bg-background/60 backdrop-blur-sm rounded-md flex items-center justify-center",
          className
        )}
        style={{
          minHeight,
          backgroundImage: `repeating-linear-gradient(
            135deg,
            transparent,
            transparent 15px,
            rgba(0, 0, 0, 0.03) 15px,
            rgba(0, 0, 0, 0.03) 17px
          )`,
        }}
      >
        <div className="text-center space-y-3 px-4">
          <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
          {description && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {description}
            </p>
          )}
          {showButton && (
            <UpgradePlanDialog
              trigger={
                <button className="text-xs font-medium hover:underline underline-offset-4">
                  Upgrade to unlock
                </button>
              }
            />
          )}
        </div>
      </div>
    );
  }

  // Card variant - default, with card wrapper
  return (
    <Card
      className={cn(
        "border-2 border-dashed bg-gradient-to-br from-muted/50 to-muted/30",
        className
      )}
    >
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  );
}

