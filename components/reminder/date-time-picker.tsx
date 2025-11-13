"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isBefore, startOfToday } from "date-fns";
import type { DateTimePickerProps } from "./types";

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled,
}: DateTimePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    setCalendarOpen(false);
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3 flex-1">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="justify-between font-normal"
              disabled={disabled}
            >
              {date ? format(date, "PPP") : "Select date"}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
              disabled={(date) => isBefore(date, startOfToday())}
              className="w-full"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3 w-32">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Select value={time} onValueChange={onTimeChange} disabled={disabled}>
          <SelectTrigger id="time-picker">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {Array.from({ length: 96 }, (_, i) => {
              const hours = Math.floor(i / 4);
              const minutes = (i % 4) * 15;
              const timeString = `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;

              // Only show times from current time onwards if selected date is today
              // This comparison happens in the user's local timezone, which is correct
              // because we want to prevent selecting past times in their local time
              if (
                date &&
                format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
              ) {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const optionMinutes = hours * 60 + minutes;

                if (optionMinutes <= currentMinutes) {
                  return null;
                }
              }

              return (
                <SelectItem key={timeString} value={timeString}>
                  {timeString}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
