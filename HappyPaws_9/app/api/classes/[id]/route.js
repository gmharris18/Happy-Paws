import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const classId = params.id;
    const body = await request.json();
    const {
      title,
      description,
      type,
      skillLevel,
      startDateTime,
      endDateTime,
      capacity,
      price,
      location,
      status
    } = body;

    if (!classId) {
      return NextResponse.json(
        { message: "Class id is required" },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];
    if (title !== undefined) {
      fields.push("Title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      fields.push("Description = ?");
      values.push(description);
    }
    if (type !== undefined) {
      fields.push("Type = ?");
      values.push(type);
    }
    if (skillLevel !== undefined) {
      fields.push("SkillLevel = ?");
      values.push(skillLevel);
    }
    if (startDateTime !== undefined) {
      fields.push("StartDateTime = ?");
      values.push(startDateTime);
    }
    if (endDateTime !== undefined) {
      fields.push("EndDateTime = ?");
      values.push(endDateTime);
    }
    if (capacity !== undefined) {
      fields.push("Capacity = ?");
      values.push(capacity);
    }
    if (price !== undefined) {
      fields.push("Price = ?");
      values.push(price);
    }
    if (location !== undefined) {
      fields.push("Location = ?");
      values.push(location);
    }
    if (status !== undefined) {
      fields.push("Status = ?");
      values.push(status);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(classId);
    await query(
      `
      UPDATE Classes
      SET ${fields.join(", ")}
      WHERE ClassID = ?
      `,
      values
    );

    return NextResponse.json({ message: "Class updated" });
  } catch (err) {
    console.error("Class PATCH error", err);
    return NextResponse.json(
      { message: "Unable to update class" },
      { status: 500 }
    );
  }
}


