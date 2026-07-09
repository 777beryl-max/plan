"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ProgressChartProps {
  planned: number;
  completed: number;
}

export function ProgressChart({ planned, completed }: ProgressChartProps) {
  const data = [
    { name: "預計", value: planned, color: "#9b8ec4" },
    { name: "實際", value: completed, color: "#f7d51d" },
  ];

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#ededed", fontSize: 12, fontFamily: "monospace" }}
            axisLine={{ stroke: "#0f0f1a" }}
          />
          <YAxis
            tick={{ fill: "#9b8ec4", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#0f0f1a" }}
            allowDecimals={false}
          />
          <Bar dataKey="value" radius={0}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
