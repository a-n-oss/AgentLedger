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
import { useEffect, useState } from "react";
import { formatUsd } from "@/lib/utils";

function readCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function SpendChart({ data }: { data: { day: string; spend: number }[] }) {
  const [colors, setColors] = useState({
    accent: "#1565ff",
    line: "#cfd9eb",
    ink: "#0b1220",
    muted: "#5b6b86",
    panel: "#ffffff",
  });

  useEffect(() => {
    const sync = () => {
      setColors({
        accent: readCssVar("--al-accent", "#1565ff"),
        line: readCssVar("--al-line", "#cfd9eb"),
        ink: readCssVar("--al-ink", "#0b1220"),
        muted: readCssVar("--al-muted", "#5b6b86"),
        panel: readCssVar("--al-panel", "#ffffff"),
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.line} strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: colors.muted }} stroke={colors.line} />
          <YAxis
            tick={{ fontSize: 11, fill: colors.muted }}
            stroke={colors.line}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: colors.panel,
              border: `1px solid ${colors.line}`,
              borderRadius: 8,
              color: colors.ink,
            }}
            formatter={(value: number) => formatUsd(value, 4)}
          />
          <Area type="monotone" dataKey="spend" stroke={colors.accent} fill="url(#spend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
