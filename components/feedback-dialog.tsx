"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Send, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitFeedback } from "@/lib/api/hooks";
import { toast } from "sonner";

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
}

const feedbackTypes = ["AI", "Notes", "General"];

export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackType, setFeedbackType] = useState("AI");

  const submitFeedbackMutation = useSubmitFeedback();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const result = await submitFeedbackMutation.mutateAsync({
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(result.message);
      setOpen(false);
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback"
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRating(0);
    setHoveredRating(0);
    setComment("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) handleClose();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted/50">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-5 border-b">
          <DialogTitle className="text-lg font-lora font-medium mb-4">
            Share Your Feedback
          </DialogTitle>
          <div className="flex items-center gap-1">
            {feedbackTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFeedbackType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  feedbackType === type
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-5">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm text-foreground font-lora">
                How would you rate your experience?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hoveredRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-opacity duration-150"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          isActive
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground/40 hover:text-muted-foreground/60"
                        }`}
                        strokeWidth={isActive ? 0 : 1.5}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground font-lora">
                Additional Comments
                <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                className="min-h-[120px] font-lora text-sm resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/1000
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitFeedbackMutation.isPending || rating === 0}
            className="font-lora h-9 px-5 disabled:opacity-50"
          >
            {submitFeedbackMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
