// import React from "react";
import { PageHeader, Card } from "../components/ui.jsx";
import { notificationsList } from "../data/mockData.js";

export default function Notifications() {
  return (
    <div>
      <PageHeader
        eyebrow="Communications"
        title="Notifications"
        description="System and platform notifications relevant to the superadmin — incidents, admin changes, and configuration updates."
      />

      <Card className="divide-y divide-black/[0.05] overflow-hidden">
        {notificationsList.map((n) => (
          <div key={n.id} className={`flex items-start gap-4 p-5 ${!n.read ? "bg-gold/[0.04]" : ""}`}>
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? "bg-gold" : "bg-black/10"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-black">{n.title}</p>
                <span className="text-xs text-black/35 shrink-0">{n.time}</span>
              </div>
              <p className="text-sm text-black/50 mt-1 leading-relaxed">{n.body}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
