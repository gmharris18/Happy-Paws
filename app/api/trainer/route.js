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
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get("trainerId");
    
    if (!trainerId) {
      return NextResponse.json(
        { message: "trainerId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const rows = await query(
      "SELECT TrainerID, FName, LName, Email, Specialization, YearsOfExperience FROM Trainer WHERE TrainerID = ?",
      [trainerId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Trainer not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(rows[0], { headers: corsHeaders });
  } catch (err) {
    console.error("Trainer GET error", err);
    return NextResponse.json(
      { message: "Unable to load trainer" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get("trainerId");
    
    if (!trainerId) {
      return NextResponse.json(
        { message: "trainerId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, specialization, yearsOfExperience, password } = body;

    // Check if email is being changed and if new email already exists
    if (email) {
      const existing = await query(
        "SELECT TrainerID FROM Trainer WHERE Email = ? AND TrainerID != ?",
        [email, trainerId]
      );
      if (existing.length > 0) {
        return NextResponse.json(
          { message: "An account with this email already exists." },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    const updates = [];
    const values = [];

    if (firstName !== undefined) {
      updates.push("FName = ?");
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push("LName = ?");
      values.push(lastName);
    }
    if (email !== undefined) {
      updates.push("Email = ?");
      values.push(email);
    }
    if (specialization !== undefined) {
      updates.push("Specialization = ?");
      values.push(specialization);
    }
    if (yearsOfExperience !== undefined) {
      updates.push("YearsOfExperience = ?");
      values.push(parseInt(yearsOfExperience));
    }
    if (password !== undefined) {
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.default.hash(password, 10);
      updates.push("Password = ?");
      values.push(hash);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400, headers: corsHeaders }
      );
    }

    values.push(trainerId);

    await query(
      `UPDATE Trainer SET ${updates.join(", ")} WHERE TrainerID = ?`,
      values
    );

    return NextResponse.json({ message: "Trainer updated" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Trainer PATCH error", err);
    return NextResponse.json(
      { message: "Unable to update trainer" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get("trainerId");
    
    if (!trainerId) {
      return NextResponse.json(
        { message: "trainerId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if trainer has classes
    const classes = await query(
      "SELECT COUNT(*) as count FROM Class WHERE TrainerID = ?",
      [trainerId]
    );

    if (classes[0].count > 0) {
      return NextResponse.json(
        { message: "Cannot delete trainer with existing classes" },
        { status: 400, headers: corsHeaders }
      );
    }

    await query("DELETE FROM Trainer WHERE TrainerID = ?", [trainerId]);

    return NextResponse.json({ message: "Trainer deleted" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Trainer DELETE error", err);
    return NextResponse.json(
      { message: "Unable to delete trainer" },
      { status: 500, headers: corsHeaders }
    );
  }
}

