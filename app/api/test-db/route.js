import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    // Test basic connection
    const result = await query("SELECT 1 as test");
    
    // Get table counts to verify data is loaded
    const counts = await query(`
      SELECT 
        (SELECT COUNT(*) FROM Customer) as customers,
        (SELECT COUNT(*) FROM Trainer) as trainers,
        (SELECT COUNT(*) FROM Employee) as employees,
        (SELECT COUNT(*) FROM Pet) as pets,
        (SELECT COUNT(*) FROM Class) as classes,
        (SELECT COUNT(*) FROM Booking) as bookings
    `);

    return NextResponse.json({
      connected: true,
      message: "Database connection successful",
      tableCounts: counts[0] || {}
    });
  } catch (err) {
    console.error("Database test error", err);
    return NextResponse.json(
      {
        connected: false,
        message: "Database connection failed",
        error: err.message
      },
      { status: 500 }
    );
  }
}

