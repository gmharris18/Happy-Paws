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

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    
    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, address, password } = body;

    // Check if email is being changed and if new email already exists
    if (email) {
      const existing = await query(
        "SELECT CustomerID FROM Customer WHERE Email = ? AND CustomerID != ?",
        [email, customerId]
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
    if (phone !== undefined) {
      updates.push("Phone = ?");
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push("Address = ?");
      values.push(address);
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

    values.push(customerId);

    await query(
      `UPDATE Customer SET ${updates.join(", ")} WHERE CustomerID = ?`,
      values
    );

    return NextResponse.json({ message: "Customer updated" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Customer PATCH error", err);
    return NextResponse.json(
      { message: "Unable to update customer" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    
    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if customer has bookings
    const bookings = await query(
      "SELECT COUNT(*) as count FROM Booking WHERE CustomerID = ?",
      [customerId]
    );

    if (bookings[0].count > 0) {
      return NextResponse.json(
        { message: "Cannot delete customer with existing bookings" },
        { status: 400, headers: corsHeaders }
      );
    }

    await query("DELETE FROM Customer WHERE CustomerID = ?", [customerId]);

    return NextResponse.json({ message: "Customer deleted" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Customer DELETE error", err);
    return NextResponse.json(
      { message: "Unable to delete customer" },
      { status: 500, headers: corsHeaders }
    );
  }
}

