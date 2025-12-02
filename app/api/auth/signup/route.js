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
    const { firstName, lastName, email, phone, password, role, address, specialization, yearsOfExperience } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const userRole = role || "customer";

    // Check if email exists in Customer or Trainer table
    if (userRole === "trainer") {
      const existingTrainer = await query(
        "SELECT TrainerID FROM Trainer WHERE Email = ?",
        [email]
      );
      if (existingTrainer.length > 0) {
        return NextResponse.json(
          { message: "An account with this email already exists." },
          { status: 409, headers: corsHeaders }
        );
      }
    } else {
      const existingCustomer = await query(
        "SELECT CustomerID FROM Customer WHERE Email = ?",
        [email]
      );
      if (existingCustomer.length > 0) {
        return NextResponse.json(
          { message: "An account with this email already exists." },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    const hash = await bcrypt.hash(password, 10);

    if (userRole === "trainer") {
      // Insert trainer with specialization and years of experience
      const years = yearsOfExperience ? parseInt(yearsOfExperience) : 0;
      const result = await query(
        "INSERT INTO Trainer (FName, LName, Email, Specialization, YearsOfExperience, Password) VALUES (?, ?, ?, ?, ?, ?)",
        [firstName, lastName, email, specialization || null, years, hash]
      );

      return NextResponse.json(
        {
          message: "Trainer account created",
          trainerId: result.insertId,
          role: "trainer"
        },
        { status: 201, headers: corsHeaders }
      );
    } else {
      // Insert customer with address
      const result = await query(
        "INSERT INTO Customer (FName, LName, Email, Phone, Address, Password) VALUES (?, ?, ?, ?, ?, ?)",
        [firstName, lastName, email, phone || null, address || null, hash]
      );

      return NextResponse.json(
        {
          message: "Account created",
          customerId: result.insertId,
          role: "customer"
        },
        { status: 201, headers: corsHeaders }
      );
    }
  } catch (err) {
    console.error("Signup error", err);
    return NextResponse.json(
      { message: "Unexpected error creating account" },
      { status: 500, headers: corsHeaders }
    );
  }
}


