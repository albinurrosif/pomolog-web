'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import api from '../lib/api';
import { Task } from '@/app/page';

// SHADCN COMPONENTS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// RECHARTS COMPONENTS (Menambahkan Rectangle sesuai dokumentasi Shadcn)
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, Rectangle } from 'recharts';

// KONFIGURASI CHART
const chartConfig = {
  totalMinutes: {
    label: 'Total Waktu',
    color: '#ef4444', // Merah Tomat
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState({ totalTasksCompleted: 0, totalSessionsCompleted: 0, totalFocusTimeMinutes: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- API FETCHING ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [tasksRes, summaryRes, chartRes] = await Promise.all([api.get('/Tasks/with-time-spent'), api.get('/Analytics/summary'), api.get(`/Analytics/${timeRange}`)]);

        setTasks(tasksRes.data);
        setSummary(summaryRes.data);

        // Hanya di-reverse, TANPA manipulasi fill color manual
        const sortedData = [...chartRes.data].reverse();
        setChartData(sortedData);
      } catch (error) {
        console.error('Gagal memuat analitik:', error);
        setErrorMessage('Gagal menarik data dari server. Pastikan koneksi Anda stabil.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  // --- DATA CALCULATIONS ---
  const topTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => t.totalMinutesSpent > 0)
      .sort((a, b) => b.totalMinutesSpent - a.totalMinutesSpent)
      .slice(0, 5);
  }, [tasks]);

  const formattedFocusTime = useMemo(() => {
    const totalMinutes = summary.totalFocusTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return (
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-4xl font-black text-amber-500">{hours}</span>
          <span className="text-sm font-bold text-muted-foreground mr-1">j</span>
          <span className="text-4xl font-black text-amber-500">{minutes}</span>
          <span className="text-sm font-bold text-muted-foreground">m</span>
        </div>
      );
    }
    return (
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-4xl font-black text-amber-500">{minutes}</span>
        <span className="text-sm font-bold text-muted-foreground">MENIT</span>
      </div>
    );
  }, [summary.totalFocusTimeMinutes]);

  const renderTomatoes = (minutes: number) => {
    if (minutes < 25) return null;
    const tomatoCount = Math.floor(minutes / 25);
    return (
      <span className="ml-2 text-sm tracking-widest" title={`${tomatoCount} Sesi Selesai`}>
        {Array.from({ length: tomatoCount })
          .map(() => '🍅')
          .join('')}
      </span>
    );
  };

  const todayKey = chartData.length > 0 ? chartData[chartData.length - 1][timeRange === 'weekly' ? 'dayName' : 'date'] : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="max-w-6xl mx-auto p-4 md:p-8 mt-4 md:mt-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-wider uppercase">Analytics</h1>
            <p className="text-muted-foreground text-sm font-medium">Visualisasi dedikasi dan distribusi waktu fokus Anda.</p>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-lg border border-border w-fit">
            <Button variant={timeRange === 'weekly' ? 'default' : 'ghost'} size="sm" onClick={() => setTimeRange('weekly')} className="font-bold px-6">
              7 Hari
            </Button>
            <Button variant={timeRange === 'monthly' ? 'default' : 'ghost'} size="sm" onClick={() => setTimeRange('monthly')} className="font-bold px-6">
              30 Hari
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground animate-pulse py-12 text-center font-medium">Mengkalkulasi metrik...</p>
        ) : errorMessage ? (
          <p className="text-destructive text-center py-12 font-bold">{errorMessage}</p>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border">
                <CardContent className="p-6 flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Waktu Fokus</span>
                  {formattedFocusTime}
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="p-6 flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Task Selesai</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-foreground">{summary.totalTasksCompleted}</span>
                    <span className="text-sm font-bold text-muted-foreground">TASK</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="p-6 flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Sesi</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-foreground">{summary.totalSessionsCompleted}</span>
                    <span className="text-sm font-bold text-muted-foreground">POMODORO</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
              <Card className="lg:col-span-4 bg-card/50 border-border flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="uppercase tracking-wider text-sm">Tren Fokus ({timeRange === 'weekly' ? '7 Hari' : '30 Hari'})</CardTitle>
                    <CardDescription>Masa lalu di kiri, hari ini di kanan.</CardDescription>
                  </div>

                  <div className="flex bg-muted/50 p-1 rounded-md border border-border">
                    <Button variant={chartType === 'bar' ? 'secondary' : 'ghost'} size="sm" onClick={() => setChartType('bar')} className="h-7 px-3 text-xs font-bold">
                      Bar
                    </Button>
                    <Button variant={chartType === 'area' ? 'secondary' : 'ghost'} size="sm" onClick={() => setChartType('area')} className="h-7 px-3 text-xs font-bold">
                      Area
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] mt-4">
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    {chartType === 'bar' ? (
                      <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />

                        <XAxis
                          dataKey={timeRange === 'weekly' ? 'dayName' : 'date'}
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          minTickGap={20}
                          tickFormatter={(value) => {
                            if (timeRange === 'weekly') return value;
                            return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                          }}
                        />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `${value}m`} />

                        <ChartTooltip
                          cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                          content={
                            <ChartTooltipContent
                              hideLabel={false}
                              formatter={(value, name, item) => {
                                // 💡 ALAT PENYADAP (DEBUGGING)
                                // Buka Inspect Element -> tab "Console" di browser Anda
                                // Perhatikan apa saja isi dari item.payload saat Anda me-hover grafik
                                console.log('Isi Payload dari Backend:', item.payload);

                                return (
                                  <>
                                    <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: `var(--color-totalMinutes)` }} />
                                    <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>

                                    <div className="ml-auto flex items-baseline gap-3 font-mono font-medium text-foreground tabular-nums">
                                      {/* Menit Fokus */}
                                      <div className="flex items-baseline gap-1">
                                        {value} <span className="font-normal text-muted-foreground font-sans text-xs">menit</span>
                                      </div>

                                      {/* Jumlah Sesi Pomodoro */}
                                      {item.payload.sessionCount !== undefined && (
                                        <div className="flex items-baseline gap-1 border-l border-border pl-3">
                                          {item.payload.sessionCount} <span className="font-normal text-muted-foreground font-sans text-[10px] uppercase tracking-wider">sesi</span>
                                        </div>
                                      )}

                                      {/* Jumlah Task Selesai */}
                                      {item.payload.tasksCompleted !== undefined && (
                                        <div className="flex items-baseline gap-1 border-l border-border pl-3">
                                          {item.payload.tasksCompleted} <span className="font-normal text-muted-foreground font-sans text-[10px] uppercase tracking-wider">task</span>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                );
                              }}
                            />
                          }
                        />
                        <Bar
                          dataKey="totalMinutes"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                          shape={(props: any) => {
                            const isToday = props.index === chartData.length - 1;
                            return <Rectangle {...props} fillOpacity={isToday ? 1 : 0.4} />;
                          }}
                        />
                      </BarChart>
                    ) : (
                      <AreaChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />

                        <XAxis
                          dataKey={timeRange === 'weekly' ? 'dayName' : 'date'}
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          minTickGap={20}
                          tickFormatter={(value) => {
                            if (timeRange === 'weekly') return value;
                            return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                          }}
                        />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `${value}m`} />

                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              hideLabel={false}
                              formatter={(value, name) => (
                                <>
                                  <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: `var(--color-${name})` }} />
                                  {chartConfig[name as keyof typeof chartConfig]?.label || name}
                                  <div className="ml-auto flex items-baseline gap-1 font-mono font-medium text-foreground tabular-nums">
                                    {value}
                                    <span className="font-normal text-muted-foreground">menit</span>
                                  </div>
                                </>
                              )}
                            />
                          }
                        />

                        <Area type="monotone" dataKey="totalMinutes" stroke="var(--color-totalMinutes)" strokeWidth={3} fill="var(--color-totalMinutes)" fillOpacity={0.2} />

                        {todayKey && <ReferenceLine x={todayKey} stroke="var(--color-totalMinutes)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Hari Ini', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />}
                      </AreaChart>
                    )}
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="uppercase tracking-wider text-sm">Top Time Thieves</CardTitle>
                  <CardDescription>Task yang paling banyak menyita waktu.</CardDescription>
                </CardHeader>
                <CardContent>
                  {topTasks.length === 0 ? (
                    <p className="text-muted-foreground italic text-sm py-4">Belum ada rekam jejak fokus.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {topTasks.map((task, i) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border transition-colors hover:border-primary/30 group">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <span className={`font-black text-lg ${i === 0 ? 'text-primary' : 'text-muted-foreground/50'}`}>#{i + 1}</span>
                            <span className="text-foreground font-semibold truncate group-hover:text-primary transition-colors">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {renderTomatoes(task.totalMinutesSpent)}
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">{task.totalMinutesSpent}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
