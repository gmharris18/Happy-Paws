import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// CORS headers for development
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
  try {
    const rows = await query(
      "SELECT TrainerID, FName, LName, Email, Specialization, YearsOfExperience FROM Trainer ORDER BY TrainerID DESC"
    );

    return NextResponse.json(rows, { headers: corsHeaders });
  } catch (err) {
    console.error("Trainers GET error", err);
    return NextResponse.json(
      { message: "Unable to load trainers" },
      { status: 500, headers: corsHeaders }
    );
  }
}

