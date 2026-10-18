import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let textToTranslate = "";

  try {
    const { text, targetLang } = await req.json();
    textToTranslate = text || "";

    if (!textToTranslate || !targetLang || targetLang === "fr" || targetLang === "ar") {
      return NextResponse.json({ translatedText: textToTranslate });
    }

    // 1. Essai avec Google Translate Client API (le plus stable pour EN, ES, DE)
    try {
      const googleRes = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`,
        { signal: AbortSignal.timeout(4000) }
      );

      if (googleRes.ok) {
        const googleData = await googleRes.json();
        // Concaténation de tous les segments de traduction renvoyés par l'API Google
        const translatedText = googleData?.[0]?.map((item: any) => item[0]).join("") || "";
        if (translatedText) {
          return NextResponse.json({ translatedText });
        }
      }
    } catch {
      // Échec silencieux, passage au plan B
    }

    // 2. Plan de secours : Lingva API
    try {
      const lingvaRes = await fetch(
        `https://lingva.ml/api/v1/fr/${targetLang}/${encodeURIComponent(textToTranslate)}`,
        { signal: AbortSignal.timeout(4000) }
      );

      if (lingvaRes.ok) {
        const lingvaData = await lingvaRes.json();
        if (lingvaData?.translation) {
          return NextResponse.json({ translatedText: lingvaData.translation });
        }
      }
    } catch {
      // Échec silencieux
    }

    // En cas de panne totale, renvoi du texte original pour éviter de casser l'affichage
    return NextResponse.json({ translatedText: textToTranslate });
  } catch (error) {
    return NextResponse.json({ translatedText: textToTranslate });
  }
}