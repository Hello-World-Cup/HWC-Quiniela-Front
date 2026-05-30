"use client";

import { useState } from "react";
import { toast } from "sonner";
import { allMatches } from "@/data/bracket";
import { submitKnockoutPredictions } from "@/lib/actions/predictions";
import type { KnockoutPick } from "@/lib/store/predictions";

interface Props {
  knockoutPicks: Record<string, KnockoutPick>;
}

export function SaveQuinielaButton({ knockoutPicks }: Props) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const picks = allMatches
        .filter((m) => {
          const p = knockoutPicks[m.id];
          return p != null && Number.isFinite(p.homeScore) && Number.isFinite(p.awayScore);
        })
        .map((m) => ({
          bracketId: m.id,
          fifaNumber: m.fifaNumber,
          home: knockoutPicks[m.id].homeScore,
          away: knockoutPicks[m.id].awayScore,
        }));

      if (picks.length === 0) {
        toast.error("No hay pronósticos para guardar");
        return;
      }

      const result = await submitKnockoutPredictions(picks);

      if (result.ok) {
        toast.success(`¡Quiniela guardada! ${result.submitted} pronósticos enviados.`);
      } else if (result.submitted > 0) {
        toast.warning(`${result.submitted} guardados, ${result.errors.length} no pudieron enviarse.`);
      } else {
        toast.error(result.errors[0]?.message ?? "Error al guardar la quiniela");
      }
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving}
      className="border-2 border-ink bg-gold px-10 py-4 font-display text-base font-bold uppercase tracking-[0.18em] text-ink transition-all hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving ? "Guardando..." : "Guardar Quiniela"}
    </button>
  );
}
