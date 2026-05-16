"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Props = {
  deposit: number[];
  withdraw: number[];
  canvasId?: string;
};

export default function MonthlyChart({ deposit, withdraw, canvasId = "monthly-chart" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ALL_MONTHS,
        datasets: [
          {
            label: "Deposits",
            data: deposit,
            backgroundColor: "#22c55e",
            borderRadius: 3,
          },
          {
            label: "Withdrawals",
            data: withdraw,
            backgroundColor: "#ef4444",
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: Rp ${Number(ctx.raw).toLocaleString("id-ID")}`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => {
                const n = Number(value);
                if (n >= 1_000_000) return `${n / 1_000_000} jt`;
                return n.toLocaleString("id-ID");
              },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [deposit, withdraw]);

  return <canvas ref={canvasRef} id={canvasId} />;
}
