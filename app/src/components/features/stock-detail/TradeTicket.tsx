/* 
1. Receive the current stock symbol 
2. Collect user trade input
3. Build submit order request
4. Call submitOrder()
5. Show feedback
*/

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

// UI components
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
import type { OrderSide } from "@/features/trading/types.ts";

type TradeTicketProps = {
  symbol: string;
};

// STYLES
const tradeFormRowClass = "grid grid-cols-[1fr_1.4fr] items-center gap-4";
const tradeLabelClass = "text-sm font-normal text-text-secondary";
const reviewOrderRowClass = "flex items-center justify-between align-item-center border-b border-border-soft py-4";

export default function TradeTicket({ symbol }: TradeTicketProps) {
  // STATES
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // HANDLERS
  // next button click
  function handleNext() {

    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedQuantity = quantity.trim();
    const qtyNumber = Number(trimmedQuantity);

    if (!trimmedQuantity) {
      setErrorMessage("Please enter a quantity.");
      return;
    }

    if (Number.isNaN(qtyNumber) || qtyNumber <= 0) {
      setErrorMessage("Quantity must be greater than 0.");
      return;
    }
    setIsReviewing(true);
  }

  // Client quantity input
  function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
    const currentInput = event.target.value;
    const quantityPatten = /^\d*\.?\d*$/;

    if (quantityPatten.test(currentInput)) {
      setQuantity(currentInput);
    }
  }

  return (
    // TRADE CARD
    <Card className="app-card">
      <CardContent>
        {!isReviewing ? (
          <form className="space-y-4">
            <section className="trade-panel">
              <Tabs
                value={side}
                onValueChange={(value) => {
                  if (value === "buy" || value === "sell") setSide(value);
                }}
                className="w-full"
              >
                <TabsList variant="line" className="trade-tab-list">
                  <TabsTrigger value="buy" className="text-lg cursor-pointer">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="text-lg cursor-pointer">
                    Sell
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* TRADE CARD CONTENT */}
              <div className="trade-panel">
                <div className={tradeFormRowClass}>
                  <span className={tradeLabelClass}>Order type</span>
                  <button
                    type="button"
                    className="flex h-11 items-center justify-between rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white"
                  >
                    {side === "buy" ? "Market buy" : "Market sell"}
                    <span aria-hidden="true">⌄</span>
                  </button>
                </div>

                <div className={tradeFormRowClass}>
                  <span className={tradeLabelClass}>Buy in</span>
                  <button
                    type="button"
                    className="flex h-11 items-center justify-between rounded-xl border border-white/10 bg-black px-4 text-sm font-semibold text-white"
                  >
                    Shares
                    <span aria-hidden="true">⇅</span>
                  </button>
                </div>

                <Field className={tradeFormRowClass}>
                  <FieldLabel htmlFor="shares" className={tradeLabelClass}>
                    Shares
                  </FieldLabel>

                  <div className="trade-input-wrap">
                    <Input
                      id="shares"
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="trade-input"
                    />
                    <Button type="button" variant="secondary" size="xs" className="h-8 rounded-lg px-3 text-xs cursor-pointer">
                      Max
                    </Button>
                  </div>
                </Field>
              </div>

              {/* ESTIMATED COST SECTION */}
              <div className="mt-5 border-t border-white/10 pt-5">
                <dl className="flex items-center justify-between">
                  <dt className="label-text-strong">Estimated cost</dt>
                  <dd className="label-text-strong text-lg">$0.00 CAD</dd>
                </dl>
              </div>
            </section>

            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

            {/* BUTTON */}
            <Button variant="muted" onClick={handleNext} className="h-14 w-full rounded-full">
              Next
            </Button>

            {/* PAST ORDERS AVAILABLE */}
            <footer className="px-4 pb-3">
              <button type="button" className="flex w-full items-center justify-between text-left">
                <span>
                  <span className="block text-sm font-bold text-white">TFSA</span>
                  <span className="block text-sm text-white">$140.23 CAD</span>
                </span>

                <span aria-hidden="true" className="text-white">
                  ⌄
                </span>
              </button>
            </footer>
          </form>
        ) : (
          // REVIEW ORDER 
          <section className="trade-review-panel">

            {/* BACK BUTTON */}
            <Button variant="ghost" className="p-0! cursor-pointer"  onClick={() => setIsReviewing(false)}>
              <ArrowLeft />
              Back
            </Button>

            {/* REVIEW SECTION */}
            <header className="mb-6 mt-6">
              <h2 className="card-title">Review Order</h2>
            </header>

            <dl>
              <div>
                <div className={cn(reviewOrderRowClass, "border-b-0")}>
                  <dt className="label-text-strong text-primary">Order type</dt>
                  <dd className="label-text-strong">Market</dd>
                </div>

                <div className={cn(reviewOrderRowClass)}>
                  <dt className="label-text-strong text-primary">Shares</dt>
                  <dd className="label-text-strong">{quantity}</dd>
                </div>
              </div>

              <div className={reviewOrderRowClass}>
                <dt className="label-text-strong text-primary">Account</dt>
                <dd className="label-text-strong">{symbol}</dd>
              </div>
            </dl>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
