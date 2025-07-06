import { timeFormat } from 'd3-time-format';
import { timeHour, timeDay, timeWeek, timeMonth } from 'd3-time';

export type ViewMode = 'hour' | 'day' | 'week' | 'month';

export interface TickSettings {
	tickInterval: Date[];
	tickFormat: (date: Date) => string;
}

export interface ViewRangeSettings {
	start: Date;
	end: Date;
	upper: TickSettings; // 上段軸設定
	lower: TickSettings; // 下段軸設定
}

// viewMode毎に「上段・下段のtickとフォーマット」を設定するマップ
const viewModeSettingsMap: Record<ViewMode, Omit<ViewRangeSettings, 'start' | 'end'>> = {
	hour: {
		upper: {
			tickInterval: timeHour.range(new Date(), new Date(), 1), // 仮。あとで計算し直し
			tickFormat: timeFormat('%H:%M')
		},
		lower: {
			tickInterval: [], // hourモードは1段表示でOKにしても良い
			tickFormat: () => ''
		}
	},
	day: {
		upper: {
			tickInterval: [], // あとで範囲に合わせて計算
			tickFormat: timeFormat('%b %d')
		},
		lower: {
			tickInterval: [],
			tickFormat: timeFormat('%H:%M')
		}
	},
	week: {
		upper: {
			tickInterval: [],
			tickFormat: timeFormat('%b %d')
		},
		lower: {
			tickInterval: [],
			tickFormat: timeFormat('%a')
		}
	},
	month: {
		upper: {
			tickInterval: [],
			tickFormat: timeFormat('%b %Y')
		},
		lower: {
			tickInterval: [],
			tickFormat: timeFormat('%W') // 週番号など
		}
	}
};

export function getViewRangeForMode(viewMode: ViewMode, now: Date = new Date()): ViewRangeSettings {
	const d = new Date(now);

	let start: Date;
	let end: Date;

	switch (viewMode) {
		case 'hour':
			start = new Date(d);
			start.setMinutes(d.getMinutes() - 30, 0, 0);
			end = new Date(d);
			end.setMinutes(d.getMinutes() + 30, 59, 999);
			break;
		case 'day':
			start = new Date(d);
			start.setDate(d.getDate() - 1);
			start.setHours(0, 0, 0, 0);
			end = new Date(d);
			end.setDate(d.getDate() + 1);
			end.setHours(23, 59, 59, 999);
			break;
		case 'week':
			start = new Date(d);
			start.setDate(d.getDate() - 3);
			start.setHours(0, 0, 0, 0);
			end = new Date(d);
			end.setDate(d.getDate() + 4);
			end.setHours(23, 59, 59, 999);
			break;
		case 'month':
			start = new Date(d.getFullYear(), d.getMonth(), 1);
			end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
			break;
		default:
			start = new Date(d);
			end = new Date(d);
	}

	// 現在のviewModeの設定取得
	const currentSettings = viewModeSettingsMap[viewMode];

	// 上下段のtickIntervalはstart/end範囲に応じて計算し直す
	const upperTickInterval = calculateTickInterval(viewMode, start, end, 'upper');
	const lowerTickInterval = calculateTickInterval(viewMode, start, end, 'lower');

	return {
		start,
		end,
		upper: {
			tickFormat: currentSettings.upper.tickFormat,
			tickInterval: upperTickInterval
		},
		lower: {
			tickFormat: currentSettings.lower.tickFormat,
			tickInterval: lowerTickInterval
		}
	};
}

// 実際にstart/end範囲からtickIntervalを生成するヘルパー
function calculateTickInterval(
	viewMode: ViewMode,
	start: Date,
	end: Date,
	position: 'upper' | 'lower'
): Date[] {
	switch (viewMode) {
		case 'hour':
			// 例: hourモードは1段表示のみ。空配列返す
			return [];
		case 'day':
			if (position === 'upper') return timeDay.range(start, end, 1);
			if (position === 'lower') return timeHour.range(start, end, 1);
			break;
		case 'week':
			if (position === 'upper') return timeWeek.range(start, end, 1);
			if (position === 'lower') return timeDay.range(start, end, 1);
			break;
		case 'month':
			if (position === 'upper') return timeMonth.range(start, end, 1);
			if (position === 'lower') return timeWeek.range(start, end, 1);
			break;
	}
	return [];
}
