import { useState } from "react";
import { Plus, Trash2, Check, Search } from "lucide-react";
import { motion } from "framer-motion";
import { MobileLayout } from "@/components/layout";
import { usePreferences, toArabicNumerals } from "@/hooks/use-preferences";
import { useAdhkar, useCreateDhikr, useDeleteDhikr } from "@/hooks/use-adhkar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function DhikrList() {
  const { data: adhkar, isLoading } = useAdhkar();
  const { prefs, updatePrefs } = usePreferences();
  const { mutate: createDhikr, isPending: isCreating } = useCreateDhikr();
  const { mutate: deleteDhikr } = useDeleteDhikr();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDhikrText, setNewDhikrText] = useState("");

  const filteredAdhkar = adhkar?.filter(a => a.text.includes(search)) || [];

  const handleSelect = (id: number) => {
    updatePrefs({ activeDhikrId: id, currentCount: 0 }); // Reset current count when changing
    toast({
      title: "تم تغيير الذكر",
      description: "تم تصفير العداد للذكر الجديد",
      duration: 2000,
    });
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
    e.stopPropagation(); // Prevent selection
    if (prefs.activeDhikrId === id) {
      toast({ title: "لا يمكن حذف الذكر النشط", variant: "destructive" });
      return;
    }
    deleteDhikr(id, {
      onSuccess: () => toast({ title: "تم الحذف بنجاح" })
    });
  };

  return (
    <MobileLayout title="قائمة الأذكار">
      <div className="p-4 flex flex-col gap-4">
        
        {/* Search & Add Bar */}
        <div className="flex gap-2 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن ذكر..." 
              className="pl-4 pr-10 py-6 rounded-2xl bg-card border-border/50 shadow-sm text-base focus-visible:ring-primary"
            />
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="w-14 h-[50px] rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shrink-0"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3 pb-8">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-2xl animate-pulse"></div>
            ))
          ) : filteredAdhkar.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد نتائج مطابقة
            </div>
          ) : (
            filteredAdhkar.map((dhikr, index) => {
              const isActive = prefs.activeDhikrId === dhikr.id;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={dhikr.id}
                  onClick={() => handleSelect(dhikr.id)}
                  className={`
                    relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border
                    ${isActive 
                      ? 'bg-primary/5 border-primary shadow-md' 
                      : 'bg-card border-border/40 hover:border-primary/30 shadow-sm hover:shadow-md'}
                  `}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold font-serif text-foreground leading-relaxed">
                        {dhikr.text}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">
                        المجموع: <span className="arabic-numbers">{toArabicNumerals(dhikr.historicalCount)}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      {isActive && (
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      
                      {dhikr.isCustom && !isActive && (
                        <button 
                          onClick={(e) => handleDelete(dhikr.id, e)}
                          className="text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
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
