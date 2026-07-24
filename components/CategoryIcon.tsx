"use client";

import {
  Baby,
  Drama,
  Music2,
  Palette,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { Category, categoryMeta } from "@/lib/events";

const icons = {
  food: UtensilsCrossed,
  music: Music2,
  show: Drama,
  kids: Baby,
  culture: Palette,
  shopping: ShoppingBag,
};

export function CategoryIcon({
  category,
  size = 18,
}: {
  category: Category;
  size?: number;
}) {
  const Icon = icons[category];
  const [assetFailed, setAssetFailed] = useState(false);

  return (
    <span
      className="category-icon"
      style={{ "--category-color": categoryMeta[category].color } as React.CSSProperties}
      aria-hidden="true"
    >
      {assetFailed ? (
        <Icon size={size} strokeWidth={1.9} />
      ) : (
        // These small authored SVGs are served directly so their palette remains intact.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={categoryMeta[category].asset}
          alt=""
          width={size}
          height={size}
          onError={() => setAssetFailed(true)}
        />
      )}
    </span>
  );
}
