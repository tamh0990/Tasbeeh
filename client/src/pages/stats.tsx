import { useMemo } from "react";
import { MobileLayout } from "@/components/layout";
import { useAdhkar } from "@/hooks/use-adhkar";
import { useSessions } from "@/hooks/use-sessions";
import { toArabicNumerals } from "@/hooks/use-preferences";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Award, Target, Activity } from "lucide-react";

export default function Stats() {
  const { data: adhkar, isLoading: loadingAdhkar } = useAdhkar();
  const { data: sessions, isLoading: loadingSessions } = useSessions();

  const totalTasbeeh = useMemo(() => {
    return adhkar?.reduce((sum, item) => sum + item.historicalCount, 0) || 0;
  }, [adhkar]);

  // Generate last 7 days chart data
  const chartData = useMemo(() => {
    if (!sessions) return [];
    
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      
      // Calculate sum for this day
      const daySessions = sessions.filter(s => 
        isSameDay(new Date(s.timestamp), date)
      );
      const count = daySessions.reduce((sum, s) => sum + s.count, 0);
      
      // Format day name in Arabic
      const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayName = i === 0 ? 'اليوم' : dayNames[date.getDay()];

      days.push({
        name: dayName,
        count: count,
        fullDate: format(date, 'yyyy-MM-dd')
      });
    }
    return days;
  }, [sessions]);

  if (loadingAdhkar || loadingSessions) {
    return (
      <MobileLayout title="الإحصائيات">
        <div className="p-6 space-y-4">
          <div className="h-32 bg-card rounded-3xl animate-pulse"></div>
          <div className="h-64 bg-card rounded-3xl animate-pulse mt-6"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="الإحصائيات">
      <div className="p-6 flex flex-col gap-6">
        
        {/* Total Summary Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Award className="w-40 h-40" />
          </div>
          <h3 className="text-primary-foreground/80 font-medium mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" /> إجمالي التسبيحات
          </h3>
          <p className="text-5xl font-bold font-serif tracking-tight arabic-numbers">
            {toArabicNumerals(totalTasbeeh)}
          </p>
        </div>

        {/* Chart Card */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm mt-2">
          <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> نشاط آخر ٧ أيام
          </h3>
          
          <div className="h-[200px] w-full" dir="ltr"> {/* Recharts usually works better LTR */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'Tajawal' }}
                  dy={10}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border p-3 rounded-xl shadow-lg" dir="rtl">
                          <p className="text-muted-foreground text-sm">{payload[0].payload.name}</p>
                          <p className="text-foreground font-bold text-lg arabic-numbers mt-1">
                            {toArabicNumerals(payload[0].value as number)} تسبيحة
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === chartData.length - 1 ? 'hsl(var(--accent))' : 'hsl(var(--primary)/0.6)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most used adhkar */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-foreground font-bold mb-4">الأكثر تكراراً</h3>
          <div className="space-y-4">
            {adhkar?.sort((a, b) => b.historicalCount - a.historicalCount).slice(0, 3).map((dhikr, i) => (
              <div key={dhikr.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                    {toArabicNumerals(i + 1)}
                  </div>
                  <p className="font-serif font-bold max-w-[200px] truncate">{dhikr.text}</p>
                </div>
                <p className="font-bold text-primary arabic-numbers bg-primary/10 px-3 py-1 rounded-full text-sm">
                  {toArabicNumerals(dhikr.historicalCount)}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MobileLayout>
  );
}
