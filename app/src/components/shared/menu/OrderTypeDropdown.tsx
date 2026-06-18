import { useState } from "react";

// UI COMPONENTS
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { ChevronDown, ChevronUp } from "lucide-react";

// TYPES
import type { OrderSide, OrderType } from "@/features/trading/types.ts";

type OrderTypeDropdownProps = {
  side: OrderSide;
  orderType: OrderType;
  onOrderTypeChange: (nextOrderType: OrderType) => void;
};

export default function OrderTypeDropdown({ side, orderType, onOrderTypeChange }: OrderTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = orderType === "market" ? `Market ${side}` : `Limit ${side}`;

  // HANDLERS
  function handleValueChange(value: string) {
    if (value === "market" || value === "limit") {
      onOrderTypeChange(value);
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex justify-between">
          {selectedLabel} {isOpen ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={orderType} onValueChange={handleValueChange}>
          <DropdownMenuRadioItem value="market">Market {side}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="limit">Limit {side}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
