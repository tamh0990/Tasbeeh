import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { MobileLayout } from "@/components/layout";
import { usePreferences, toArabicNumerals } from "@/hooks/use-preferences";
import { useAdhkar, useUpdateDhikr } from "@/hooks/use-adhkar";
import { useCreateSession } from "@/hooks/use-sessions";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { prefs, updatePrefs } = usePreferences();
  const { data: adhkar, isLoading } = useAdhkar();
  const { mutate: updateDhikr } = useUpdateDhikr();
  const { mutate: createSession } = useCreateSession();
  const { toast } = useToast();
  
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const milestoneTimeout = useRef<NodeJS.Timeout>();

  // Determine active dhikr
  const defaultDhikr = adhkar?.[0];
  const activeDhikr = adhkar?.find(a => a.id === prefs.activeDhikrId) || defaultDhikr;

  // Set default if none selected
  useEffect(() => {
    if (!prefs.activeDhikrId && defaultDhikr) {
      updatePrefs({ activeDhikrId: defaultDhikr.id });
    }
  }, [defaultDhikr, prefs.activeDhikrId]);

  const handleTap = () => {
    const newCount = prefs.currentCount + 1;
    updatePrefs({ currentCount: newCount });

    // Haptic feedback
    if (prefs.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Milestone Check
    if (prefs.milestoneAlertsEnabled && [33, 66, 99, 100].includes(newCount)) {
      if (prefs.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Distinct pattern for milestone
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
    if (prefs.currentCount === 0) return;
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    if (activeDhikr && prefs.currentCount > 0) {
      // Save session
      createSession({
        dhikrId: activeDhikr.id,
        count: prefs.currentCount
      });
      
      // Update historical total
      updateDhikr({
        id: activeDhikr.id,
        historicalCount: (activeDhikr.historicalCount || 0) + prefs.currentCount
      });
    }

    updatePrefs({ currentCount: 0 });
    setShowResetDialog(false);
    toast({
      title: "تم تصفير العداد",
      description: "تم حفظ تقدمك بنجاح",
      duration: 2000,
    });
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
      <div className="flex flex-col h-full items-center justify-between py-10 px-6 relative">
        
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

        {/* Top Header - Current Dhikr */}
        <div className="text-center space-y-3 z-10 w-full mt-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium border border-border/50"
          >
            الذكر الحالي
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-relaxed font-serif px-4 h-24 flex items-center justify-center">
            {activeDhikr?.text || "سبحان الله"}
          </h2>
        </div>

        {/* Center - Huge Tap Button */}
        <div className="flex-1 flex items-center justify-center w-full z-10 my-8">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleTap}
            className="relative w-72 h-72 rounded-full flex flex-col items-center justify-center tap-button-gradient text-primary-foreground shadow-2xl overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
            style={{ boxShadow: 'var(--shadow-soft), inset 0 4px 20px rgba(255,255,255,0.15)' }}
          >
            {/* Ripple effect rings */}
            <div className="absolute inset-2 rounded-full border border-primary-foreground/20"></div>
            <div className="absolute inset-6 rounded-full border border-primary-foreground/10"></div>
            
            <span className="text-8xl font-bold tracking-tight arabic-numbers z-10 drop-shadow-md">
              {toArabicNumerals(prefs.currentCount)}
            </span>
            
            <span className="text-primary-foreground/70 font-medium mt-2 z-10 text-lg">
              اضغط للتسبيح
            </span>
          </motion.button>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex justify-between items-center z-10 mb-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground font-medium">المجموع الكلي</p>
            <p className="text-lg font-bold text-foreground arabic-numbers">
              {toArabicNumerals((activeDhikr?.historicalCount || 0) + prefs.currentCount)}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={prefs.currentCount === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all
              ${prefs.currentCount > 0 
                ? 'bg-card text-foreground hover:bg-secondary border border-border/50' 
                : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'}
            `}
          >
            <RefreshCw className="w-5 h-5" />
            تصفير
          </motion.button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="font-sans text-right rtl sm:max-w-sm w-[90%] rounded-3xl p-6">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">هل تريد تصفير العداد؟</DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              سيتم حفظ جلستك الحالية ({toArabicNumerals(prefs.currentCount)} تسبيحة) وإضافتها للمجموع الكلي.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 rounded-xl h-12 text-base font-bold" onClick={() => setShowResetDialog(false)}>
              إلغاء
            </Button>
            <Button className="flex-1 rounded-xl h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmReset}>
              تأكيد التصفير
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
