import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { MobileLayout } from "@/components/layout";
import { usePreferences, toArabicNumerals } from "@/hooks/use-preferences";
import { useAdhkar, useCreateDhikr, useDeleteDhikr } from "@/hooks/use-adhkar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const VIRTUES: Record<string, { repetition: string; virtue: string }> = {
  "سبحان الله": {
    repetition: "١٠٠ مرة قبل طلوع الشمس وقبل غروبها",
    virtue: "كان أفضل من مئة بدنة",
  },
  "الحمد لله": {
    repetition: "١٠٠ مرة قبل طلوع الشمس وقبل غروبها",
    virtue: "كان أفضل من مئة فرس يُحمل عليها في سبيل الله",
  },
  "الله أكبر": {
    repetition: "١٠٠ مرة قبل طلوع الشمس وقبل غروبها",
    virtue: "كان أفضل من عتق مئة رقبة",
  },
  "لا إله إلا الله": {
    repetition: "١٠٠ مرة قبل طلوع الشمس وقبل غروبها",
    virtue: "لم يأت أحد يوم القيامة بعمل أفضل منه إلا من قال مثل قوله أو زاد عليه",
  },
  "لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير": {
    repetition: "١٠٠ مرة قبل طلوع الشمس وقبل غروبها",
    virtue: "لم يأت أحد يوم القيامة بعمل أفضل منه إلا من قال مثل قوله أو زاد عليه",
  },
  "سبحان الله وبحمده": {
    repetition: "١٠٠ مرة في اليوم",
    virtue: "حُطَّت خطاياه وإن كانت مثل زبد البحر",
  },
  "سبحان الله العظيم": {
    repetition: "يُكثر منها",
    virtue: "كلمة حبيبة إلى الرحمن خفيفة على اللسان ثقيلة في الميزان",
  },
};

export default function DhikrList() {
  const { data: adhkar, isLoading } = useAdhkar();
  const { prefs, updatePrefs } = usePreferences();
  const { mutate: createDhikr, isPending: isCreating } = useCreateDhikr();
  const { mutate: deleteDhikr } = useDeleteDhikr();
  const { toast } = useToast();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDhikrText, setNewDhikrText] = useState("");

  const handleSelect = (id: number) => {
    updatePrefs({ activeDhikrId: id, currentCount: 0 });
    toast({ title: "تم تغيير الذكر", description: "تم تصفير العداد للذكر الجديد", duration: 2000 });
  };

  const handleAddCustom = () => {
    if (!newDhikrText.trim()) return;
    createDhikr(
      { text: newDhikrText.trim(), isCustom: true, historicalCount: 0 },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setNewDhikrText("");
          toast({ title: "تمت الإضافة بنجاح" });
        }
      }
    );
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (prefs.activeDhikrId === id) {
      toast({ title: "لا يمكن حذف الذكر النشط", variant: "destructive" });
      return;
    }
    deleteDhikr(id, { onSuccess: () => toast({ title: "تم الحذف بنجاح" }) });
  };

  return (
    <MobileLayout title="الأذكار وفضائلها">
      <div className="p-4 pb-8 flex flex-col gap-4">

        {/* Add Custom Button */}
        <Button
          onClick={() => setShowAddDialog(true)}
          data-testid="button-add-dhikr"
          className="w-full rounded-2xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة ذكر مخصص
        </Button>

        {/* Adhkar Cards */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-3xl animate-pulse"></div>
            ))
          ) : (
            adhkar?.map((dhikr, index) => {
              const isActive = prefs.activeDhikrId === dhikr.id;
              const virtueInfo = VIRTUES[dhikr.text];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  key={dhikr.id}
                  onClick={() => handleSelect(dhikr.id)}
                  data-testid={`card-dhikr-${dhikr.id}`}
                  className={`
                    relative rounded-3xl cursor-pointer transition-all duration-300 border overflow-hidden shadow-sm
                    ${isActive
                      ? 'bg-primary/5 border-primary shadow-md'
                      : 'bg-card border-border/40 hover:border-primary/30 hover:shadow-md'}
                  `}
                >
                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground p-1 rounded-full shadow-sm z-10">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Delete button for custom dhikr */}
                  {dhikr.isCustom && !isActive && (
                    <button
                      onClick={(e) => handleDelete(dhikr.id, e)}
                      data-testid={`button-delete-dhikr-${dhikr.id}`}
                      className="absolute top-3 left-3 text-muted-foreground hover:text-destructive p-1.5 rounded-full hover:bg-destructive/10 transition-colors z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="p-5">
                    {/* Dhikr text */}
                    <h3 className="text-xl font-bold font-serif text-foreground leading-relaxed mb-3 pl-8">
                      {dhikr.text}
                    </h3>

                    {virtueInfo ? (
                      <>
                        {/* Divider */}
                        <div className="h-px bg-border/50 mb-3" />

                        {/* Repetition */}
                        <p className="text-sm text-primary font-semibold mb-1 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {virtueInfo.repetition}
                        </p>

                        {/* Virtue */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {virtueInfo.virtue}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        المجموع: <span className="arabic-numbers font-bold text-foreground">{toArabicNumerals(dhikr.historicalCount)}</span>
                      </p>
                    )}

                    {virtueInfo && (
                      <p className="text-xs text-muted-foreground/70 mt-3 text-left">
                        المجموع: <span className="arabic-numbers">{toArabicNumerals(dhikr.historicalCount)}</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Reference Note */}
        <div className="mt-2 px-4 py-3 rounded-2xl bg-secondary/40 border border-border/30 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            حديث حسن – صحيح الترغيب والترهيب
          </p>
        </div>
      </div>

      {/* Add Custom Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="font-sans rtl sm:max-w-sm w-[90%] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">إضافة ذكر جديد</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={newDhikrText}
              onChange={(e) => setNewDhikrText(e.target.value)}
              placeholder="اكتب الذكر هنا..."
              data-testid="input-new-dhikr"
              className="w-full min-h-[120px] p-4 rounded-xl bg-secondary/30 border border-border text-foreground text-lg font-serif focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              dir="rtl"
            />
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setShowAddDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleAddCustom}
              disabled={isCreating || !newDhikrText.trim()}
            >
              {isCreating ? "جاري الإضافة..." : "حفظ الذكر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
