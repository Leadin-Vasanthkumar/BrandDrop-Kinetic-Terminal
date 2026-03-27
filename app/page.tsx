"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    // Clean up the object URL when components unmounts or selectedLogo changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (allowedTypes.includes(file.type)) {
        setSelectedLogo(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setLogoError(null);
      } else {
        setSelectedLogo(null);
        setPreviewUrl(null);
        setLogoError("Please upload an image file (PNG, JPG, SVG, WEBP)");
      }
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLogo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleGenerate = () => {
    if (selectedLogo && selectedTone && businessName.trim()) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        sessionStorage.setItem("uploadedLogo", dataUrl);
        sessionStorage.setItem("businessName", businessName.trim());
        sessionStorage.setItem("tone", selectedTone);
        router.push("/analysing");
      };
      reader.readAsDataURL(selectedLogo);
    }
  };

  const tones = [
    { name: "Bold", desc: "Dominant & Strong" },
    { name: "Minimal", desc: "Clean & Essential" },
    { name: "Playful", desc: "Energetic & Joyful" },
    { name: "Elegant", desc: "Refined & Sophisticated" },
    { name: "Corporate", desc: "Trustworthy & Precise" },
    { name: "Techy", desc: "Future-proof & Kinetic" },
  ];

  const isGenerateDisabled = !selectedLogo || !selectedTone || !businessName.trim();

  return (
    <>
      {/* TopNavBar */}
      <nav className="bg-[#131313] dark:bg-[#131313] fixed top-0 w-full z-50 border-b border-[#2a2a2a]/10">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-[1440px] mx-auto">
          <div className="text-2xl font-bold text-[#39FF14] tracking-tighter font-headline flex items-center gap-3">
            <img src="/logo.png" alt="BrandDrop Logo" className="w-8 h-8 object-contain" />
            BrandDrop
          </div>
          <div className="hidden md:flex gap-8"></div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen flex flex-col justify-center">
        <section className="space-y-12">
          {/* Upload Box */}
          <div className="group relative">
            <div className={`w-full aspect-[21/9] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden rounded-2xl ${
              selectedLogo 
                ? "border-[#39FF14]/30 bg-[#131313]/90" 
                : "border-[#2a2a2a]/30 bg-[#0e0e0e]/50 hover:border-[#39FF14]/50 hover:bg-[#131313]"
            }`}>
              <input 
                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                type="file" 
                accept=".png,.jpg,.jpeg,.svg,.webp"
                onChange={handleFileChange}
              />
              
              {!previewUrl ? (
                <div className="flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <span className="material-symbols-outlined text-5xl mb-4 text-[#39FF14]/50 group-hover:text-[#39FF14] transition-colors">
                    upload_file
                  </span>
                  <h2 className="font-headline text-2xl font-medium text-[#e5e2e1]">
                    Drop your logo here
                  </h2>
                  <p className="font-label text-xs uppercase tracking-widest text-[#e5e2e1]/40 mt-2">
                    SVG, PNG, JPG, WEBP
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-8 group/preview">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-[#39FF14]/5 blur-3xl opacity-0 group-hover/preview:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Image Preview */}
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative group/img-container">
                      <div className="absolute -inset-4 bg-gradient-to-tr from-[#39FF14]/20 via-transparent to-[#39FF14]/20 blur-xl opacity-0 group-hover/img-container:opacity-100 transition-opacity duration-500 rounded-full"></div>
                      <img 
                        src={previewUrl} 
                        alt="Logo preview" 
                        className="max-h-[180px] w-auto object-contain relative transition-transform duration-500 group-hover/preview:scale-[1.02] drop-shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                      />
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <h2 className="font-headline text-lg font-bold text-[#39FF14] flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm">check_circle</span>
                        {selectedLogo?.name}
                      </h2>
                      <p className="font-label text-xs uppercase tracking-[0.2em] text-[#e5e2e1]/40">
                        FILE UPLOADED SUCCESSFULLY
                      </p>
                    </div>

                    {/* Remove Action */}
                    <button 
                      onClick={removeLogo}
                      className="absolute top-4 right-4 z-30 p-2 bg-[#1a1a1a]/80 backdrop-blur-md rounded-full border border-[#2a2a2a] text-[#e5e2e1]/60 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 opacity-0 group-hover/preview:opacity-100 translate-y-2 group-hover/preview:translate-y-0"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            {logoError && (
              <p className="text-red-500 font-label text-xs mt-3 flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-sm">warning</span>
                {logoError}
              </p>
            )}
          </div>

          {/* Form Section */}
          <div className="space-y-10">
            {/* Business Name */}
            <div className="space-y-3">
              <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Business Name</label>
              <input
                className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/20 py-4 px-0 text-xl font-headline focus:ring-0 focus:border-primary-container transition-all placeholder:text-surface-variant focus:shadow-[0_4px_10px_-4px_rgba(57,255,20,0.3)] outline-none"
                placeholder="Enter your brand name"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-4">
              <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Brand Tone</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tones.map((tone) => {
                  const isActive = selectedTone === tone.name;
                  return (
                    <button
                      key={tone.name}
                      onClick={() => setSelectedTone(tone.name)}
                      className={`flex flex-col items-start p-5 bg-surface-container-low border transition-all text-left group ${
                        isActive 
                          ? "border-primary-container border-2" 
                          : "border-outline-variant/10 hover:border-primary-container/30"
                      }`}
                    >
                      <span className={`font-headline font-bold text-lg mb-1 ${isActive ? "text-primary-container" : "text-on-surface"}`}>
                        {tone.name}
                      </span>
                      <span
                        className={`font-label text-[10px] ${
                          isActive ? "text-primary-container/70" : "text-on-surface-variant group-hover:text-primary-container"
                        } transition-colors`}
                      >
                        {tone.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`w-full py-6 font-headline font-bold text-lg tracking-tight uppercase transition-all flex items-center justify-center gap-3 ${
                isGenerateDisabled
                  ? "bg-primary-container/20 text-on-primary/30 cursor-not-allowed"
                  : "bg-primary-container text-on-primary hover:bg-secondary active:scale-[0.98] kinetic-glow"
              }`}
            >
              Generate Brand Guidelines
              <span className="material-symbols-outlined text-xl">bolt</span>
            </button>
          </div>
        </section>

        {/* Explainer Section */}
        <section className="mt-40 border-t border-outline-variant/10 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <span className="font-headline text-5xl font-extrabold text-primary-container/20">01</span>
              <h3 className="font-headline text-xl font-bold text-on-surface">Upload Assets</h3>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                Simply drop your current logo or mark into our neural processor.
              </p>
            </div>
            <div className="space-y-4">
              <span className="font-headline text-5xl font-extrabold text-primary-container/20">02</span>
              <h3 className="font-headline text-xl font-bold text-on-surface">Select Tone</h3>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                Define the kinetic energy and emotional resonance of your brand identity.
              </p>
            </div>
            <div className="space-y-4">
              <span className="font-headline text-5xl font-extrabold text-primary-container/20">03</span>
              <h3 className="font-headline text-xl font-bold text-on-surface">Direct Output</h3>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                Receive a high-precision terminal of guidelines and color systems.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0e0e0e] border-t border-[#2a2a2a]/20 flex flex-col md:flex-row justify-between items-center w-full px-8 py-6 mt-20 gap-4">
        <div className="font-label text-[10px] uppercase tracking-widest text-[#e5e2e1]/40">
          © 2024 BrandDrop. Kinetic Terminal Systems.
        </div>
        <div className="flex gap-6 font-label text-[10px] uppercase tracking-widest">
          <a className="text-[#e5e2e1]/40 hover:text-[#39FF14] transition-opacity" href="#">Privacy</a>
          <a className="text-[#e5e2e1]/40 hover:text-[#39FF14] transition-opacity" href="#">Terms</a>
          <a className="text-[#e5e2e1]/40 hover:text-[#39FF14] transition-opacity" href="#">API</a>
        </div>
      </footer>
    </>
  );
}
