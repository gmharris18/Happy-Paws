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
        b.BookingDate,
        c.ClassName AS ClassTitle,
        c.ClassName AS ClassName,
        c.ScheduleDate,
        c.Price,
        p.Name AS PetName,
        CONCAT(cu.FName, ' ', cu.LName) AS CustomerName
      FROM Booking b
      JOIN Class c ON c.ClassID = b.ClassID
      JOIN Pet p ON p.PetID = b.PetID
      JOIN Customer cu ON cu.CustomerID = b.CustomerID
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY c.ScheduleDate DESC
      `,
      params
    );

    return NextResponse.json(rows, { headers: corsHeaders });
  } catch (err) {
    console.error("Bookings GET error", err);
    return NextResponse.json(
      { message: "Unable to load bookings" },
      { status: 500, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    const [klass] = await query(
      `
      SELECT 
        ClassID, Price, Capacity,
        (SELECT COUNT(*) FROM Booking b WHERE b.ClassID = Class.ClassID AND b.Status = 'Scheduled') AS BookedCount
      FROM Class
      WHERE ClassID = ?
      `,
      [classId]
    );
    if (!klass) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }
    if (klass.BookedCount >= klass.Capacity) {
      return NextResponse.json(
        { message: "Class is full" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get employee ID (using first employee for now, you may want to pass this from frontend)
    const [employee] = await query("SELECT EmployeeID FROM Employee LIMIT 1", []);
    if (!employee) {
      return NextResponse.json(
        { message: "No employee available for booking" },
        { status: 500, headers: corsHeaders }
      );
    }

    const result = await query(
      `
      INSERT INTO Booking (CustomerID, PetID, ClassID, EmployeeID, Status, BookingDate)
      VALUES (?, ?, ?, ?, 'Scheduled', NOW())
      `,
      [customerId, petId, classId, employee.EmployeeID]
    );

    return NextResponse.json(
      { message: "Booked", bookingId: result.insertId },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Bookings POST error", err);
    return NextResponse.json(
      { message: "Unable to create booking" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { bookingId, status, bookingDate } = body;
    if (!bookingId) {
      return NextResponse.json(
        { message: "bookingId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push("Status = ?");
      values.push(status);
    }
    if (bookingDate !== undefined) {
      updates.push("BookingDate = ?");
      values.push(bookingDate);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400, headers: corsHeaders }
      );
    }

    values.push(bookingId);

    await query(
      `UPDATE Booking SET ${updates.join(", ")} WHERE BookingID = ?`,
      values
    );
    return NextResponse.json({ message: "Booking updated" }, { headers: corsHeaders });
  } catch (err) {
    console.error("Bookings PATCH error", err);
    return NextResponse.json(
      { message: "Unable to update booking" },
      { status: 500, headers: corsHeaders }
    );
  }
}


