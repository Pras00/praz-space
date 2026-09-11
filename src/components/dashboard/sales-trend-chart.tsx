"use client";

import * as React from "react";
import {
  TrendingUp,
  BarChart3,
  LineChart,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";

export interface WeeklyTrendData {
  date: string; // e.g. "6 Sep"
  dayName: string; // e.g. "Min", "Sen", "Sel"
  fullDate: string; // e.g. "Minggu, 6 September 2026"
  revenue: number;
  orderCount?: number;
  isToday?: boolean;
}

interface SalesTrendChartProps {
  data?: WeeklyTrendData[];
  className?: string;
}

function formatCompactCurrency(val: number): string {
  if (val <= 0) return "Rp 0";
  if (val >= 1_000_000) {
    const formatted = (val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1);
    return `Rp ${formatted} jt`;
  }
  if (val >= 1_000) {
    const formatted = (val / 1_000).toFixed(val % 1_000 === 0 ? 0 : 1);
    return `Rp ${formatted} rb`;
  }
  return `Rp ${val}`;
}

// Generate smooth cubic bezier SVG spline with boundary clamping
function buildSmoothSpline(pts: { x: number; y: number }[], yMin: number, yMax: number): string {
  if (!pts || pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const pPrev = pts[Math.max(0, i - 1)];
    const pCurr = pts[i];
    const pNext = pts[i + 1];
    const pNext2 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = pCurr.x + (pNext.x - pPrev.x) / 5;
    let cp1y = pCurr.y + (pNext.y - pPrev.y) / 5;
    const cp2x = pNext.x - (pNext2.x - pCurr.x) / 5;
    let cp2y = pNext.y - (pNext2.y - pCurr.y) / 5;

    cp1y = Math.max(yMin, Math.min(yMax, cp1y));
    cp2y = Math.max(yMin, Math.min(yMax, cp2y));

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${pNext.x.toFixed(1)},${pNext.y.toFixed(1)}`;
  }
  return path;
}

export function SalesTrendChart({ data = [], className }: SalesTrendChartProps) {
  const [viewMode, setViewMode] = React.useState<"area" | "bar">("area");
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  // Safe fallback if data is empty
  const trendData: WeeklyTrendData[] = React.useMemo(() => {
    if (data && data.length > 0) return data;
    // Default mock week if empty
    const now = new Date();
    const list: WeeklyTrendData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      list.push({
        date: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(d),
        dayName: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(d),
        fullDate: new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d),
        revenue: 0,
        orderCount: 0,
        isToday: i === 0,
      });
    }
    return list;
  }, [data]);

  const total7Days = React.useMemo(
    () => trendData.reduce((acc, curr) => acc + (curr.revenue || 0), 0),
    [trendData]
  );
  const avgDaily = Math.round(total7Days / Math.max(1, trendData.length));
  const maxRevenue = React.useMemo(
    () => Math.max(...trendData.map((d) => d.revenue || 0), 0),
    [trendData]
  );
  const peakDay = React.useMemo(() => {
    if (maxRevenue <= 0) return null;
    return trendData.find((d) => d.revenue === maxRevenue) || null;
  }, [trendData, maxRevenue]);

  // Default active display: hovered item, or today if available, or last item
  const todayIdx = trendData.findIndex((d) => d.isToday);
  const activeIdx = hoveredIdx !== null ? hoveredIdx : (todayIdx >= 0 ? todayIdx : trendData.length - 1);
  const activeItem = activeIdx >= 0 && activeIdx < trendData.length ? trendData[activeIdx] : trendData[trendData.length - 1];

  // SVG dimensions for Area mode
  const svgWidth = 600;
  const svgHeight = 220;
  const padX = 35;
  const padTop = 25;
  const padBottom = 190;
  const usableHeight = padBottom - padTop;
  const usableWidth = svgWidth - 2 * padX;

  const points = React.useMemo(() => {
    const count = trendData.length;
    if (count === 0) return [];
    return trendData.map((d, i) => {
      const x = padX + (i / Math.max(1, count - 1)) * usableWidth;
      const pct = maxRevenue > 0 ? (d.revenue || 0) / maxRevenue : 0;
      const y = padBottom - pct * usableHeight;
      return { x, y, item: d };
    });
  }, [trendData, maxRevenue, usableWidth, usableHeight, padX, padBottom]);

  const curveLinePath = React.useMemo(
    () => buildSmoothSpline(points, padTop, padBottom),
    [points, padTop, padBottom]
  );

  const curveAreaPath = React.useMemo(() => {
    if (!curveLinePath || points.length === 0) return "";
    const lastPt = points[points.length - 1];
    const firstPt = points[0];
    return `${curveLinePath} L ${lastPt.x.toFixed(1)},${padBottom} L ${firstPt.x.toFixed(1)},${padBottom} Z`;
  }, [curveLinePath, points, padBottom]);

  return (
    <Card className={cn("overflow-hidden border-border/70 shadow-xs", className)}>
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Tren Penjualan 7 Hari Terakhir
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 py-0.5">
                Real-time
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Volume pendapatan harian cafe terverifikasi di PostgreSQL Supabase.
            </CardDescription>
          </div>

          {/* View Mode Toggle: Area vs Bar */}
          <div className="flex items-center self-start sm:self-auto rounded-lg bg-muted/60 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode("area")}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "area"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LineChart className="h-3.5 w-3.5 text-emerald-500" />
              <span>Kurva</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("bar")}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                viewMode === "bar"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Batang</span>
            </button>
          </div>
        </div>

        {/* 3 KPI Summary Pills */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50 mt-3">
          <div className="rounded-xl bg-muted/30 border border-border/40 p-2 sm:p-2.5">
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">
              Total 7 Hari
            </p>
            <p className="text-xs sm:text-base font-bold font-mono text-foreground truncate mt-0.5">
              {formatCurrency(total7Days)}
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/40 p-2 sm:p-2.5">
            <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">
              Rata-rata/Hari
            </p>
            <p className="text-xs sm:text-base font-bold font-mono text-foreground truncate mt-0.5">
              {formatCurrency(avgDaily)}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-2.5">
            <p className="text-[10px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
              Puncak Penjualan
            </p>
            <p className="text-xs sm:text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
              {peakDay ? formatCurrency(peakDay.revenue) : "Rp 0"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-1 sm:pt-2">
        {/* Interactive Hover / Tap Detail Card */}
        <div className="mb-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-2.5 sm:p-3 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {activeItem?.fullDate || activeItem?.date}
                </span>
                {activeItem?.isToday && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-white leading-none">
                    Hari Ini
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {activeItem && activeItem.orderCount !== undefined
                  ? activeItem.orderCount > 0
                    ? `${activeItem.orderCount} transaksi pesanan selesai`
                    : "Belum ada transaksi di hari ini"
                  : "Data penjualan harian"}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 pl-2">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">
              Omset Harian
            </p>
            <p className="text-sm sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(activeItem?.revenue || 0)}
            </p>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative w-full h-52 sm:h-64 select-none">
          {/* Y-Axis scale references (0%, 50%, 100%) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-muted-foreground/60 pb-8 pt-2">
            <div className="flex items-center justify-between border-b border-dashed border-border/50 pb-0.5">
              <span className="bg-background/80 px-1 rounded">{formatCompactCurrency(maxRevenue)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-dashed border-border/40 pb-0.5">
              <span className="bg-background/80 px-1 rounded">{formatCompactCurrency(Math.round(maxRevenue / 2))}</span>
            </div>
            <div className="flex items-center justify-between border-b border-dashed border-border/60 pb-0.5">
              <span className="bg-background/80 px-1 rounded">Rp 0</span>
            </div>
          </div>

          {/* VIEW MODE: AREA CHART */}
          {viewMode === "area" && (
            <div className="relative w-full h-full pb-8 pt-2">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Area Gradient Fill */}
                {curveAreaPath && (
                  <path
                    d={curveAreaPath}
                    fill="url(#areaGradient)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Smooth Curve Stroke */}
                {curveLinePath && (
                  <path
                    d={curveLinePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Vertical Guideline on Active/Hover */}
                {activeIdx !== null && points[activeIdx] && (
                  <line
                    x1={points[activeIdx].x}
                    y1={padTop}
                    x2={points[activeIdx].x}
                    y2={padBottom}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="opacity-60"
                  />
                )}

                {/* Points */}
                {points.map((pt, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <g key={idx} className="cursor-pointer">
                      {isActive && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="11"
                          fill="#10b981"
                          fillOpacity="0.2"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isActive ? "6" : "4.5"}
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth={isActive ? "3" : "2.5"}
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* VIEW MODE: BAR CHART */}
          {viewMode === "bar" && (
            <div className="relative w-full h-full pb-8 pt-2 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2">
              {trendData.map((item, idx) => {
                const isActive = idx === activeIdx;
                const heightPct =
                  maxRevenue > 0
                    ? Math.max(item.revenue > 0 ? 10 : 3, Math.round((item.revenue / maxRevenue) * 100))
                    : 4;

                return (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-end items-center cursor-pointer group"
                    onClick={() => setHoveredIdx(idx)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                  >
                    <div className="w-full h-full flex items-end justify-center">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={cn(
                          "w-full max-w-[28px] sm:max-w-[42px] rounded-t-lg transition-all duration-300 relative",
                          isActive
                            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 scale-x-105"
                            : item.revenue > 0
                            ? "bg-emerald-500/80 group-hover:bg-emerald-500 group-hover:shadow-md"
                            : "bg-muted-foreground/20 group-hover:bg-muted-foreground/40"
                        )}
                      >
                        {item.revenue > 0 && (
                          <div
                            className={cn(
                              "absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold whitespace-nowrap transition-opacity",
                              isActive
                                ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                                : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                            )}
                          >
                            {formatCompactCurrency(item.revenue)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Transparent touch & hover overlays for Area mode */}
          {viewMode === "area" && (
            <div className="absolute inset-0 pb-8 pt-2 flex items-stretch">
              {trendData.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-full cursor-pointer hover:bg-primary/5 transition-colors"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onClick={() => setHoveredIdx(idx)}
                />
              ))}
            </div>
          )}

          {/* X-AXIS LABELS (Days & Dates) */}
          <div className="absolute bottom-0 inset-x-0 h-8 flex items-center justify-between px-1 sm:px-2 border-t border-border/40">
            {trendData.map((item, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setHoveredIdx(idx)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center transition-all cursor-pointer py-1 px-0.5 rounded-md",
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-semibold whitespace-nowrap leading-tight",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.dayName}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] sm:text-[11px] whitespace-nowrap leading-tight",
                      item.isToday
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
