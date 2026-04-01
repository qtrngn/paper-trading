import type { ReactNode } from "react";
import { useStockSnapshot } from "@/hooks/useStockSnapshot";
import { formatPrice, formatVolume } from "@/lib/formatters";

type OverviewField = {
  label: string;
  value?: ReactNode;
};

type OverviewSectionProps = {
  symbol: string | null;
  dividends?: OverviewField[];
  financials?: OverviewField[];
  description?: string | null;
};


const defaultDividends: OverviewField[] = [{ label: "Frequency" }, { label: "12-month yield" }, { label: "Ex-dividend date" }];

const defaultFinancials: OverviewField[] = [{ label: "Market cap" }, { label: "Shares outstanding" }, { label: "P/E ratio" }];


// STYLE COMPONENTS
function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-3xl font-bold text-white">{children}</h2>;
}

function FieldItem({ label, value }: OverviewField) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-zinc-400">{label}</p>
      <p className="text-lg text-white">{value ?? "--"}</p>
    </div>
  );
}

function MarketDetailsGrid({ columns }: { columns: OverviewField[][] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="space-y-5">
          {column.map((item) => (
            <FieldItem key={item.label} {...item} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SimpleGrid({ items }: { items: OverviewField[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <FieldItem key={item.label} {...item} />
      ))}
    </div>
  );
}

export default function OverviewSection({
  symbol,
  dividends = defaultDividends,
  financials = defaultFinancials,
  description,
}: OverviewSectionProps) {

  const { snapshot } = useStockSnapshot(symbol);

const resolvedMarketDetails: OverviewField[][] = [
  [
    { label: "Open", value: snapshot?.open != null ? formatPrice(snapshot.open) : undefined },
    { label: "High", value: snapshot?.high != null ? formatPrice(snapshot.high) : undefined },
  ],
  [
    { label: "Bid", value: snapshot?.bid != null ? formatPrice(snapshot.bid) : undefined },
    { label: "Low", value: snapshot?.low != null ? formatPrice(snapshot.low) : undefined },
  ],
  [
    { label: "Ask", value: snapshot?.ask != null ? formatPrice(snapshot.ask) : undefined },
    { label: "Volume", value: snapshot?.volume != null ? formatVolume(snapshot.volume) : undefined },
  ],
  [
    { label: "Last sale", value: snapshot?.lastSale != null ? formatPrice(snapshot.lastSale) : undefined },
  ],
];

  return (
    <div className="mt-10 space-y-12 font-bold">
      <section className="space-y-6">
        <SectionTitle>Market details</SectionTitle>
        <MarketDetailsGrid columns={resolvedMarketDetails} />
      </section>

      <section className="space-y-6">
        <SectionTitle>Dividends</SectionTitle>
        <SimpleGrid items={dividends} />
      </section>

      <section className="space-y-6">
        <SectionTitle>Financials</SectionTitle>
        <SimpleGrid items={financials} />
      </section>

      <section className="space-y-6">
        <SectionTitle>About {symbol ?? "Company"}</SectionTitle>
        <p className="max-w-6xl text-base leading-8 text-zinc-300">{description ?? "Company description will go here."}</p>
      </section>
    </div>
  );
}
