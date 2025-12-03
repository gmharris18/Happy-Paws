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

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, species, breed } = body;

    // Build update query dynamically based on what fields are provided
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("Name = ?");
      values.push(name);
    }
    if (species !== undefined) {
      updates.push("Species = ?");
      values.push(species);
    }
    if (breed !== undefined) {
      updates.push("Breed = ?");
      values.push(breed || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400, headers: corsHeaders }
      );
    }

    values.push(id);

    await query(
      `UPDATE Pet SET ${updates.join(", ")} WHERE PetID = ?`,
      values
    );

    return NextResponse.json({ message: "Pet updated" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Pet PATCH error", err);
    return NextResponse.json(
      { message: "Unable to update pet" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if pet has bookings
    const bookings = await query(
      "SELECT COUNT(*) as count FROM Booking WHERE PetID = ? AND Status = 'Scheduled'",
      [id]
    );

    if (bookings[0].count > 0) {
      return NextResponse.json(
        { message: "Cannot delete pet with active bookings" },
        { status: 400, headers: corsHeaders }
      );
    }

    await query("DELETE FROM Pet WHERE PetID = ?", [id]);

    return NextResponse.json({ message: "Pet deleted" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Pet DELETE error", err);
    return NextResponse.json(
      { message: "Unable to delete pet" },
      { status: 500, headers: corsHeaders }
    );
  }
}

