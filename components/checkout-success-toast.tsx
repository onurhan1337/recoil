"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRef, useEffect } from "react";
import { config } from "@/lib/config";

export function CheckoutSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessed = useRef(false);
  const isSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    if (isSuccess && !hasProcessed.current) {
      hasProcessed.current = true;

      // Show loading toast
      const loadingToast = toast.loading("Activating your Pro subscription...");

      // Sync subscription from Polar
      fetch("/api/subscriptions/sync", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          toast.dismiss(loadingToast);

          if (data.synced && data.plan === "pro") {
            toast.success("Welcome to Pro!", {
              description: `Your subscription has been activated with ${config.plans.pro.monthlyCredits.toLocaleString()} credits.`,
            });

            // Reload to update all UI
            setTimeout(() => window.location.replace("/"), 1000);
          } else {
            toast.info("Subscription synced", {
              description: `Current plan: ${data.plan}`,
            });
            router.replace("/");
          }
        })
        .catch((error) => {
          console.error("Sync error:", error);
          toast.dismiss(loadingToast);
          toast.error("Subscription sync failed", {
            description: "Please refresh the page or contact support.",
          });
          router.replace("/");
        });
    }
  }, [isSuccess, router]);

  return null;
}
