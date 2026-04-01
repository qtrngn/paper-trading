type GroupingUnit = 'minute' | 'hour' | 'day' | 'week';

type LookBackUnit = 'day' | 'week' | 'month' | 'year';

type TimeGrouping = {
    unit: GroupingUnit;
    count: number;
}

type LookBack = {
    unit: LookBackUnit;
    count: number;
}

type RangeDefinition = {
    grouping: TimeGrouping;
    lookback: LookBack;
}

const RANGE_CONFIG = {
    '1D': {
        grouping: {
            unit: 'minute',
            count: 5,
        },
        lookback: {
            unit: 'day',
            count: 1,
        },
    },
    '1W': {
        grouping: {
            unit: 'minute',
            count: 30,
        },
        lookback: {
            unit: 'week',
            count: 1,
        },
    },
    '1M': {
        grouping: {
            unit: 'hour',
            count: 1,
        },
        lookback: {
            unit: 'month',
            count: 1,
        },
    },
    '3M': {
        grouping: {
            unit: 'day',
            count: 1,
        },
        lookback: {
            unit: 'month',
            count: 3,
        },
    },
    '6M': {
        grouping: {
            unit: 'day',
            count: 1,
        },
        lookback: {
            unit: 'month',
            count: 6,
        },
    },
    '1Y': {
        grouping: {
            unit: 'day',
            count: 1,
        },
        lookback: {
            unit: 'year',
            count: 1,
        },
    },
    '5Y': {
        grouping: {
            unit: 'week',
            count: 1,
        },
        lookback: {
            unit: 'year',
            count: 5,
        },
    }

} as const satisfies Record<string, RangeDefinition>;

export type ChartRange = keyof typeof RANGE_CONFIG;


export function normalizeRange (value: string) {
    return value.trim().toUpperCase();
}

export function isChartRange(value: string): value is ChartRange {
    return Object.prototype.hasOwnProperty.call(RANGE_CONFIG, value);
}

export function getRangeDefinition(range: ChartRange): RangeDefinition {
    return RANGE_CONFIG[range];
  }

  export function toAlpacaTimeframe(grouping: TimeGrouping): string {
    switch (grouping.unit) {
      case 'minute':
        return `${grouping.count}Min`;
      case 'hour':
        return `${grouping.count}Hour`;
      case 'day':
        return `${grouping.count}Day`;
      case 'week':
        return `${grouping.count}Week`;
      default:
        throw new Error('Invalid timeframe');
    }
  }
  
  export function getDateRangeFromLookback(lookback: LookBack): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date(end);
  
    switch (lookback.unit) {
      case 'day':
        start.setDate(start.getDate() - lookback.count);
        break;
      case 'week':
        start.setDate(start.getDate() - lookback.count * 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - lookback.count);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - lookback.count);
        break;
      default:
        throw new Error('Invalid lookback');
    }
  
    return { start, end };
  }

  