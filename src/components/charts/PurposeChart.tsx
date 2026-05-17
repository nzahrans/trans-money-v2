"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PIE_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

type Props = {
  labels: string[];
  values: number[];
  canvasId?: string;
};

export default function PurposeChart({ labels, values, canvasId = "purpose-chart" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || labels.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const total = values.reduce((a, b) => a + b, 0);
    const chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels.map((l, i) =>
          `${l} (${total > 0 ? Math.round((values[i] / total) * 100) : 0}%)`
        ),
        datasets: [
          {
            data: values,
            backgroundColor: PIE_COLORS.slice(0, labels.length),
            borderWidth: 2,
            borderColor: "transparent",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { font: { size: 11 }, padding: 14, boxWidth: 12 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? Math.round((Number(ctx.raw) / total) * 100) : 0;
                return ` Rp ${Number(ctx.raw).toLocaleString("id-ID")} (${pct}%)`;
              },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [labels, values]);

  return (
    <div style={{ position: "relative", height: 260 }}>
      <canvas ref={canvasRef} id={canvasId} />
    </div>
  );
}
