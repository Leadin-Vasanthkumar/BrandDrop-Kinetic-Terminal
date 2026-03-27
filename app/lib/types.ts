export interface BrandResult {
  brandName: string;
  tone: string;
  colorPalette: {
    primary: { hex: string; name: string; usage: string };
    secondary: { hex: string; name: string; usage: string };
    accent: { hex: string; name: string; usage: string };
    background: { hex: string; name: string; usage: string };
    surface: { hex: string; name: string; usage: string };
    text: { hex: string; name: string; usage: string };
  };
  typography: {
    headline: { font: string; weight: string; usage: string };
    body: { font: string; weight: string; usage: string };
    label: { font: string; weight: string; usage: string };
  };
  personality: {
    tags: string[];
    description: string;
  };
  logoUsage: {
    clearSpace: string;
    approvedBackgrounds: string[];
    donts: string[];
  };
  spacing: {
    baseUnit: string;
    increments: string[];
    maxContentWidth: string;
  };
  elevation: {
    base: string;
    surface: string;
    card: string;
    elevated: string;
  };
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
  brandDocument: string;
}
