"use client";
import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  accentColor?: string;
  children: ReactNode;
}

export default function ToolPage({ title, subtitle, icon, accentColor = "#00d4ff", children }: Props) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>{icon}</div>
          <div>
            <h1 style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>{title}</h1>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>{subtitle}</p>
          </div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accentColor}, transparent)`, borderRadius: 2 }} />
      </div>
      {children}
    </div>
  );
}
