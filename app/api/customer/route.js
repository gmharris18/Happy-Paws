import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// CORS headers for development
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    
    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const rows = await query(
      "SELECT CustomerID, FName, LName, Email, Phone, Address FROM Customer WHERE CustomerID = ?",
      [customerId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(rows[0], { headers: corsHeaders });
  } catch (err) {
    console.error("Customer GET error", err);
    return NextResponse.json(
      { message: "Unable to load customer" },
      { status: 500, headers: corsHeaders }
    );
  }
}

