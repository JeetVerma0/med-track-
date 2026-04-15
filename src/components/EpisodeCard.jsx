import { CalendarDays, ChevronRight } from "lucide-react";
import { Card } from "./Ui";
import { formatDate } from "../utils/date";

export function EpisodeCard({ title, date, symptoms = [], onClick, loadingSymptoms = false }) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="p-4 transition hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4" />
              <span>{formatDate(date) || "—"}</span>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {loadingSymptoms ? "Loading symptoms..." : symptoms?.length ? symptoms.slice(0, 4).join(", ") : "No symptoms listed"}
              {!loadingSymptoms && symptoms?.length > 4 ? "…" : ""}
            </div>
          </div>
          <ChevronRight className="mt-1 h-5 w-5 text-gray-400" />
        </div>
      </Card>
    </button>
  );
}

