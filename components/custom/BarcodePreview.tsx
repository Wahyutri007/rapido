import React from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";

export type BarcodeFormat = "code128" | "ean13" | "qrcode";

export type BarcodePreviewProps = {
	value: string;
	format?: BarcodeFormat;
	width?: number;
	height?: number;
	showLabel?: boolean;
	className?: string;
};

// Generates a deterministic barcode bar pattern based on code string
function generateBarcodePattern(value: string, count: number): number[] {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}

	const pattern: number[] = [];
	for (let i = 0; i < count; i++) {
		const bit = Math.abs((hash ^ (i * 2654435761)) % 7);
		pattern.push(bit > 2 ? (bit > 4 ? 2 : 1) : 0);
	}
	return pattern;
}

// Generates a deterministic QR module grid (size x size)
function generateQrGrid(value: string, size = 17): boolean[][] {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}

	const grid: boolean[][] = [];
	for (let r = 0; r < size; r++) {
		const row: boolean[] = [];
		for (let c = 0; c < size; c++) {
			const isTl = r < 5 && c < 5;
			const isTr = r < 5 && c >= size - 5;
			const isBl = r >= size - 5 && c < 5;

			if (isTl || isTr || isBl) {
				const isBorder =
					r === 0 ||
					r === 4 ||
					c === 0 ||
					c === 4 ||
					r === size - 1 ||
					r === size - 5 ||
					c === size - 1 ||
					c === size - 5;
				const isCenter =
					(r === 2 && c === 2) ||
					(r === 2 && c === size - 3) ||
					(r === size - 3 && c === 2);
				row.push(isBorder || isCenter);
			} else {
				const bit = Math.abs((hash ^ (r * 31 + c * 17)) % 10);
				row.push(bit > 4);
			}
		}
		grid.push(row);
	}
	return grid;
}

export default function BarcodePreview({
	value,
	format = "code128",
	width = 160,
	height = 48,
	showLabel = true,
	className,
}: BarcodePreviewProps) {
	const grid = React.useMemo(
		() =>
			generateQrGrid(value || "RAPIDO", 17).flatMap((row, y) =>
				row.flatMap((active, x) => (active ? [{ x, y }] : [])),
			),
		[value],
	);
	const bars = React.useMemo(() => {
		const pattern = generateBarcodePattern(value || "POS-PRD-000128", 38);
		const unit = width / 55;
		let curX = 0;
		const elements: { x: number; w: number }[] = [];
		for (const barType of pattern) {
			const barW = barType === 2 ? unit * 2 : unit;
			if (barType > 0) elements.push({ x: curX, w: barW });
			curX += barW + unit * 0.5;
		}
		const startX = Math.max(0, (width - curX) / 2);
		return elements.map((el) => ({ x: el.x + startX, w: el.w }));
	}, [value, width]);

	if (format === "qrcode") {
		const qrSize = Math.min(width, height);
		const gridSize = 17;
		const cellSize = qrSize / gridSize;

		return (
			<View className={cn("items-center justify-center", className)}>
				<Svg width={qrSize} height={qrSize}>
					<Rect width={qrSize} height={qrSize} fill="#ffffff" />
					{grid.map((cell) => (
						<Rect
							key={`${cell.x}-${cell.y}`}
							x={cell.x * cellSize}
							y={cell.y * cellSize}
							width={cellSize}
							height={cellSize}
							fill="#18181b"
						/>
					))}
				</Svg>
				{showLabel && (
					<Text
						size="small"
						w="semibold"
						className="mt-1.5 text-center text-foreground tracking-wider"
					>
						{value}
					</Text>
				)}
			</View>
		);
	}

	// Code 128 / EAN-13 barcode rendering

	return (
		<View className={cn("items-center justify-center", className)}>
			<Svg width={width} height={height}>
				<Rect width={width} height={height} fill="#ffffff" />
				{bars.map((bar) => (
					<Rect
						key={bar.x}
						x={bar.x}
						y={0}
						width={bar.w}
						height={height}
						fill="#18181b"
					/>
				))}
			</Svg>
			{showLabel && (
				<Text
					size="small"
					w="semibold"
					className="mt-2 text-center text-foreground tracking-wider"
				>
					{value}
				</Text>
			)}
		</View>
	);
}
