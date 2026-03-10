import { useTheme } from "next-themes";
import { MobileLayout } from "@/components/layout";
import { usePreferences } from "@/hooks/use-preferences";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Vibrate, Bell, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { prefs, updatePrefs } = usePreferences();

  const isDark = theme === 'dark';

  return (
    <MobileLayout title="الإعدادات">
      <div className="p-6 flex flex-col gap-6">
        
        {/* Preferences Section */}
        <section className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/20">
            <h3 className="font-bold text-foreground">تفضيلات التطبيق</h3>
          </div>
          <div className="flex flex-col">
            <SettingRow 
              icon={<Vibrate className="w-5 h-5" />}
              title="الاهتزاز عند التسبيح"
              description="تفعيل التنبيه اللمسي مع كل ضغطة"
              control={
                <Switch 
                  checked={prefs.vibrationEnabled} 
                  onCheckedChange={(c) => updatePrefs({ vibrationEnabled: c })} 
                />
              }
            />
            <div className="h-[1px] bg-border/50 mx-4"></div>
            <SettingRow 
              icon={<Bell className="w-5 h-5" />}
              title="تنبيهات المحطات"
              description="تنبيه عند الوصول إلى ٣٣، ٦٦، ٩٩، ١٠٠"
              control={
                <Switch 
                  checked={prefs.milestoneAlertsEnabled} 
                  onCheckedChange={(c) => updatePrefs({ milestoneAlertsEnabled: c })} 
                />
              }
            />
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/20">
            <h3 className="font-bold text-foreground">المظهر</h3>
          </div>
          <div className="flex flex-col">
            <SettingRow 
              icon={isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              title="الوضع الليلي"
              description="تغيير ألوان التطبيق لراحة العين"
              control={
                <Switch 
                  checked={isDark} 
                  onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} 
                />
              }
            />
          </div>
        </section>

        {/* About Section */}
        <section className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden mt-4">
          <div className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md">
              <span className="font-serif font-bold text-xl">ط</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">سبحة - عداد الأذكار</h3>
              <p className="text-sm text-muted-foreground">الإصدار 1.0.0</p>
            </div>
          </div>
          <div className="p-4 bg-secondary/20 border-t border-border/50 text-sm text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4" />
            تطبيق مصمم خصيصاً للمساعدة في ذكر الله بشكل ميسر وجميل.
          </div>
        </section>

      </div>
    </MobileLayout>
  );
}

function SettingRow({ icon, title, description, control }: { icon: React.ReactNode, title: string, description: string, control: React.ReactNode }) {
  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-base">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>
      <div>{control}</div>
    </div>
  );
}
