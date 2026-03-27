import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { logoBase64, businessName, tone } = await req.json();

    if (!logoBase64 || !businessName || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Extract the base64 data and mime type from the data URL
    const matches = logoBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const systemPrompt = `You are BrandDrop, an expert brand identity extraction engine. 
Your sole job is to analyze a business logo and generate a 
complete, accurate brand identity system document.

You will receive:
1. A logo image
2. The business name
3. The desired brand tone (one of: Bold, Minimal, Playful, 
   Elegant, Corporate, Techy)

EXTRACTION RULES:

COLOR:
- Extract the 2-3 dominant colors directly from the logo image
- These become the Primary and Secondary brand colors
- Build the rest of the palette around them:
  - Background: deep dark neutral (for dark-first brands) or 
    near-white (for light brands) — decide based on tone
  - Surface: slightly lighter than background for cards/panels
  - Text: high contrast against background
  - Accent: a complementary or analogous color to the primary 
    for hover states and highlights
- Every color must have: hex code, name, and usage rule
- Never invent colors that are not present in or complementary 
  to the logo

TYPOGRAPHY:
- Recommend exactly 3 fonts, all must be from this verified 
  Google Fonts list:
  Headline options: Anton, Bebas Neue, Playfair Display, 
  Syne, DM Serif Display, Space Grotesk, Clash Display, 
  Cormorant Garamond, Barlow Condensed, Oswald
  Body options: Inter, DM Sans, Manrope, Plus Jakarta Sans, 
  Nunito, Lora, Source Serif 4, Outfit, Raleway
  Label options: DM Sans, Space Grotesk, Lato, IBM Plex Mono, 
  Geist Mono, Karla, Figtree
- Match font personality to brand tone:
  Bold/Techy → compressed heavy headline, clean geometric body
  Minimal → light weight headline, highly readable body
  Playful → rounded friendly headline, casual body
  Elegant/Corporate → serif headline, refined body
- Every font must have: name, weight, and specific use case

BRAND PERSONALITY:
- 3-5 single word personality tags extracted from the logo's 
  visual character
- 2-3 sentence brand essence description
- Do NOT write a tagline — you don't know enough about the 
  business to do this accurately

LOGO USAGE RULES:
- Minimum clear space recommendation
- Approved background colors for logo placement
- What NOT to do with the logo (stretch, recolor, add effects)

SPACING SYSTEM:
- Base unit (8px recommended)
- List common spacing increments
- Max content width recommendation

ELEVATION SYSTEM:
- Define 4 surface levels with hex codes:
  Base → Surface → Card → Elevated
- This applies to both dark and light mode variants

DO'S AND DON'TS:
- 3 specific do's based on the brand's visual character
- 3 specific don'ts based on common mistakes for this brand type

OUTPUT FORMAT:
Respond ONLY with valid JSON. No text before or after. 
No markdown code fences. Structure:

{
  "brandName": "",
  "tone": "",
  "colorPalette": {
    "primary": {"hex": "", "name": "", "usage": ""},
    "secondary": {"hex": "", "name": "", "usage": ""},
    "accent": {"hex": "", "name": "", "usage": ""},
    "background": {"hex": "", "name": "", "usage": ""},
    "surface": {"hex": "", "name": "", "usage": ""},
    "text": {"hex": "", "name": "", "usage": ""}
  },
  "typography": {
    "headline": {"font": "", "weight": "", "usage": ""},
    "body": {"font": "", "weight": "", "usage": ""},
    "label": {"font": "", "weight": "", "usage": ""}
  },
  "personality": {
    "tags": [],
    "description": ""
  },
  "logoUsage": {
    "clearSpace": "",
    "approvedBackgrounds": [],
    "donts": []
  },
  "spacing": {
    "baseUnit": "",
    "increments": [],
    "maxContentWidth": ""
  },
  "elevation": {
    "base": "",
    "surface": "",
    "card": "",
    "elevated": ""
  },
  "dosAndDonts": {
    "dos": [],
    "donts": []
  },
  "brandDocument": ""
}

The brandDocument field should be a complete markdown brand 
identity document combining all the above into a readable, 
professional format a designer or developer can reference.`;

    const userPrompt = `Analyze this brand:
- Business Name: ${businessName}
- Desired Brand Tone: ${tone}

Please analyze the attached logo image and generate a complete brand identity system matching the exact JSON structure.`;

    const result = await model.generateContent([
      { text: systemPrompt + "\n\n" + userPrompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
    ]);

    const responseText = result.response.text();

    // Clean up any markdown fences if present
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const brandResult = JSON.parse(cleanJson);

    return NextResponse.json(brandResult);
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate brand identity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
