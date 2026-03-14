import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ConversionRow = {
  converted: boolean | null;
  called: boolean | null;
};

type PageEventRow = {
  page_path: string | null;
};

type SessionAttributionRow = {
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

type DeviceRow = {
  device_type: string | null;
};

type FormEventRow = {
  event_type: string;
  event_data: unknown;
};

type DailyStatRow = {
  page_views: number | null;
  phone_clicks: number | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily stats
    const { data: dailyStats, error: dailyError } = await supabaseAdmin
      .from("analytics_daily_stats")
      .select("*")
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (dailyError) throw dailyError;

    // Get total sessions
    const { count: totalSessions } = await supabaseAdmin
      .from("analytics_sessions")
      .select("*", { count: "exact", head: true })
      .gte("first_seen", startDate.toISOString());

    // Get conversion stats
    const { data: conversionStats } = await supabaseAdmin
      .from("analytics_sessions")
      .select("converted, called")
      .gte("first_seen", startDate.toISOString());

    const conversionRows = (conversionStats || []) as ConversionRow[];
    const conversions = conversionRows.filter((s) =>
      Boolean(s.converted),
    ).length;
    const phoneCalls = conversionRows.filter((s) => Boolean(s.called)).length;

    // Get top pages
    const { data: topPages } = await supabaseAdmin
      .from("analytics_events")
      .select("page_path")
      .eq("event_type", "page_view")
      .gte("created_at", startDate.toISOString());

    const pageViews: Record<string, number> = {};
    ((topPages || []) as PageEventRow[]).forEach((event) => {
      if (!event.page_path) return;
      pageViews[event.page_path] = (pageViews[event.page_path] || 0) + 1;
    });

    const topPagesArray = Object.entries(pageViews)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Get referrer sources
    const { data: sessions } = await supabaseAdmin
      .from("analytics_sessions")
      .select("referrer, utm_source, utm_medium, utm_campaign")
      .gte("first_seen", startDate.toISOString());

    const referrerSources: Record<string, number> = {};
    ((sessions || []) as SessionAttributionRow[]).forEach((session) => {
      if (session.utm_source) {
        const key = `${session.utm_source} / ${session.utm_medium || "none"}`;
        referrerSources[key] = (referrerSources[key] || 0) + 1;
      } else if (session.referrer) {
        try {
          const url = new URL(session.referrer);
          referrerSources[url.hostname] =
            (referrerSources[url.hostname] || 0) + 1;
        } catch {
          referrerSources["Unknown"] = (referrerSources["Unknown"] || 0) + 1;
        }
      } else {
        referrerSources["Direct"] = (referrerSources["Direct"] || 0) + 1;
      }
    });

    const topReferrers = Object.entries(referrerSources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get device breakdown
    const { data: deviceData } = await supabaseAdmin
      .from("analytics_sessions")
      .select("device_type")
      .gte("first_seen", startDate.toISOString());

    const devices: Record<string, number> = {};
    ((deviceData || []) as DeviceRow[]).forEach((session) => {
      if (session.device_type) {
        devices[session.device_type] = (devices[session.device_type] || 0) + 1;
      }
    });

    const deviceBreakdown = Object.entries(devices).map(([type, count]) => ({
      type,
      count,
    }));

    // Get form funnel stats
    const { data: formEvents } = await supabaseAdmin
      .from("analytics_events")
      .select("event_type, event_data")
      .in("event_type", ["form_start", "form_step", "form_complete"])
      .gte("created_at", startDate.toISOString());

    const formRows = (formEvents || []) as FormEventRow[];
    const formStarts = formRows.filter(
      (e) => e.event_type === "form_start",
    ).length;
    const formCompletes = formRows.filter(
      (e) => e.event_type === "form_complete",
    ).length;
    const conversionRate =
      formStarts > 0 ? ((formCompletes / formStarts) * 100).toFixed(1) : "0.0";

    // Calculate summary metrics
    const dailyRows = (dailyStats || []) as DailyStatRow[];
    const totalPageViews = dailyRows.reduce(
      (sum, day) => sum + (day.page_views || 0),
      0,
    );
    const totalPhoneClicks = dailyRows.reduce(
      (sum, day) => sum + (day.phone_clicks || 0),
      0,
    );

    return NextResponse.json({
      summary: {
        totalSessions: totalSessions || 0,
        totalPageViews,
        conversions,
        phoneCalls: totalPhoneClicks,
        formStarts,
        formCompletes,
        conversionRate,
      },
      dailyStats: dailyStats || [],
      topPages: topPagesArray,
      topReferrers,
      deviceBreakdown,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
