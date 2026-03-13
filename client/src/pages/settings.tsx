import { useTheme } from "next-themes";
import { MobileLayout } from "@/components/layout";
import { usePreferences } from "@/hooks/use-preferences";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Vibrate, Bell, Info } from "lucide-react";
import { ReactNode } from "react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { prefs, updatePrefs } = usePreferences();
  const isDark = theme === 'dark';

  return (
    <MobileLayout title="الإعدادات">
      <div className="p-5 flex flex-col gap-5 pb-10">

        {/* Preferences Section */}
        <section className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/50 bg-secondary/20">
            <h3 className="font-bold text-foreground text-base">تفضيلات التطبيق</h3>
          </div>

          <SettingRow
            icon={<Vibrate className="w-[22px] h-[22px]" />}
            title="الاهتزاز عند التسبيح"
            description="تفعيل التنبيه اللمسي مع كل ضغطة"
            control={
              <Switch
                checked={prefs.vibrationEnabled}
                onCheckedChange={(c) => updatePrefs({ vibrationEnabled: c })}
                data-testid="toggle-vibration"
              />
            }
          />

          <div className="h-px bg-border/40 mx-5" />

          <SettingRow
            icon={<Bell className="w-[22px] h-[22px]" />}
            title="تنبيهات المحطات"
            description="تنبيه عند الوصول إلى ٣٣، ٦٦، ٩٩، ١٠٠"
            control={
              <Switch
                checked={prefs.milestoneAlertsEnabled}
                onCheckedChange={(c) => updatePrefs({ milestoneAlertsEnabled: c })}
                data-testid="toggle-milestone"
              />
            }
          />
        </section>

        {/* Appearance Section */}
        <section className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/50 bg-secondary/20">
            <h3 className="font-bold text-foreground text-base">المظهر</h3>
          </div>

          <SettingRow
            icon={isDark ? <Moon className="w-[22px] h-[22px]" /> : <Sun className="w-[22px] h-[22px]" />}
            title="الوضع الليلي"
            description="تغيير ألوان التطبيق لراحة العين"
            control={
              <Switch
                checked={isDark}
                onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
                data-testid="toggle-dark-mode"
              />
            }
          />
        </section>

        {/* About Section */}
        <section className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/50 bg-secondary/20">
            <h3 className="font-bold text-foreground text-base">معلومات التطبيق</h3>
          </div>
          <div className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md shrink-0">
              <span className="font-serif font-bold text-2xl">م</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg">مسبحة – عداد الأذكار</h3>
              <p className="text-sm text-muted-foreground">الإصدار ١.٠.٠</p>
            </div>
          </div>
          <div className="px-5 pb-5 pt-1 flex items-start gap-2.5 text-sm text-muted-foreground">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>تطبيق مصمم خصيصاً للمساعدة في ذكر الله بشكل ميسر وجميل.</span>
          </div>
        </section>

      </div>
    </MobileLayout>
  );
}

function SettingRow({
  icon,
  title,
  description,
  control,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 min-h-[72px]">
      {/* Right side: icon + text */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <span className="font-semibold text-foreground text-[15px] leading-snug">{title}</span>
          <span className="text-xs text-muted-foreground leading-snug mt-0.5 truncate">{description}</span>
        </div>
      </div>
      {/* Left side: toggle */}
      <div className="shrink-0">
        {control}
      </div>
    </div>
  );
}
