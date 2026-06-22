// backend/src/services/flattenForNarration.ts
import { AnalysisResult } from './groq'; // adjust path to match translate.ts's import

/**
 * Converts a structured AnalysisResult into one continuous, naturally-spoken
 * narration string. YarnGPT reads prose, not JSON — so this is what actually
 * gets sent to the TTS endpoint, regardless of language.
 *
 * Per-language connector phrases keep transitions sounding native rather than
 * like a literal English narration template with words swapped in.
 */
const CONNECTORS: Record<
    string,
    { markersIntro: string; trendPrefix: string; checklistIntro: string }
> = {
    ENGLISH: {
        markersIntro: "Now let's go through your results one by one.",
        trendPrefix: 'Compared to your last report,',
        checklistIntro: 'Here are some questions you might want to ask your doctor:',
    },
    PIDGIN: {
        markersIntro: 'Now make we waka through your results one by one.',
        trendPrefix: 'If we compare am to your last report,',
        checklistIntro: 'See some questions you fit ask your doctor:',
    },
    YORUBA: {
        markersIntro: 'Jẹ́ ká wo àwọn ìyọrísí rẹ ní ọ̀kọ̀ọ̀kan.',
        trendPrefix: 'Bí a bá fi wé ìròyìn tó kọjá,',
        checklistIntro: 'Ìwọ̀nyí ni àwọn ìbéérè tó o lè bi dókítà rẹ:',
    },
    IGBO: {
        markersIntro: "Ka anyị lebanụ anya na nsonaazụ gị n'otu n'otu.",
        trendPrefix: 'Iji ya tụnyere akụkọ gara aga,',
        checklistIntro: 'Ndị a bụ ajụjụ ị nwere ike ịjụ dọkịta gị:',
    },
    HAUSA: {
        markersIntro: 'Yanzu bari mu duba sakamakon ku daya bayan daya.',
        trendPrefix: 'Idan aka kwatanta da rahoton ku na baya,',
        checklistIntro: 'Ga wasu tambayoyin da za ku iya yiwa likitan ku:',
    },
};

export function flattenForNarration(
    analysis: AnalysisResult,
    language: keyof typeof CONNECTORS = 'ENGLISH',
): string {
    const c = CONNECTORS[language] ?? CONNECTORS.ENGLISH;
    const parts: string[] = [];

    parts.push(analysis.summary);

    if (analysis.cycleContext) {
        parts.push(analysis.cycleContext);
    }

    if (analysis.markerExplanations?.length) {
        parts.push(c.markersIntro);
        for (const m of analysis.markerExplanations) {
            parts.push(`${m.markerName}. ${m.plainExplanation}`);
            if (m.trendNote) {
                parts.push(`${c.trendPrefix} ${m.trendNote}`);
            }
        }
    }

    if (analysis.advocacyChecklist?.length) {
        parts.push(c.checklistIntro);
        parts.push(analysis.advocacyChecklist.join('. '));
    }

    return parts.filter(Boolean).join(' ');
}
