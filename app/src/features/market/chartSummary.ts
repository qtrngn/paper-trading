import type { Bar } from "./types"

export type ChartSummary = {
  firstBar: Bar
  latestBar: Bar
  latestClose: number
  absoluteChange: number
  percentChange: number
  isPositive: boolean
  isNegative: boolean
  isFlat: boolean
}

export type HoveredChartPoint = {
  time: string
  close: number
}

export type DisplayChartSummary = {
  displayClose: number
  absoluteChange: number
  percentChange: number
  isPositive: boolean
  isNegative: boolean
  isFlat: boolean
}

export function getChartSummary(bars: Bar[]): ChartSummary {
  const firstBar = bars[0]
  const latestBar = bars[bars.length - 1]

  const latestClose = latestBar.c
  const absoluteChange = latestBar.c - firstBar.c
  const percentChange =
    firstBar.c === 0 ? 0 : (absoluteChange / firstBar.c) * 100

  const isPositive = absoluteChange > 0
  const isNegative = absoluteChange < 0
  const isFlat = absoluteChange === 0

  return {
    firstBar,
    latestBar,
    latestClose,
    absoluteChange,
    percentChange,
    isPositive,
    isNegative,
    isFlat,
  }
}

export function getDisplayChartSummary(
  summary: ChartSummary,
  hoveredBar: HoveredChartPoint | null
): DisplayChartSummary {
  const displayClose = hoveredBar ? hoveredBar.close : summary.latestClose

  const absoluteChange = displayClose - summary.firstBar.c
  const percentChange =
    summary.firstBar.c === 0 ? 0 : (absoluteChange / summary.firstBar.c) * 100

  const isPositive = absoluteChange > 0
  const isNegative = absoluteChange < 0
  const isFlat = absoluteChange === 0

  return {
    displayClose,
    absoluteChange,
    percentChange,
    isPositive,
    isNegative,
    isFlat,
  }
}