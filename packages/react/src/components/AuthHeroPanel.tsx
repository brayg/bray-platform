/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

export function AuthHeroPanel({ imageSrc }: { imageSrc: string }) {
  return (
    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-primary">
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
