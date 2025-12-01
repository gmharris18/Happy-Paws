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
    where.push("c.Status IN ('Scheduled','Full')");

    const rows = await query(
      `
      SELECT 
        c.ClassID,
        c.Title,
        c.Description,
        c.Type,
        c.SkillLevel,
        c.StartDateTime,
        c.EndDateTime,
        c.Capacity,
        c.Price,
        c.Location,
        c.Status,
        t.TrainerID,
        CONCAT(t.FirstName, ' ', t.LastName) AS TrainerName,
        COUNT(b.BookingID) AS BookedCount
      FROM Classes c
      JOIN Trainers t ON t.TrainerID = c.TrainerID
      LEFT JOIN Bookings b ON b.ClassID = c.ClassID AND b.Status = 'Booked'
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      GROUP BY c.ClassID
      ORDER BY c.StartDateTime ASC
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
      skillLevel,
      startDateTime,
      endDateTime,
      capacity,
      price,
      location
    } = body;

    if (
      !trainerId ||
      !title ||
      !type ||
      !skillLevel ||
      !startDateTime ||
      !endDateTime ||
      !capacity ||
      !price
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO Classes 
        (TrainerID, Title, Description, Type, SkillLevel, StartDateTime, EndDateTime, Capacity, Price, Location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trainerId,
        title,
        description || null,
        type,
        skillLevel,
        startDateTime,
        endDateTime,
        capacity,
        price,
        location || null
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


