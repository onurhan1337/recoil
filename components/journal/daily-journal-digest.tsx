"use client";

import { useMemo, useState } from "react";
import { format, startOfDay, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/utils";
import { groupByTimeOfDay, timeOfDayConfig } from "@/lib/utils/journal";
import {
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  useJournalEntries,
} from "@/lib/api/hooks";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PromoteEntryDialog } from "./promote-entry-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JournalEntry } from "@/lib/api/types";

interface DailyJournalDigestProps {
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
}

function JournalEntryCard({
  entry,
  onDelete,
}: {
  entry: JournalEntry;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [showActions, setShowActions] = useState(false);
  const updateMutation = useUpdateJournalEntry();

  const handleSave = async () => {
    if (!editContent.trim()) {
      toast.error("Empty.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: entry.id,
        content: editContent.trim(),
      });
      setIsEditing(false);
      toast.success("Saved.");
    } catch (err) {
      toast.error("Failed.");
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border-2 border-border/30 bg-card/50 journal-gentle-shadow p-5 space-y-3 animate-scale-in">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="min-h-[100px] resize-none leading-loose text-sm"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setEditContent(entry.content);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            whileHover={{
              scale: 1.005,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
              },
            }}
            className="group relative rounded-lg border border-border/35 bg-card p-5 space-y-4 transition-all duration-200 hover:border-border/50"
          >
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-lora text-foreground/90 tracking-wide">
              {entry.content}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border/10">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <Clock className="h-3 w-3" />
                <span className="tracking-wide">
                  {formatDate(entry.created_at)}
                </span>
              </div>
              <div className="relative flex items-center gap-1">
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-8 sm:right-7 flex items-center gap-1.5 sm:gap-1 z-10 bg-card/95 backdrop-blur-sm rounded-md px-1 py-1 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none"
                    >
                      <motion.button
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md hover:bg-muted/60 active:bg-muted/80 transition-colors duration-150 touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                          setIsEditing(true);
                        }}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                          delay: 0.05,
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md hover:bg-muted/60 active:bg-muted/80 transition-colors duration-150 touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                          setIsPromoteDialogOpen(true);
                        }}
                        title="Make it searchable"
                      >
                        <Sparkles className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                          delay: 0.1,
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md hover:bg-destructive/5 hover:text-destructive/80 active:bg-destructive/10 active:text-destructive transition-colors duration-150 touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                          onDelete();
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-8 w-8 sm:h-6 sm:w-6 flex items-center justify-center rounded-md hover:bg-muted/60 active:bg-muted/80 transition-all duration-200 touch-manipulation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                >
                  <ChevronLeft
                    className={cn(
                      "h-4 w-4 sm:h-3.5 sm:w-3.5 text-muted-foreground/70 transition-transform duration-200",
                      showActions && "rotate-180"
                    )}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={() => setIsEditing(true)}
            className="cursor-pointer"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setIsPromoteDialogOpen(true)}
            className="cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Make it searchable</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={onDelete}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <PromoteEntryDialog
        entry={entry}
        open={isPromoteDialogOpen}
        onOpenChange={setIsPromoteDialogOpen}
        onSuccess={() => {
          setIsPromoteDialogOpen(false);
        }}
      />
    </>
  );
}

export function DailyJournalDigest({
  selectedDate,
  onDateSelect,
}: DailyJournalDigestProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { data: entries = [] } = useJournalEntries(dateString);

  const entriesByTime = useMemo(() => groupByTimeOfDay(entries), [entries]);

  const sortedTimeOfDays = useMemo(() => {
    return (["morning", "afternoon", "evening", "night"] as const).filter(
      (time) => entriesByTime[time].length > 0
    );
  }, [entriesByTime]);

  const deleteMutation = useDeleteJournalEntry();

  const handleDelete = async (entryId: string) => {
    if (!confirm("Delete this entry?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(entryId);
      toast.success("Removed.");
    } catch (err) {
      toast.error("Failed.");
    }
  };

  const isCurrentDay = isToday(selectedDate);
  const today = startOfDay(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect?.(startOfDay(date));
      setCalendarOpen(false);
    }
  };

  const handlePreviousDay = () => {
    const prevDay = startOfDay(new Date(selectedDate));
    prevDay.setDate(prevDay.getDate() - 1);
    onDateSelect?.(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = startOfDay(new Date(selectedDate));
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= today) {
      onDateSelect?.(nextDay);
    }
  };

  return (
    <Card className="border border-border/40 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviousDay}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "text-base font-lora font-normal tracking-wide hover:opacity-70 transition-opacity",
                    isCurrentDay && "text-foreground"
                  )}
                >
                  {format(selectedDate, "MMMM d, yyyy")}
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > today}
                  showOutsideDays={false}
                  className="w-full font-lora"
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextDay}
              disabled={isCurrentDay}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5 bg-card">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground leading-relaxed font-lora">
              {isCurrentDay ? "A blank page." : "Nothing yet."}
            </p>
          </div>
        ) : (
          <Accordion
            type="multiple"
            className="w-full bg-card"
            defaultValue={sortedTimeOfDays}
          >
            {sortedTimeOfDays.map((timeOfDay, index) => {
              const config = timeOfDayConfig[timeOfDay];
              const Icon = config.icon;
              const timeEntries = entriesByTime[timeOfDay];

              return (
                <AccordionItem
                  key={timeOfDay}
                  value={timeOfDay}
                  className="border-none bg-card animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <h3 className="text-xs font-normal">{config.label}</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-6 pt-2 bg-card">
                    {timeEntries.map((entry, entryIndex) => (
                      <div
                        key={entry.id}
                        style={{ animationDelay: `${entryIndex * 50}ms` }}
                        className="animate-fade-in px-1"
                      >
                        <JournalEntryCard
                          entry={entry}
                          onDelete={() => handleDelete(entry.id)}
                        />
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
