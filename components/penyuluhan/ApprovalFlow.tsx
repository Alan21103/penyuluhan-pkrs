"use client";

import { useState } from "react";
import { penyuluhanService } from "@/services/penyuluhan.service";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "draft" | "selesai";

interface StatusToggleProps {
  penyuluhanId: string;
  currentStatus: Status;
}

export default function StatusToggle({
  penyuluhanId,
  currentStatus,
}: StatusToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: Status) => {
    setLoading(true);
    const { error } = await penyuluhanService.updateStatus(penyuluhanId, newStatus);

    if (!error) {
      router.refresh();
    }
    setLoading(false);
  };

  if (currentStatus === "selesai") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Status</h3>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">
            Penyuluhan sudah selesai
          </p>
        </div>
        <Button
          variant="outline"
          id="btn-kembali-draft"
          onClick={() => updateStatus("draft")}
          disabled={loading}
          className="w-full rounded-xl gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {loading ? "Memproses..." : "Kembalikan ke Draft"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-3">Status</h3>
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-3">
        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-700">
          Masih draft — belum selesai
        </p>
      </div>
      <Button
        id="btn-tandai-selesai"
        onClick={() => updateStatus("selesai")}
        disabled={loading}
        className="w-full rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700"
      >
        <CheckCircle2 className="w-4 h-4" />
        {loading ? "Memproses..." : "Tandai Selesai"}
      </Button>
    </div>
  );
}
