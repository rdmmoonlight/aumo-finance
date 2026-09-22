"use client";

import { useState, useEffect } from "react";
import {
  IconRobot,
  IconBolt,
  IconCashBanknote,
  IconTrendingUp,
  IconChartPie,
  IconBulb,
  IconTrash,
  IconSend,
  IconSparkles,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// CATATAN: Jika backend sudah menyediakan endpoint AI di generatedApi.ts,
// uncomment import di bawah ini:
// import { useGetApiV1DashboardQuery } from "@/lib/generatedApi";

interface ChatMessage {
  isUser: boolean;
  text: string;
}

function formatBold(text: string) {
  return text.split(/(\*\*.*?\スカ*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // CONTOH INTEGRASI RTK QUERY:
  // Anda bisa memanfaatkan data dashboard nyata sebagai konteks AI Live Summary
  // const { data: dashboardData } = useGetApiV1DashboardQuery({});

  useEffect(() => {
    const t = setTimeout(() => {
      setSummaryText(
        "Likuiditas dan posisi kas Anda dalam kondisi sangat stabil dengan surplus positif untuk periode ini. Beban operasional masih berada di bawah ambang batas risiko.",
      );
      setSummaryLoaded(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText ?? userInput;
    const message = textToSend.trim();
    if (!message || isLoading) return;

    setMessages((prev) => [...prev, { isUser: true, text: message }]);
    if (!promptText) setUserInput("");
    setIsLoading(true);

    // Simulasi penanganan pesan (Ganti dengan RTK Query Mutation kelak)
    await new Promise((r) => setTimeout(r, 1000));

    let aiReply = "";
    const low = message.toLowerCase();
    if (
      low.includes("cash") ||
      low.includes("kas") ||
      low.includes("liquidity")
    ) {
      aiReply =
        "**Analisis Likuiditas:** Total setara kas saat ini adalah **Rp 45.500.000**. Rasio cakupan sangat baik untuk 3 bulan ke depan.";
    } else if (
      low.includes("overspending") ||
      low.includes("expense") ||
      low.includes("beban")
    ) {
      aiReply =
        "**Peringatan Pengeluaran:** Pengeluaran terbesar berada pada **Gaji & Sewa Kantor**. Belum terdeteksi adanya anomali.";
    } else if (
      low.includes("net income") ||
      low.includes("revenue") ||
      low.includes("profit") ||
      low.includes("laba")
    ) {
      aiReply =
        "**Proyeksi Pendapatan:** Pendapatan kotor sebesar **Rp 85.000.000** dengan perkiraan laba bersih **Rp 32.400.000**.";
    } else {
      aiReply =
        "Berdasarkan data periode aktif, stabilitas keuangan konsisten. Apakah Anda ingin audit mendalam pada jurnal penyesuaian?";
    }

    setMessages((prev) => [...prev, { isUser: false, text: aiReply }]);
    setIsLoading(false);
  };

  const presets = [
    {
      icon: IconCashBanknote,
      title: "Kesehatan Kas",
      desc: "Cek keamanan kas liquid",
      prompt: "Bagaimana posisi kas dan likuiditas saya saat ini?",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: IconTrendingUp,
      title: "Deteksi Pengeluaran",
      desc: "Cek beban tertinggi",
      prompt: "Apakah ada area pengeluaran berlebih yang perlu direview?",
      color: "text-red-500 bg-red-500/10",
    },
    {
      icon: IconChartPie,
      title: "Proyeksi Laba",
      desc: "Estimasi laba bersih",
      prompt: "Berapa estimasi laba bersih dan tren pendapatan periode ini?",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: IconBulb,
      title: "Tips Efisiensi",
      desc: "Saran penghematan",
      prompt:
        "Berikan 3 langkah konkret untuk mengoptimalkan kinerja keuangan.",
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <IconRobot size={26} className="text-primary" /> AI Financial
          Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analisis bisnis, deteksi pengeluaran, dan saran keuangan instan.
        </p>
      </div>

      {/* LIVE SUMMARY */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/30 text-primary"
            >
              <IconBolt size={12} /> RINGKASAN LANGSUNG
            </Badge>
            {summaryLoaded && (
              <span className="text-xs text-muted-foreground">
                Diperbarui baru saja
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!summaryLoaded ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Menganalisis arus kas & transaksi aktif Anda...
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{summaryText}</p>
          )}
        </CardContent>
      </Card>

      {/* PRESETS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            Rekomendasi Pertanyaan Cepat
          </h3>
          <span className="text-xs text-muted-foreground">
            Klik untuk langsung bertanya
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => (
            <Card
              key={p.title}
              className="cursor-pointer hover:bg-accent/50 transition-colors group"
              onClick={() => handleSendMessage(p.prompt)}
            >
              <CardContent className="p-4">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg grid place-items-center mb-3",
                    p.color,
                  )}
                >
                  <p.icon size={18} />
                </div>
                <div className="font-medium text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {p.desc}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <Card className="flex flex-col h-[500px]">
        <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <IconSparkles size={16} className="text-primary" /> Percakapan
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setMessages([])}
          >
            <IconTrash size={14} /> Bersihkan
          </Button>
        </CardHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <IconRobot size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  Klik rekomendasi pertanyaan di atas atau ketik pertanyaan di
                  bawah.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.isUser ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm",
                  )}
                >
                  {formatBold(m.text)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  AI sedang menganalisis data...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t flex gap-2">
          <Input
            placeholder="Tanyakan sesuatu atau minta analisis khusus..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="h-10"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className="h-10 px-4 gap-1.5"
          >
            <IconSend size={16} /> Kirim
          </Button>
        </div>
      </Card>
    </div>
  );
}
