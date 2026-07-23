"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd } from "@/lib/utils";

export function SpendChart({ data }: { data: { day: string; spend: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f7a6c" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#0f7a6c" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d7d0c2" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(value: number) => formatUsd(value, 4)} />
          <Area type="monotone" dataKey="spend" stroke="#0f7a6c" fill="url(#spend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
