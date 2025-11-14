import type { DISCQuestion, DISCResponse } from "@shared/schema";

export interface DISCScores {
  dScore: number;
  iScore: number;
  sScore: number;
  cScore: number;
  primaryProfile: "D" | "I" | "S" | "C";
}

export interface DISCCompatibility {
  compatibilityScore: number;
  matchDetails: {
    D: { candidate: number; ideal: number; difference: number };
    I: { candidate: number; ideal: number; difference: number };
    S: { candidate: number; ideal: number; difference: number };
    C: { candidate: number; ideal: number; difference: number };
  };
}

export function calculateDISCScores(
  questions: DISCQuestion[],
  responses: DISCResponse[]
): DISCScores {
  const responsesMap = new Map(
    responses.map((r) => [r.questionId, r.selectedValue])
  );

  const profiles = { D: 0, I: 0, S: 0, C: 0 };
  const questionCounts = { D: 0, I: 0, S: 0, C: 0 };

  for (const question of questions) {
    const response = responsesMap.get(question.id);
    if (response !== undefined && question.profileType in profiles) {
      const profileType = question.profileType as "D" | "I" | "S" | "C";
      profiles[profileType] += response;
      questionCounts[profileType]++;
    }
  }

  const dScore = questionCounts.D > 0 
    ? Math.round((profiles.D / (questionCounts.D * 5)) * 100) 
    : 0;
  const iScore = questionCounts.I > 0 
    ? Math.round((profiles.I / (questionCounts.I * 5)) * 100) 
    : 0;
  const sScore = questionCounts.S > 0 
    ? Math.round((profiles.S / (questionCounts.S * 5)) * 100) 
    : 0;
  const cScore = questionCounts.C > 0 
    ? Math.round((profiles.C / (questionCounts.C * 5)) * 100) 
    : 0;

  const scores = { D: dScore, I: iScore, S: sScore, C: cScore };
  const primaryProfile = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as "D" | "I" | "S" | "C";

  return {
    dScore,
    iScore,
    sScore,
    cScore,
    primaryProfile,
  };
}

export function calculateCompatibility(
  candidateScores: { dScore: number; iScore: number; sScore: number; cScore: number },
  idealProfile: { D?: number; I?: number; S?: number; C?: number }
): DISCCompatibility {
  const ideal = {
    D: idealProfile.D || 0,
    I: idealProfile.I || 0,
    S: idealProfile.S || 0,
    C: idealProfile.C || 0,
  };

  const candidate = {
    D: candidateScores.dScore,
    I: candidateScores.iScore,
    S: candidateScores.sScore,
    C: candidateScores.cScore,
  };

  const differences = {
    D: Math.abs(candidate.D - ideal.D),
    I: Math.abs(candidate.I - ideal.I),
    S: Math.abs(candidate.S - ideal.S),
    C: Math.abs(candidate.C - ideal.C),
  };

  const totalIdeal = ideal.D + ideal.I + ideal.S + ideal.C;
  if (totalIdeal === 0) {
    return {
      compatibilityScore: 100,
      matchDetails: {
        D: { candidate: candidate.D, ideal: ideal.D, difference: differences.D },
        I: { candidate: candidate.I, ideal: ideal.I, difference: differences.I },
        S: { candidate: candidate.S, ideal: ideal.S, difference: differences.S },
        C: { candidate: candidate.C, ideal: ideal.C, difference: differences.C },
      },
    };
  }

  const weightedDifference =
    (differences.D * (ideal.D / totalIdeal) +
      differences.I * (ideal.I / totalIdeal) +
      differences.S * (ideal.S / totalIdeal) +
      differences.C * (ideal.C / totalIdeal));

  const compatibilityScore = Math.max(0, Math.round(100 - weightedDifference));

  return {
    compatibilityScore,
    matchDetails: {
      D: { candidate: candidate.D, ideal: ideal.D, difference: differences.D },
      I: { candidate: candidate.I, ideal: ideal.I, difference: differences.I },
      S: { candidate: candidate.S, ideal: ideal.S, difference: differences.S },
      C: { candidate: candidate.C, ideal: ideal.C, difference: differences.C },
    },
  };
}

export function getProfileDescription(profile: "D" | "I" | "S" | "C"): string {
  const descriptions = {
    D: "Dominância - Orientado para resultados, assertivo, competitivo e direto. Gosta de desafios e tomar decisões rápidas.",
    I: "Influência - Entusiasta, comunicativo, persuasivo e sociável. Valoriza relacionamentos e trabalho em equipe.",
    S: "Estabilidade - Paciente, leal, confiável e cooperativo. Prefere ambientes estáveis e trabalho consistente.",
    C: "Conformidade - Analítico, preciso, sistemático e orientado a detalhes. Valoriza qualidade e procedimentos.",
  };
  return descriptions[profile];
}

export function generateAccessToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}
