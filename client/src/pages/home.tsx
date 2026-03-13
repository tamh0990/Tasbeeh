import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronDown } from "lucide-react";
import { MobileLayout } from "@/components/layout";
import { usePreferences, toArabicNumerals } from "@/hooks/use-preferences";
import { useAdhkar, useUpdateDhikr } from "@/hooks/use-adhkar";
import { useCreateSession } from "@/hooks/use-sessions";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

export default function Home() {
  const { prefs, updatePrefs } = usePreferences();
  const { data: adhkar, isLoading } = useAdhkar();
  const { mutate: updateDhikr } = useUpdateDhikr();
  const { mutate: createSession } = useCreateSession();
  const { toast } = useToast();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDhikrPicker, setShowDhikrPicker] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const milestoneTimeout = useRef<NodeJS.Timeout>();

  const defaultDhikr = adhkar?.[0];
  const activeDhikr = adhkar?.find(a => a.id === prefs.activeDhikrId) || defaultDhikr;

  useEffect(() => {
    if (!prefs.activeDhikrId && defaultDhikr) {
      updatePrefs({ activeDhikrId: defaultDhikr.id });
    }
  }, [defaultDhikr, prefs.activeDhikrId]);

  const handleTap = () => {
    const newCount = prefs.currentCount + 1;
    updatePrefs({ currentCount: newCount });

    if (prefs.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (prefs.milestoneAlertsEnabled && [33, 66, 99, 100].includes(newCount)) {
      if (prefs.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setShowMilestone(true);
      toast({
        title: "ما شاء الله!",
        description: `أكملت ${toArabicNumerals(newCount)} تسبيحة`,
        className: "bg-primary text-primary-foreground border-none font-sans rtl",
        duration: 2000,
      });
      if (milestoneTimeout.current) clearTimeout(milestoneTimeout.current);
      milestoneTimeout.current = setTimeout(() => setShowMilestone(false), 1500);
    }
  };

  const handleReset = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    if (activeDhikr && prefs.currentCount > 0) {
      createSession({ dhikrId: activeDhikr.id, count: prefs.currentCount });
    }
    // Reset both counter AND total historical count
    if (activeDhikr) {
      updateDhikr(
        { id: activeDhikr.id, historicalCount: 0 },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/adhkar'] }) }
      );
    }
    updatePrefs({ currentCount: 0 });
    setShowResetDialog(false);
    toast({
      title: "تم تصفير العداد والمجموع",
      description: "تم إعادة الضبط بنجاح",
      duration: 2000,
    });
  };

  const handleSelectDhikr = (id: number) => {
    updatePrefs({ activeDhikrId: id, currentCount: 0 });
    setShowDhikrPicker(false);
    toast({ title: "تم تغيير الذكر", duration: 1500 });
  };

  if (isLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex flex-col h-full items-center justify-between py-8 px-6 relative">

        {/* Milestone Flash Overlay */}
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent z-0 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Top Header - Current Dhikr + Change Button */}
        <div className="text-center space-y-3 z-10 w-full mt-2">
          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDhikrPicker(true)}
            data-testid="button-change-dhikr"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 text-secondary-foreground text-sm font-medium border border-border/50 hover:bg-secondary transition-colors"
          >
            <span>تغيير الذكر</span>
            <ChevronDown className="w-4 h-4 opacity-60" />
          </motion.button>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed font-serif px-4 min-h-[4rem] flex items-center justify-center text-center">
            {activeDhikr?.text || "سبحان الله"}
          </h2>
        </div>

        {/* Center - Huge Tap Button */}
        <div className="flex-1 flex items-center justify-center w-full z-10 my-6">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleTap}
            data-testid="button-tap-tasbeeh"
            className="relative w-64 h-64 rounded-full flex flex-col items-center justify-center tap-button-gradient text-primary-foreground shadow-2xl overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
            style={{ boxShadow: 'var(--shadow-soft), inset 0 4px 20px rgba(255,255,255,0.15)' }}
          >
            <div className="absolute inset-2 rounded-full border border-primary-foreground/20"></div>
            <div className="absolute inset-6 rounded-full border border-primary-foreground/10"></div>
            <span className="text-8xl font-bold tracking-tight arabic-numbers z-10 drop-shadow-md">
              {toArabicNumerals(prefs.currentCount)}
            </span>
            <span className="text-primary-foreground/70 font-medium mt-1 z-10 text-base">
              اضغط للتسبيح
            </span>
          </motion.button>
        </div>

        {/* Bottom - Total + Reset */}
        <div className="w-full flex justify-between items-center z-10 mb-4">
          <div className="flex flex-col items-start gap-0.5">
            <p className="text-xs text-muted-foreground font-medium">المجموع الكلي</p>
            <p className="text-2xl font-bold text-foreground arabic-numbers">
              {toArabicNumerals((activeDhikr?.historicalCount || 0) + prefs.currentCount)}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            data-testid="button-reset"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-md transition-all bg-card text-foreground hover:bg-secondary border border-border/50"
          >
            <RefreshCw className="w-5 h-5" />
            تصفير
          </motion.button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="font-sans text-right rtl sm:max-w-sm w-[90%] rounded-3xl p-6">
          <DialogHeader className="items-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              هل تريد تصفير العداد والمجموع الكلي؟
            </DialogTitle>
            <DialogDescription className="text-center text-sm mt-2">
              سيتم تصفير العداد الحالي ({toArabicNumerals(prefs.currentCount)} تسبيحة) والمجموع الكلي معاً.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-5">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12 text-base font-bold"
              onClick={() => setShowResetDialog(false)}
              data-testid="button-reset-cancel"
            >
              إلغاء
            </Button>
            <Button
              className="flex-1 rounded-xl h-12 text-base font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={confirmReset}
              data-testid="button-reset-confirm"
            >
              نعم
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dhikr Picker Dialog */}
      <Dialog open={showDhikrPicker} onOpenChange={setShowDhikrPicker}>
        <DialogContent className="font-sans text-right rtl sm:max-w-sm w-[92%] rounded-3xl p-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center mb-1">اختر الذكر</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {adhkar?.map((dhikr) => {
              const isActive = prefs.activeDhikrId === dhikr.id;
              return (
                <button
                  key={dhikr.id}
                  onClick={() => handleSelectDhikr(dhikr.id)}
                  data-testid={`button-select-dhikr-${dhikr.id}`}
                  className={`w-full text-right px-4 py-3 rounded-2xl font-serif text-base font-semibold leading-relaxed transition-all duration-200 border
                    ${isActive
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-secondary/30 border-border/30 text-foreground hover:bg-secondary/60'
                    }`}
                >
                  {dhikr.text}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
