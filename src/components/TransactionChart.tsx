"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export type ChartData = {
  labels: string[];
  deposit: number[];
  withdraw: number[];
};

export default function TransactionChart({ data }: { data: ChartData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Deposit",
            data: data.deposit,
            backgroundColor: "#2563eb",
          },
          {
            label: "Withdraw",
            data: data.withdraw,
            backgroundColor: "#dc2626",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" as const },
          title: { display: true, text: "Grafik Transaksi Bulanan" },
        },
      },
    });
    return () => chart.destroy();
  }, [data]);

  return <canvas ref={canvasRef} height={200} />;
}
