import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get("trainerId") || null;
    const where = [];
    const params = [];

    if (trainerId) {
      where.push("c.TrainerID = ?");
      params.push(trainerId);
    }
    // Note: New schema doesn't have Status field, filtering by capacity instead

    const rows = await query(
      `
      SELECT 
        c.ClassID,
        c.ClassName,
        c.Description,
        c.Type,
        c.ScheduleDate,
        c.Capacity,
        c.Price,
        t.TrainerID,
        CONCAT(t.FName, ' ', t.LName) AS TrainerName,
        COUNT(b.BookingID) AS BookedCount
      FROM Class c
      JOIN Trainer t ON t.TrainerID = c.TrainerID
      LEFT JOIN Booking b ON b.ClassID = c.ClassID AND b.Status = 'Scheduled'
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      GROUP BY c.ClassID
      ORDER BY c.ScheduleDate ASC
      `,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Classes GET error", err);
    return NextResponse.json(
      { message: "Unable to load classes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      trainerId,
      title,
      description,
      type,
      startDateTime,
      capacity,
      price
    } = body;

    if (
      !trainerId ||
      !title ||
      !type ||
      !startDateTime ||
      !capacity ||
      !price
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO Class 
        (TrainerID, ClassName, Description, Type, ScheduleDate, Capacity, Price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        trainerId,
        title,
        description || null,
        type,
        startDateTime,
        capacity,
        price
      ]
    );

    return NextResponse.json(
      { message: "Class created", classId: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Classes POST error", err);
    return NextResponse.json(
      { message: "Unable to create class" },
      { status: 500 }
    );
  }
}


