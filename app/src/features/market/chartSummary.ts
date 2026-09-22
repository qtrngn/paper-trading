import type { ChartPoint } from "./types"

export type ChartSummary = {
  firstPoint: ChartPoint
  latestPoint: ChartPoint
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

export function getChartSummary(points: ChartPoint[]): ChartSummary {
  const firstPoint = points[0]
  const latestPoint = points[points.length - 1]

  const latestPrice = latestPoint.price
  const absoluteChange = latestPoint.price - firstPoint.price
  const percentChange = firstPoint.price === 0 ? 0 : (absoluteChange / firstPoint.price) * 100

  const isPositive = absoluteChange > 0
  const isNegative = absoluteChange < 0
  const isFlat = absoluteChange === 0

  return {
    firstPoint,
    latestPoint,
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
  const absoluteChange = displayPrice - summary.firstPoint.price
  const percentChange = summary.firstPoint.price === 0 ? 0 : (absoluteChange / summary.firstPoint.price) * 100
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