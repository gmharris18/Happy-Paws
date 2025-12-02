import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400 }
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
          { status: 401 }
        );
      }
      // Note: Your sample data has plain text passwords. For production, use bcrypt.
      // For now, doing simple comparison since passwords are plain text in sample data
      if (password !== rows[0].Password) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }
      return NextResponse.json({ role: "trainer", trainerId: rows[0].id });
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
    // Note: Your sample data has plain text passwords. For production, use bcrypt.
    if (password !== rows[0].Password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ role: "customer", customerId: rows[0].id });
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json(
      { message: "Unexpected error during login" },
      { status: 500 }
    );
  }
}


