// このバージョンでは使わないが、必要なら背景グリッド生成などで使用可能
export function generateGrid(columns: number, rows: number, cellWidth: number, cellHeight: number) {
	const lines = [];
	for (let i = 0; i <= columns; i++) {
		lines.push({ x1: i * cellWidth, y1: 0, x2: i * cellWidth, y2: rows * cellHeight });
	}
	for (let j = 0; j <= rows; j++) {
		lines.push({ x1: 0, y1: j * cellHeight, x2: columns * cellWidth, y2: j * cellHeight });
	}
	return lines;
}
