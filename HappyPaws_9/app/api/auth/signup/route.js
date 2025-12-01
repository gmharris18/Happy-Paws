import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await query(
      "SELECT CustomerID FROM Customers WHERE Email = ?",
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO Customers (FirstName, LastName, Email, Phone, PasswordHash) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, email, phone || null, hash]
    );

    return NextResponse.json(
      {
        message: "Account created",
        customerId: result.insertId,
        role: "customer"
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error", err);
    return NextResponse.json(
      { message: "Unexpected error creating account" },
      { status: 500 }
    );
  }
}


