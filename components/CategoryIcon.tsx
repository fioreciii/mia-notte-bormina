import {
  Baby,
  Drama,
  Music2,
  Palette,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
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
  return (
    <span
      className="category-icon"
      style={{ "--category-color": categoryMeta[category].color } as React.CSSProperties}
      aria-hidden="true"
    >
      <Icon size={size} strokeWidth={1.9} />
    </span>
  );
}
