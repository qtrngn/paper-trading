/* 
1. Receive the current stock symbol 
2. Collect user trade input
3. Build submit order request
4. Call submitOrder()
5. Show feedback
*/

import { useState } from "react";

// UI components
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, ArrowLeft, MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import OrderTypeDropdown from "@/components/shared/menu/OrderTypeDropdown";

// Types
import type { OrderSide, OrderType } from "@/features/trading/types.ts";

type TradeTicketProps = {
  symbol: string;
  bidPrice: number | null;
  askPrice: number | null;
};

type tradeUnit = "shares" | "dollars";

// STYLES
const tradeFormRowClass = "grid grid-cols-[1fr_1.4fr] items-center gap-4";
const tradeLabelClass = "text-sm font-normal text-text-secondary";
const reviewOrderRowClass = "flex items-center justify-between align-item-center border-b border-border-soft py-4";

export default function TradeTicket({ symbol, bidPrice, askPrice }: TradeTicketProps) {
  // STATES
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [tradeUnit, setTradeUnit] = useState<tradeUnit>("shares");
  const [isReviewing, setIsReviewing] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
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

  // Limit suggested price
  function handleOrderTypeChange(nextOrderType: OrderType): void {
    setOrderType(nextOrderType);

    if (nextOrderType !== "limit") return;

    setTradeUnit("shares");
    setQuantity("");

    if (limitPrice.trim() !== "") return;

    const suggestedPrice = side === "buy" ? askPrice : bidPrice;

    if (suggestedPrice === null || !Number.isFinite(suggestedPrice) || suggestedPrice <= 0) {
      return;
    }

    setLimitPrice(String(suggestedPrice));
  }

  // Trade unit change
  function handleTradeUnitChange(): void {
    setTradeUnit((currentUnit) => (currentUnit === "shares" ? "dollars" : "shares"));
    setQuantity("");
  }

  // Limit price step
  function handleLimitPriceStep(step: number): void {
    const currentPrice = Number(limitPrice);
    const safeCurrentPrice = Number.isFinite(currentPrice) ? currentPrice : 0;
    const nextPrice = Math.max(0, safeCurrentPrice + step);

    setLimitPrice(nextPrice.toFixed(2));
  }

  // Limit price change
  function handleLimitPriceChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const currentInput = event.target.value;
    const limitPricePattern = /^\d*\.?\d*$/;

    if (limitPricePattern.test(currentInput)) {
      setLimitPrice(currentInput);
    }
  }

  // COMPUTE / DERIVED VALUE
  const requiredQuote = side === "buy" ? askPrice : bidPrice;
  const isQuoteAvailable = requiredQuote !== null && Number.isFinite(requiredQuote) && requiredQuote > 0;

  const quantityNumber = Number(quantity);
  const isQuantityValid = quantity.trim() !== "" && Number.isFinite(quantityNumber) && quantityNumber > 0;

  const limitPriceNumber = Number(limitPrice);
  const isLimitPriceValid = limitPrice.trim() !== "" && Number.isFinite(limitPriceNumber) && limitPriceNumber > 0;

  const isNextDisabled = !isQuantityValid || (orderType === "market" && !isQuoteAvailable) || (orderType === "limit" && !isLimitPriceValid);

  const estimatedPrice = orderType === "market" ? requiredQuote : limitPriceNumber;
  const isEstimatedPriceValid = estimatedPrice !== null && Number.isFinite(estimatedPrice) && estimatedPrice > 0;

  const estimatedCost = isQuantityValid && isEstimatedPriceValid ? quantityNumber * estimatedPrice : 0;
  const estimatedShares = isQuantityValid && isEstimatedPriceValid ? quantityNumber / estimatedPrice : 0;

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
                  <OrderTypeDropdown side={side} orderType={orderType} onOrderTypeChange={handleOrderTypeChange} />
                </div>

                {/* RENDER MARKET, LIMIT CONDITION */}
                {/* market */}
                {orderType === "market" ? (
                  <div className={tradeFormRowClass}>
                    <span className={tradeLabelClass}>Buy in</span>
                    <Button type="button" variant="outline" className="flex justify-between" onClick={handleTradeUnitChange}>
                      {tradeUnit === "shares" ? "Shares" : "Dollars"}
                      <ArrowDownUp size={14} />
                    </Button>
                  </div>
                ) : (
                  // limit
                  <Field className={tradeFormRowClass}>
                    <FieldLabel htmlFor="limit" className={tradeLabelClass}>
                      Limit price
                    </FieldLabel>

                    <div className="trade-input-wrap">
                      <Input
                        id="limit"
                        type="text"
                        inputMode="decimal"
                        value={limitPrice}
                        onChange={handleLimitPriceChange}
                        className="trade-input"
                      />

                      <div className="flex h-9 w-10 flex-col overflow-hidden rounded-md">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          className="h-1/2 w-full rounded-none p-0 cursor-pointer"
                          onClick={() => handleLimitPriceStep(0.01)}
                        >
                          <PlusIcon className="size-3" />
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          className="h-1/2 w-full rounded-none border-t p-0 cursor-pointer"
                          onClick={() => handleLimitPriceStep(-0.01)}
                        >
                          <MinusIcon className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </Field>
                )}

                <Field className={tradeFormRowClass}>
                  <FieldLabel htmlFor="shares" className={tradeLabelClass}>
                    {tradeUnit === "shares" ? "Shares" : "Dollars"}
                  </FieldLabel>

                  <div className="flex items-center gap-2">
                    {tradeUnit === "dollars" ? <span className="text-sm text-text-secondary">$</span> : null}

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
                  </div>
                </Field>
              </div>

              {/* ESTIMATED COST SECTION / FOOTER */}
              <div className="mt-5 border-t border-white/10 pt-5">
                <dl className="flex items-center justify-between">
                  <dt className="label-text-strong">{tradeUnit === "shares" ? "Estimated cost" : "Estimated shares"}</dt>
                  <dd className="label-text-strong text-lg">
                    {tradeUnit === "shares" ? `$${estimatedCost.toFixed(2)} CAD` : isQuantityValid ? `${estimatedShares.toFixed(4)}` : "0"}
                  </dd>
                </dl>
              </div>
            </section>

            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

            {/* BUTTON */}
            <Button type="button" variant="muted" onClick={handleNext} disabled={isNextDisabled} className="h-14 w-full rounded-full">
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
            <Button variant="ghost" className="p-0! cursor-pointer" onClick={() => setIsReviewing(false)}>
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
                  <dt className="label-text-strong text-primary">{tradeUnit === "shares" ? "Shares" : "Dollars"}</dt>
                  <dd className="label-text-strong">{quantity}</dd>
                </div>
              </div>

              <div className={reviewOrderRowClass}>
                <dt className="label-text-strong text-primary">Account</dt>
                <dd className="label-text-strong">{symbol}</dd>
              </div>

              <div className={reviewOrderRowClass}>
                <dt className="label-text-strong text-primary">{tradeUnit === "shares" ? "Estimated cost" : "Estimated shares"}</dt>
                <dd className="label-text-strong">{tradeUnit === "shares" ? `$${estimatedCost.toFixed(2)} CAD` : estimatedShares.toFixed(4)}</dd>
              </div>
            </dl>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
