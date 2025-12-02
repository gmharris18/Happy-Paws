import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      title,
      description,
      type,
      startDateTime,
      capacity,
      price
    } = body;

    // Build update query dynamically based on what fields are provided
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("ClassName = ?");
      values.push(title);
    }
    if (description !== undefined) {
      updates.push("Description = ?");
      values.push(description);
    }
    if (type !== undefined) {
      updates.push("Type = ?");
      values.push(type);
    }
    if (startDateTime !== undefined) {
      updates.push("ScheduleDate = ?");
      values.push(startDateTime);
    }
    if (capacity !== undefined) {
      updates.push("Capacity = ?");
      values.push(capacity);
    }
    if (price !== undefined) {
      updates.push("Price = ?");
      values.push(price);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);

    await query(
      `UPDATE Class SET ${updates.join(", ")} WHERE ClassID = ?`,
      values
    );

    return NextResponse.json({ message: "Class updated" });
  } catch (err) {
    console.error("Classes PATCH error", err);
    return NextResponse.json(
      { message: "Unable to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if class has bookings
    const bookings = await query(
      "SELECT COUNT(*) as count FROM Booking WHERE ClassID = ? AND Status = 'Scheduled'",
      [id]
    );

    if (bookings[0].count > 0) {
      return NextResponse.json(
        { message: "Cannot delete class with active bookings" },
        { status: 400 }
      );
    }

    await query("DELETE FROM Class WHERE ClassID = ?", [id]);

    return NextResponse.json({ message: "Class deleted" });
  } catch (err) {
    console.error("Classes DELETE error", err);
    return NextResponse.json(
      { message: "Unable to delete class" },
      { status: 500 }
    );
  }
}

