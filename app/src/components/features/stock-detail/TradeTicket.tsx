/* 
1. Receive the current stock symbol 
2. Collect user trade input
3. Build submit order request
4. Call submitOrder()
5. Show feedback
*/

import { useState } from "react";
import { Link } from "react-router-dom";

// UI components
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDownUp, ArrowLeft, MinusIcon, PlusIcon } from "lucide-react";

import OrderTypeDropdown from "@/components/features/stock-detail/OrderTypeDropdown";
import { useSubmitOrder, getSubmitOrderErrorMessage } from "@/hooks/useSubmitOrder";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatPrice } from "@/lib/formatters";

// Types
import type { Order, OrderSide, OrderType } from "@/features/trading/types.ts";

// One-line confirmation for a placed order
function describeOrder(order: Order): string {
  const action = order.side === "buy" ? "Bought" : "Sold";
  if (order.status === "filled" && order.fillPrice !== null) {
    return `${action} ${order.qty} ${order.symbol} at ${formatPrice(order.fillPrice)}`;
  }
  const limitText = order.limitPrice !== null ? ` at ${formatPrice(order.limitPrice)}` : "";
  return `Limit order placed: ${order.side} ${order.qty} ${order.symbol}${limitText}. It will fill when the price is reached.`;
}

type TradeTicketProps = {
  symbol: string;
  bidPrice: number | null;
  askPrice: number | null;
};

type tradeUnit = "shares" | "dollars";

export default function TradeTicket({ symbol, bidPrice, askPrice }: TradeTicketProps) {
  // STATES
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [tradeUnit, setTradeUnit] = useState<tradeUnit>("shares");
  const [isReviewing, setIsReviewing] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const submitOrderMutation = useSubmitOrder();

  // All of the user's holdings (same cached data as the Home page,
  // refreshed automatically after an order)
  const { portfolio, portfolioLoading } = usePortfolio();
  const positions = portfolio?.positions ?? [];

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

  // Place order button click (review screen)
  function handlePlaceOrder() {
    setErrorMessage(null);

    // The backend trades in shares. Dollar amounts are converted, rounded DOWN to
    // 4 decimals so the cost never ends up slightly above the amount entered.
    const qty = tradeUnit === "dollars" ? Math.floor(estimatedShares * 10_000) / 10_000 : quantityNumber;

    if (!Number.isFinite(qty) || qty <= 0) {
      setErrorMessage("Amount is too small to trade.");
      return;
    }

    submitOrderMutation.mutate(
      {
        symbol,
        side,
        qty,
        type: orderType,
        limitPrice: orderType === "limit" ? limitPriceNumber : null,
      },
      {
        onSuccess: (order) => {
          setSuccessMessage(describeOrder(order));
          setQuantity("");
          setIsReviewing(false);
        },
        onError: (error) => {
          setErrorMessage(getSubmitOrderErrorMessage(error));
        },
      },
    );
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
                  <TabsTrigger value="buy" className="trade-tab-trigger">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="trade-tab-trigger">
                    Sell
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* TRADE CARD CONTENT */}
              <div className="trade-panel">
                <div className="trade-form-row">
                  <span className="trade-label">Order type</span>
                  <OrderTypeDropdown side={side} orderType={orderType} onOrderTypeChange={handleOrderTypeChange} />
                </div>

                {/* RENDER MARKET, LIMIT CONDITION */}
                {/* market */}
                {orderType === "market" ? (
                  <div className="trade-form-row">
                    <span className="trade-label">Buy in</span>
                    <Button type="button" variant="outline" className="flex justify-between" onClick={handleTradeUnitChange}>
                      {tradeUnit === "shares" ? "Shares" : "Dollars"}
                      <ArrowDownUp size={14} />
                    </Button>
                  </div>
                ) : (
                  // limit
                  <Field className="trade-form-row">
                    <FieldLabel htmlFor="limit" className="trade-label">
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

                <Field className="trade-form-row">
                  <FieldLabel htmlFor="shares" className="trade-label">
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
              <div className="mt-5 border-t border-border-soft pt-5">
                <dl className="flex items-center justify-between">
                  <dt className="label-text-strong">{tradeUnit === "shares" ? "Estimated cost" : "Estimated shares"}</dt>
                  <dd className="label-text-strong text-lg">
                    {tradeUnit === "shares" ? `$${estimatedCost.toFixed(2)} USD` : isQuantityValid ? `${estimatedShares.toFixed(4)}` : "0"}
                  </dd>
                </dl>
              </div>
            </section>

            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
            {successMessage ? <p className="text-positive text-sm">{successMessage}</p> : null}

            {/* BUTTON */}
            <Button type="button" variant="muted" onClick={handleNext} disabled={isNextDisabled} className="h-14 w-full rounded-full">
              Next
            </Button>

            {/* ALL POSITIONS */}
            <footer className="positions-panel">
              <div className="positions-panel-header">
                <span className="label-text-strong">Positions</span>
                {positions.length > 0 ? <span className="caption-text">{positions.length}</span> : null}
              </div>

              {portfolioLoading ? (
                <p className="caption-text px-4 py-3">Loading...</p>
              ) : positions.length === 0 ? (
                <p className="caption-text px-4 py-3">No positions yet.</p>
              ) : (
                <TooltipProvider delayDuration={200}>
                  <ul>
                    {positions.map((position) => {
                      const returnPercent = position.unrealizedProfitLossPercent;
                      const returnClass =
                        returnPercent === null || returnPercent === 0
                          ? "text-neutral-status"
                          : returnPercent > 0
                            ? "text-positive"
                            : "text-negative";

                      return (
                        <li key={position.symbol}>
                          <Link
                            to={`/stocks/${position.symbol}`}
                            className={`position-row ${position.symbol === symbol ? "position-row-active" : ""}`}
                          >
                            <span className="min-w-0">
                              {/* Hovering the symbol shows the company name */}
                              {position.name ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="value-text-sm block w-fit">{position.symbol}</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">{position.name}</TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="value-text-sm block">{position.symbol}</span>
                              )}
                              <span className="caption-text block">
                                {position.quantity} {position.quantity === 1 ? "share" : "shares"}
                              </span>
                            </span>

                            <span className="shrink-0 text-right">
                              <span className="number-text block text-sm font-semibold">
                                {position.marketValue !== null ? formatPrice(position.marketValue) : "Unavailable"}
                              </span>
                              {returnPercent !== null ? (
                                <span className={`${returnClass} block text-xs`}>
                                  {returnPercent > 0 ? "+" : ""}
                                  {returnPercent.toFixed(2)}%
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </TooltipProvider>
              )}
            </footer>
          </form>
        ) : (
          // REVIEW ORDER
          <section className="trade-review-panel">
            {/* BACK BUTTON */}
            <Button
              variant="ghost"
              className="p-0! cursor-pointer"
              disabled={submitOrderMutation.isPending}
              onClick={() => {
                setErrorMessage(null);
                setIsReviewing(false);
              }}
            >
              <ArrowLeft />
              Back
            </Button>

            {/* REVIEW SECTION */}
            <header className="mb-6 mt-6">
              <h2 className="card-title">Review Order</h2>
            </header>

            <dl>
              <div>
                <div className="review-order-row border-b-0">
                  <dt className="label-text-strong text-primary">Order type</dt>
                  <dd className="label-text-strong">
                    {side === "buy" ? "Buy" : "Sell"} · {orderType === "market" ? "Market" : "Limit"}
                  </dd>
                </div>

                {orderType === "limit" ? (
                  <div className="review-order-row border-b-0">
                    <dt className="label-text-strong text-primary">Limit price</dt>
                    <dd className="label-text-strong">{formatPrice(limitPriceNumber)}</dd>
                  </div>
                ) : null}

                <div className="review-order-row">
                  <dt className="label-text-strong text-primary">{tradeUnit === "shares" ? "Shares" : "Dollars"}</dt>
                  <dd className="label-text-strong">{quantity}</dd>
                </div>
              </div>

              <div className="review-order-row">
                <dt className="label-text-strong text-primary">Symbol</dt>
                <dd className="label-text-strong">{symbol}</dd>
              </div>

              <div className="review-order-row">
                <dt className="label-text-strong text-primary">{tradeUnit === "shares" ? "Estimated cost" : "Estimated shares"}</dt>
                <dd className="label-text-strong">{tradeUnit === "shares" ? `$${estimatedCost.toFixed(2)} USD` : estimatedShares.toFixed(4)}</dd>
              </div>
            </dl>

            {errorMessage ? <p className="error-text mt-4">{errorMessage}</p> : null}

            {/* PLACE ORDER */}
            <Button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitOrderMutation.isPending}
              className="mt-6 h-14 w-full rounded-full"
            >
              {submitOrderMutation.isPending ? "Placing order..." : side === "buy" ? "Place buy order" : "Place sell order"}
            </Button>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
