import type { ChartPoint } from "./types"

export type ChartSummary = {
  firstPoint: ChartPoint
  latestPoint: ChartPoint
  baselinePrice: number // the price the change is measured from
  latestPrice: number
  absoluteChange: number
  percentChange: number
  isPositive: boolean
  isNegative: boolean
  isFlat: boolean
}

export type DisplayChartSummary = {
  displayPrice: number
  absoluteChange: number
  percentChange: number
  isPositive: boolean
  isNegative: boolean
  isFlat: boolean
}

// baseline: what the change is measured against. Defaults to the first point;
// a 1D chart passes the previous close instead.
export function getChartSummary(points: ChartPoint[], baseline: number | null = null): ChartSummary {
  const firstPoint = points[0]
  const latestPoint = points[points.length - 1]
  const baselinePrice = baseline ?? firstPoint.price

  const latestPrice = latestPoint.price
  const absoluteChange = latestPoint.price - baselinePrice
  const percentChange = baselinePrice === 0 ? 0 : (absoluteChange / baselinePrice) * 100

  const isPositive = absoluteChange > 0
  const isNegative = absoluteChange < 0
  const isFlat = absoluteChange === 0

  return {
    firstPoint,
    latestPoint,
    baselinePrice,
    latestPrice,
    absoluteChange,
    percentChange,
    isPositive,
    isNegative,
    isFlat,
  }
}

export function getDisplayChartSummary(summary: ChartSummary, hoveredPoint: ChartPoint | null): DisplayChartSummary {

  const displayPrice = hoveredPoint ? hoveredPoint.price : summary.latestPrice
  const absoluteChange = displayPrice - summary.baselinePrice
  const percentChange = summary.baselinePrice === 0 ? 0 : (absoluteChange / summary.baselinePrice) * 100
  const isPositive = absoluteChange > 0
  const isNegative = absoluteChange < 0
  const isFlat = absoluteChange === 0

  return {
    displayPrice,
    absoluteChange,
    percentChange,
    isPositive,
    isNegative,
    isFlat,
  }
}