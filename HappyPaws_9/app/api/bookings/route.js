import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const trainerId = searchParams.get("trainerId");
    const classId = searchParams.get("classId");

    const where = [];
    const params = [];
    if (customerId) {
      where.push("b.CustomerID = ?");
      params.push(customerId);
    }
    if (trainerId) {
      where.push("c.TrainerID = ?");
      params.push(trainerId);
    }
    if (classId) {
      where.push("b.ClassID = ?");
      params.push(classId);
    }

    const rows = await query(
      `
      SELECT 
        b.BookingID,
        b.CustomerID,
        b.PetID,
        b.ClassID,
        b.Status,
        b.PricePaid,
        b.BookingDateTime,
        c.Title AS ClassTitle,
        c.StartDateTime,
        c.EndDateTime,
        c.Location,
        p.Name AS PetName
      FROM Bookings b
      JOIN Classes c ON c.ClassID = b.ClassID
      JOIN Pets p ON p.PetID = b.PetID
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY c.StartDateTime DESC
      `,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Bookings GET error", err);
    return NextResponse.json(
      { message: "Unable to load bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, petId, classId } = body;
    if (!customerId || !petId || !classId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [klass] = await query(
      `
      SELECT 
        ClassID, Price, Capacity, Status,
        (SELECT COUNT(*) FROM Bookings b WHERE b.ClassID = Classes.ClassID AND b.Status = 'Booked') AS BookedCount
      FROM Classes
      WHERE ClassID = ?
      `,
      [classId]
    );
    if (!klass) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }
    if (klass.Status === "Cancelled") {
      return NextResponse.json(
        { message: "Class is cancelled" },
        { status: 400 }
      );
    }
    if (klass.BookedCount >= klass.Capacity) {
      return NextResponse.json(
        { message: "Class is full" },
        { status: 400 }
      );
    }

    const result = await query(
      `
      INSERT INTO Bookings (CustomerID, PetID, ClassID, Status, PricePaid)
      VALUES (?, ?, ?, 'Booked', ?)
      `,
      [customerId, petId, classId, klass.Price]
    );

    return NextResponse.json(
      { message: "Booked", bookingId: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Bookings POST error", err);
    return NextResponse.json(
      { message: "Unable to create booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json(
        { message: "bookingId is required" },
        { status: 400 }
      );
    }

    await query(
      `
      UPDATE Bookings
      SET Status = 'Cancelled', CancelledAt = NOW()
      WHERE BookingID = ?
      `,
      [bookingId]
    );
    return NextResponse.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("Bookings PATCH error", err);
    return NextResponse.json(
      { message: "Unable to cancel booking" },
      { status: 500 }
    );
  }
}


