/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import type { ComponentType, ReactNode } from "react";

type FieldBlockProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
};

export function FieldBlock({ icon: Icon, label, children }: FieldBlockProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {children}
      </div>
    </div>
  );
}
