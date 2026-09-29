import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonRangesProps = {
  value: string;
  onChange: (nextRange: string) => void;
  options?: readonly string[];
};

const DEFAULT_RANGES = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"] as const;

export default function ButtonRanges({
  value,
  onChange,
  options = DEFAULT_RANGES,
}: ButtonRangesProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {options.map((range) => {
        const isActive = range === value;

        return (
          <Button
            key={range}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(range)}
            className={cn(
              "range-button",
              isActive && "range-button-active"
            )}
          >
            {range}
          </Button>
        );
      })}
    </div>
  );
}
