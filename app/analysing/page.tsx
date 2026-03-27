"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Analysing() {
  const router = useRouter();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [apiDone, setApiDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiCalledRef = useRef(false);

  useEffect(() => {
    const logo = sessionStorage.getItem("uploadedLogo");
    setLogoUrl(logo);

    // Prevent double-calling in React strict mode
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;

    // Fire the real API call
    const callApi = async () => {
      try {
        const logoBase64 = sessionStorage.getItem("uploadedLogo");
        const businessName = sessionStorage.getItem("businessName");
        const tone = sessionStorage.getItem("tone");

        if (!logoBase64 || !businessName || !tone) {
          setError("Missing required inputs. Please go back and fill in all fields.");
          return;
        }

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoBase64, businessName, tone }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to generate brand identity");
        }

        const brandResult = await response.json();
        sessionStorage.setItem("brandResult", JSON.stringify(brandResult));
        setApiDone(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      }
    };

    callApi();
  }, []);

  // Timer for visual progress — runs independently of API
  useEffect(() => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setTimeElapsed(elapsed);
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Navigate when API is done and enough animation time has passed
  useEffect(() => {
    if (apiDone && timeElapsed >= 4000) {
      router.push("/results");
    }
  }, [apiDone, timeElapsed, router]);

  // If API finishes before min time, keep animating until min time
  // If API takes longer, pause at 90%
  const getProgress = () => {
    if (apiDone) return 100;
    if (error) return timeElapsed > 0 ? Math.min((timeElapsed / 5000) * 50, 50) : 0;
    // Max out at 90% while waiting for API
    return Math.min((timeElapsed / 10000) * 90, 90);
  };

  const progress = getProgress();
  
  // Step progression: while waiting for API, steps advance based on time
  // Once API is done, all steps complete
  const getActiveStep = () => {
    if (apiDone) return 4; // All complete
    if (error) return Math.min(Math.floor(timeElapsed / 2500), 1);
    return Math.min(Math.floor(timeElapsed / 2500), 3); // Max at step 3 (0-indexed) while waiting
  };

  const currentStep = getActiveStep();

  const steps = [
    "Reading logo colors",
    "Extracting brand personality",
    "Generating font pairings",
    "Building your prompt"
  ];

  const handleRetry = () => {
    setError(null);
    setTimeElapsed(0);
    apiCalledRef.current = false;
    window.location.reload();
  };

  return (
    <main className="w-full min-h-screen max-w-md px-8 flex flex-col items-center justify-center mx-auto overflow-hidden bg-background relative">
      {/* Analysis Core */}
      <div className="relative mb-16 flex justify-center">
        <div className="absolute inset-0 bg-primary-container rounded-lg blur-[60px] pulse-layer opacity-20"></div>
        <div className="relative z-10 bg-surface-container-low border border-outline-variant/10 rounded-lg flex items-center justify-center neon-glow p-8 min-w-[12rem] min-h-[12rem]">
          <img
            alt="Brand logo being analyzed"
            className="max-w-xs max-h-48 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            src={logoUrl || "/favicon.ico"}
          />
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="w-full space-y-6 mb-12">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index && !error;
          const isUpcoming = currentStep < index;

          return (
            <div key={index} className={`flex items-center gap-4 transition-opacity duration-500 ${isUpcoming ? 'opacity-30' : 'opacity-100'}`}>
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full border border-primary-container flex items-center justify-center bg-primary-container/10">
                  <span className="material-symbols-outlined text-[14px] text-primary-container font-bold">check</span>
                </div>
              ) : isActive ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary-container flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-outline flex items-center justify-center"></div>
              )}
              
              <span className={
                isCompleted ? "font-label text-sm uppercase tracking-wider text-on-surface-variant line-through opacity-50" :
                isActive ? "font-headline text-lg font-bold text-primary-container tracking-tight" :
                "font-label text-sm uppercase tracking-wider text-on-surface"
              }>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error State */}
      {error && (
        <div className="w-full mb-8 p-4 bg-error-container/10 border border-error/20 rounded-lg text-center space-y-4">
          <p className="text-error font-label text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-primary-container text-on-primary font-label text-xs uppercase font-bold px-6 py-3 active:scale-95 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="w-full">
        <div className="w-full h-[2px] bg-surface-container-highest overflow-hidden">
          <div
            className="h-full bg-primary-container shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-4 flex justify-center">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
            {error ? "An error occurred." : apiDone ? "Complete!" : "Analyzing your brand identity..."}
          </span>
        </div>
      </div>

      {/* Footer Identity */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="font-headline text-primary-container font-bold tracking-tighter text-sm uppercase flex items-center gap-2">
            <img src="/logo.png" alt="BrandDrop" className="w-4 h-4 object-contain" />
            BrandDrop
          </span>
          <div className="w-1 h-1 bg-outline-variant rounded-full"></div>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40">
            Kinetic Terminal v1.02
          </span>
        </div>
      </div>
    </main>
  );
}
