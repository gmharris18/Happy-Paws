import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (role === "trainer") {
      const rows = await query(
        "SELECT TrainerID AS id, Password FROM Trainer WHERE Email = ?",
        [email]
      );
      if (rows.length === 0) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401, headers: corsHeaders }
        );
      }
      // Try bcrypt compare first (for new accounts), fall back to plain text (for sample data)
      let passwordMatch = false;
      try {
        passwordMatch = await bcrypt.compare(password, rows[0].Password);
      } catch (e) {
        // If bcrypt fails (not a hash), try plain text
      }
      if (!passwordMatch) {
        passwordMatch = password === rows[0].Password;
      }
      if (!passwordMatch) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401, headers: corsHeaders }
        );
      }
      return NextResponse.json({ role: "trainer", trainerId: rows[0].id }, { headers: corsHeaders });
    }

    // default: customer login
    const rows = await query(
      "SELECT CustomerID AS id, Password FROM Customer WHERE Email = ?",
      [email]
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    // Try bcrypt compare first (for new accounts), fall back to plain text (for sample data)
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, rows[0].Password);
    } catch (e) {
      // If bcrypt fails (not a hash), try plain text
    }
    if (!passwordMatch) {
      passwordMatch = password === rows[0].Password;
    }
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ role: "customer", customerId: rows[0].id }, { headers: corsHeaders });
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json(
      { message: "Unexpected error during login" },
      { status: 500, headers: corsHeaders }
    );
  }
}


