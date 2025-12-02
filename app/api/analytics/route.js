import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get("trainerId") || null;

    const params = [];
    const where = [];
    if (trainerId) {
      where.push("c.TrainerID = ?");
      params.push(trainerId);
    }

    const revenueRows = await query(
      `
      SELECT 
        DATE_FORMAT(b.BookingDate, '%Y-%m') AS Month,
        SUM(c.Price) AS Revenue
      FROM Booking b
      JOIN Class c ON c.ClassID = b.ClassID
      ${where.length ? "WHERE " + where.join(" AND ") + " AND" : "WHERE"} 
        b.Status IN ('Scheduled','Completed')
      GROUP BY DATE_FORMAT(b.BookingDate, '%Y-%m')
      ORDER BY Month
      `,
      params
    );

    const trainerPerformance = await query(
      `
      SELECT 
        t.TrainerID,
        CONCAT(t.FName, ' ', t.LName) AS TrainerName,
        COUNT(b.BookingID) AS TotalBookings,
        SUM(c.Price) AS Revenue
      FROM Trainer t
      JOIN Class c ON c.TrainerID = t.TrainerID
      LEFT JOIN Booking b ON b.ClassID = c.ClassID AND b.Status IN ('Scheduled','Completed')
      ${trainerId ? "WHERE t.TrainerID = ?" : ""}
      GROUP BY t.TrainerID
      `,
      trainerId ? [trainerId] : []
    );

    const clvRows = await query(
      `
      SELECT 
        cu.CustomerID,
        CONCAT(cu.FName, ' ', cu.LName) AS CustomerName,
        COUNT(b.BookingID) AS BookingsCount,
        SUM(c.Price) AS TotalSpend
      FROM Customer cu
      LEFT JOIN Booking b ON b.CustomerID = cu.CustomerID AND b.Status IN ('Scheduled','Completed')
      ${where.length ? "JOIN Class c ON c.ClassID = b.ClassID AND " + where.join(" AND ") : "LEFT JOIN Class c ON c.ClassID = b.ClassID"}
      GROUP BY cu.CustomerID
      HAVING TotalSpend IS NOT NULL
      ORDER BY TotalSpend DESC
      LIMIT 10
      `,
      params
    );

    const demandRows = await query(
      `
      SELECT 
        c.ClassName,
        COUNT(b.BookingID) AS BookingsCount
      FROM Class c
      LEFT JOIN Booking b ON b.ClassID = c.ClassID AND b.Status IN ('Scheduled','Completed')
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      GROUP BY c.ClassID
      ORDER BY BookingsCount DESC
      LIMIT 10
      `,
      params
    );

    const peakHours = await query(
      `
      SELECT 
        HOUR(c.ScheduleDate) AS Hour,
        COUNT(b.BookingID) AS BookingsCount
      FROM Class c
      LEFT JOIN Booking b ON b.ClassID = c.ClassID AND b.Status IN ('Scheduled','Completed')
      ${where.length ? "WHERE " + where.join(" AND") : ""}
      GROUP BY HOUR(c.ScheduleDate)
      ORDER BY Hour
      `,
      params
    );

    const cancellationRates = await query(
      `
      SELECT 
        c.ClassName,
        SUM(b.Status = 'Cancelled') AS CancelledCount,
        COUNT(b.BookingID) AS TotalCount
      FROM Class c
      LEFT JOIN Booking b ON b.ClassID = c.ClassID
      ${where.length ? "WHERE " + where.join(" AND") : ""}
      GROUP BY c.ClassID
      HAVING TotalCount > 0
      ORDER BY CancelledCount DESC
      LIMIT 10
      `,
      params
    );

    return NextResponse.json({
      revenueByMonth: revenueRows,
      trainerPerformance,
      topCustomers: clvRows,
      classDemand: demandRows,
      peakHours,
      cancellationRates
    });
  } catch (err) {
    console.error("Analytics GET error", err);
    return NextResponse.json(
      { message: "Unable to load analytics" },
      { status: 500 }
    );
  }
}


