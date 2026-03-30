import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Vercel Cron job: recalculates doctor ratings nightly
// Configured in vercel.json to run at 3 AM daily

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ message: "Supabase not configured, skipping" });
  }

  try {
    const { data: ratings } = await supabase
      .from("reviews")
      .select("doctor_id, rating");

    if (!ratings) {
      return NextResponse.json({ message: "No reviews found" });
    }

    const doctorRatings: Record<string, { sum: number; count: number }> = {};
    for (const r of ratings) {
      if (!doctorRatings[r.doctor_id]) {
        doctorRatings[r.doctor_id] = { sum: 0, count: 0 };
      }
      doctorRatings[r.doctor_id].sum += r.rating;
      doctorRatings[r.doctor_id].count += 1;
    }

    let updated = 0;
    for (const [doctorId, { sum, count }] of Object.entries(doctorRatings)) {
      const avg = Math.round((sum / count) * 10) / 10;
      const { error } = await supabase
        .from("doctors")
        .update({ rating_avg: avg, review_count: count })
        .eq("id", doctorId);

      if (!error) updated++;
    }

    return NextResponse.json({
      message: `Updated ratings for ${updated} doctors`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ratings" }, { status: 500 });
  }
}
