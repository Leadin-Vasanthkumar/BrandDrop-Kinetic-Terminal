"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandResult } from "@/app/lib/types";

// Helper: generate tint shades from a hex color
function generateShades(hex: string, count: number = 9): string[] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1);
    const nr = Math.round(r * factor);
    const ng = Math.round(g * factor);
    const nb = Math.round(b * factor);
    const blendR = Math.round(nr + (255 - nr) * factor * 0.5);
    const blendG = Math.round(ng + (255 - ng) * factor * 0.5);
    const blendB = Math.round(nb + (255 - nb) * factor * 0.5);
    shades.push(`rgb(${blendR}, ${blendG}, ${blendB})`);
  }
  return shades;
}

function ColorSwatch({ label, hex, colorName, usage }: { label: string; hex: string; colorName: string; usage: string }) {
  const shades = generateShades(hex);
  return (
    <div className="bg-[#1C1C1C] rounded-2xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-label text-zinc-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-label font-bold text-zinc-400">{hex}</span>
      </div>
      <div
        className="h-24 rounded-xl border border-white/5 shadow-inner"
        style={{ backgroundColor: hex }}
      ></div>
      <div className="space-y-1">
        <p className="text-[10px] font-label text-zinc-300 font-bold tracking-wide">{colorName}</p>
        <p className="text-[10px] font-body text-zinc-500 leading-tight">{usage}</p>
      </div>
      <div className="flex h-2 w-full rounded-sm overflow-hidden mt-1">
        {shades.map((shade, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: shade }}></div>
        ))}
      </div>
    </div>
  );
}

function FontPreview({ role, font, weight, usage, fontsLoaded }: {
  role: string;
  font: string;
  weight: string;
  usage: string;
  fontsLoaded: boolean;
}) {
  const fontFamily = `'${font}', sans-serif`;
  return (
    <div className="bg-[#1C1C1C] rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
      <div>
        <span className="text-[10px] font-label text-zinc-500 uppercase tracking-widest mb-1 block">{role}</span>
        <span className="text-[11px] font-label text-primary-container/60 block mb-4">{font} — {weight}</span>
      </div>
      <div
        className="text-7xl text-on-surface transition-all duration-700 my-4"
        style={{
          fontFamily: fontsLoaded ? fontFamily : "system-ui, sans-serif",
          fontWeight: parseInt(weight) || 400,
          opacity: fontsLoaded ? 1 : 0.4,
          letterSpacing: "-0.02em",
        }}
      >
        Aa
      </div>
      <p className="text-[10px] font-body text-zinc-400 leading-relaxed">{usage}</p>
    </div>
  );
}

export default function Results() {
  const [brandResult, setBrandResult] = useState<BrandResult | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("brandResult");
    const logo = sessionStorage.getItem("uploadedLogo");

    if (logo) {
      setLogoUrl(logo);
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BrandResult;
        setBrandResult(parsed);

        // Dynamically load all unique Google Fonts
        const fonts = [
          parsed.typography.headline.font,
          parsed.typography.body.font,
          parsed.typography.label.font,
        ];
        const uniqueFonts = Array.from(new Set(fonts));
        const fontQuery = uniqueFonts
          .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`)
          .join("&");

        const link = document.createElement("link");
        link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
        link.rel = "stylesheet";
        link.onload = () => setFontsLoaded(true);
        document.head.appendChild(link);

        // Fallback: mark fonts as loaded after 2s in case onload doesn't fire
        const timeout = setTimeout(() => setFontsLoaded(true), 2000);
        return () => clearTimeout(timeout);
      } catch (err) {
        console.error("Failed to parse brand result", err);
      }
    }
  }, []);

  const handleCopy = async () => {
    if (!brandResult) return;
    try {
      await navigator.clipboard.writeText(brandResult.brandDocument);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = brandResult.brandDocument;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!brandResult) return;
    const blob = new Blob([brandResult.brandDocument], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandResult.brandName.replace(/\s+/g, "-").toLowerCase()}-brand-guidelines.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    sessionStorage.removeItem("uploadedLogo");
    sessionStorage.removeItem("businessName");
    sessionStorage.removeItem("tone");
    sessionStorage.removeItem("brandResult");
  };

  if (!brandResult) {
    return (
      <div className="bg-background text-on-surface font-body min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-primary-container animate-pulse">hourglass_top</span>
          <p className="font-label text-sm text-zinc-500 uppercase">Loading brand systems...</p>
          <Link href="/" className="text-primary-container font-label text-xs uppercase hover:underline">
            ← Start Over
          </Link>
        </div>
      </div>
    );
  }

  const { colorPalette, typography, personality, logoUsage, spacing, elevation, dosAndDonts } = brandResult;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary min-h-screen">
      <header className="pt-8 px-6 max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter text-[#39FF14] uppercase font-headline flex items-center gap-3">
          <img src="/logo.png" alt="BrandDrop Logo" className="w-8 h-8 object-contain" />
          BrandDrop
        </div>
        <Link
          href="/"
          onClick={handleStartOver}
          className="group flex items-center gap-2 px-4 py-2 tracking-widest text-[10px] font-label uppercase font-bold text-zinc-400 bg-white/5 border border-white/10 rounded-full hover:border-[#39FF14]/40 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[14px]">restart_alt</span>
          Extract New Brand
        </Link>
      </header>

      <main className="pt-16 pb-20 px-6 max-w-[1400px] mx-auto space-y-16">
        {/* Brand Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="max-w-3xl">
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">
              {brandResult.brandName}
            </h1>
            <p className="font-body text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              {personality.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {personality.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 font-label text-[10px] uppercase tracking-wider text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right flex flex-col gap-1 items-end">
            <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest">
              Generated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </header>

        {/* Masonry-style Grid Layout */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: Colors & Core Brand (Left - 4 spans) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Logo Core */}
            <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 flex flex-col min-h-[300px] justify-center items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl"></div>
              {/* Checkerboard subtle pattern to signal transparency */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23ffffff'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23ffffff'/%3E%3C/svg%3E\")" }}></div>
              {logoUrl ? (
                <img src={logoUrl} alt="Core Logo" className="max-w-full max-h-56 object-contain z-10" style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.8))' }} />
              ) : (
                <span className="text-zinc-700 font-headline">No Logo Extracted</span>
              )}
              <span className="absolute bottom-6 left-6 font-label text-[10px] uppercase tracking-widest text-zinc-600">Core Mark</span>
            </div>

            {/* Colors */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-container mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">palette</span> Color Architecture
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <ColorSwatch label="Primary" hex={colorPalette.primary.hex} colorName={colorPalette.primary.name} usage={colorPalette.primary.usage} />
                <ColorSwatch label="Accent" hex={colorPalette.accent.hex} colorName={colorPalette.accent.name} usage={colorPalette.accent.usage} />
                <ColorSwatch label="Secondary" hex={colorPalette.secondary.hex} colorName={colorPalette.secondary.name} usage={colorPalette.secondary.usage} />
                <ColorSwatch label="Text" hex={colorPalette.text.hex} colorName={colorPalette.text.name} usage={colorPalette.text.usage} />
                <ColorSwatch label="Background" hex={colorPalette.background.hex} colorName={colorPalette.background.name} usage={colorPalette.background.usage} />
                <ColorSwatch label="Surface" hex={colorPalette.surface.hex} colorName={colorPalette.surface.name} usage={colorPalette.surface.usage} />
              </div>
            </div>

          </div>

          {/* COLUMN 2: Typography & Systems (Middle - 4 spans) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Typography */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-container mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">title</span> Typographic Hierarchy
              </h2>
              <div className="space-y-4">
                <FontPreview role="Headline" {...typography.headline} fontsLoaded={fontsLoaded} />
                <FontPreview role="Body" {...typography.body} fontsLoaded={fontsLoaded} />
                <FontPreview role="Label" {...typography.label} fontsLoaded={fontsLoaded} />
              </div>
            </div>

            {/* Logo Usage Rules */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 space-y-5">
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-container mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">crop_free</span> Logo Usage
              </h2>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-label block mb-1">Clear Space</span>
                <p className="text-xs text-zinc-300 font-body">{logoUsage.clearSpace}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-label block mb-2">Approved Backgrounds</span>
                <div className="flex flex-wrap gap-2">
                  {logoUsage.approvedBackgrounds.map((bg, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 font-label">{bg}</span>
                  ))}
                </div>
              </div>
              {logoUsage.donts?.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-label block mb-2">Don'ts</span>
                  <ul className="space-y-1">
                    {logoUsage.donts.map((d, i) => (
                      <li key={i} className="text-xs text-zinc-400 font-body flex gap-2 items-start"><span className="text-error text-[10px] mt-0.5">✕</span> {d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

          {/* COLUMN 3: Data Systems & Previews (Right - 4 spans) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Spatial Systems */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-container mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">space_dashboard</span> Spatial System
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#1C1C1C] p-4 rounded-xl">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-label mb-1">Base Unit</span>
                  <span className="text-xl font-headline text-zinc-200">{spacing.baseUnit}</span>
                </div>
                <div className="bg-[#1C1C1C] p-4 rounded-xl">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-label mb-1">Max Width</span>
                  <span className="text-xl font-headline text-zinc-200">{spacing.maxContentWidth}</span>
                </div>
              </div>

              <div className="bg-[#1C1C1C] p-4 rounded-xl">
                <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-label mb-3">Increments</span>
                <div className="flex flex-wrap gap-2">
                  {spacing.increments.map((inc, i) => (
                    <div key={i} className="px-2 py-1 bg-black/40 border border-white/5 rounded text-[10px] text-zinc-400 font-label">{inc}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Elevation System */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-container mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">layers</span> Elevation Profile
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{ backgroundColor: elevation.base }}>
                  <span className="text-[10px] text-zinc-400 font-label uppercase">Base</span>
                  <span className="text-[10px] text-zinc-500 font-label">{elevation.base}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 shadow-md" style={{ backgroundColor: elevation.surface }}>
                  <span className="text-[10px] text-zinc-400 font-label uppercase">Surface</span>
                  <span className="text-[10px] text-zinc-500 font-label">{elevation.surface}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 shadow-lg" style={{ backgroundColor: elevation.card }}>
                  <span className="text-[10px] text-zinc-400 font-label uppercase">Card</span>
                  <span className="text-[10px] text-zinc-500 font-label">{elevation.card}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/20 shadow-2xl" style={{ backgroundColor: elevation.elevated }}>
                  <span className="text-[10px] text-zinc-400 font-label uppercase">Elevated</span>
                  <span className="text-[10px] text-zinc-500 font-label">{elevation.elevated}</span>
                </div>
              </div>
            </div>

            {/* Do's and Don'ts */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6">
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-container mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">rule</span> Visual Rules
              </h2>
              
              <div className="space-y-5">
                <div>
                  <h3 className="text-[10px] text-primary-container font-label uppercase tracking-widest mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">check_circle</span> Do</h3>
                  <ul className="space-y-2">
                    {dosAndDonts.dos.map((d, i) => (
                      <li key={i} className="text-xs text-zinc-400 font-body pl-3 border-l hover:border-primary-container transition-colors border-white/10">{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-[10px] text-error font-label uppercase tracking-widest mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">cancel</span> Don't</h3>
                  <ul className="space-y-2">
                    {dosAndDonts.donts.map((d, i) => (
                      <li key={i} className="text-xs text-zinc-500 font-body pl-3 border-l hover:border-error transition-colors border-white/10">{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Brand Document Section */}
        <section className="flex flex-col gap-6 pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">System Document</h2>
                <span className="bg-primary-container/10 text-primary-container px-2 py-1 text-[10px] font-label font-bold uppercase tracking-tighter rounded">
                  Markdown Ready
                </span>
              </div>
              <p className="text-zinc-500 font-body text-sm max-w-xl">
                The complete AI-extracted technical document. Copy this into any AI builder workspace or save it as your source-of-truth brand rulebook.
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-container text-on-primary font-label text-xs uppercase font-bold px-8 py-4 active:scale-95 transition-all rounded-lg"
              >
                <span className="material-symbols-outlined text-sm">
                  {copyFeedback ? "check" : "content_copy"}
                </span>
                {copyFeedback ? "Copied Blueprint!" : "Copy Full Document"}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-outline-variant text-on-surface font-label text-xs uppercase font-bold px-8 py-4 hover:bg-surface-container-high transition-colors rounded-lg"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Save .md
              </button>
            </div>
          </div>

          <div className="flex justify-start">
            <Link
              className="group flex items-center gap-2 font-headline text-sm uppercase tracking-widest text-zinc-500 hover:text-primary-container transition-all"
              href="/"
              onClick={handleStartOver}
            >
              <span className="material-symbols-outlined text-sm flex items-center justify-center bg-white/5 w-6 h-6 rounded-full group-hover:bg-primary-container group-hover:text-black transition-all">arrow_back</span>
              Extract New Brand
            </Link>
          </div>

          <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden relative">
            {/* Header bar */}
            <div className="border-b border-white/5 flex items-center justify-between px-8 py-3 bg-[#111]/80">
               <span className="font-label text-[10px] tracking-widest uppercase text-zinc-600">brand-blueprint.md</span>
               <span className="font-label text-[10px] tracking-widest uppercase text-zinc-700">raw markdown — paste as-is</span>
            </div>
            <textarea
              className="w-full h-[600px] bg-transparent p-8 font-mono text-sm leading-[1.8] text-zinc-400 focus:outline-none kinetic-scroll resize-none"
              readOnly
              value={brandResult.brandDocument}
              spellCheck={false}
            ></textarea>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-20 pb-12 flex flex-col items-center justify-center gap-4 border-t border-white/5">
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-600">© 2024 BrandDrop Ecosystem</p>
        </footer>
      </main>
    </div>
  );
}
