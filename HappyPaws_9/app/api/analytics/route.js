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
        DATE_FORMAT(b.BookingDateTime, '%Y-%m') AS Month,
        SUM(b.PricePaid) AS Revenue
      FROM Bookings b
      JOIN Classes c ON c.ClassID = b.ClassID
      ${where.length ? "WHERE " + where.join(" AND ") + " AND" : "WHERE"} 
        b.Status IN ('Booked','Completed')
      GROUP BY DATE_FORMAT(b.BookingDateTime, '%Y-%m')
      ORDER BY Month
      `,
      params
    );

    const trainerPerformance = await query(
      `
      SELECT 
        t.TrainerID,
        CONCAT(t.FirstName, ' ', t.LastName) AS TrainerName,
        COUNT(b.BookingID) AS TotalBookings,
        SUM(b.PricePaid) AS Revenue
      FROM Trainers t
      JOIN Classes c ON c.TrainerID = t.TrainerID
      LEFT JOIN Bookings b ON b.ClassID = c.ClassID AND b.Status IN ('Booked','Completed')
      ${trainerId ? "WHERE t.TrainerID = ?" : ""}
      GROUP BY t.TrainerID
      `,
      trainerId ? [trainerId] : []
    );

    const clvRows = await query(
      `
      SELECT 
        cu.CustomerID,
        CONCAT(cu.FirstName, ' ', cu.LastName) AS CustomerName,
        COUNT(b.BookingID) AS BookingsCount,
        SUM(b.PricePaid) AS TotalSpend
      FROM Customers cu
      LEFT JOIN Bookings b ON b.CustomerID = cu.CustomerID AND b.Status IN ('Booked','Completed')
      ${where.length ? "JOIN Classes c ON c.ClassID = b.ClassID AND " + where.join(" AND ") : ""}
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
        c.Title,
        COUNT(b.BookingID) AS BookingsCount
      FROM Classes c
      LEFT JOIN Bookings b ON b.ClassID = c.ClassID AND b.Status IN ('Booked','Completed')
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
        HOUR(c.StartDateTime) AS Hour,
        COUNT(b.BookingID) AS BookingsCount
      FROM Classes c
      LEFT JOIN Bookings b ON b.ClassID = c.ClassID AND b.Status IN ('Booked','Completed')
      ${where.length ? "WHERE " + where.join(" AND") : ""}
      GROUP BY HOUR(c.StartDateTime)
      ORDER BY Hour
      `,
      params
    );

    const cancellationRates = await query(
      `
      SELECT 
        c.Title,
        SUM(b.Status = 'Cancelled') AS CancelledCount,
        COUNT(b.BookingID) AS TotalCount
      FROM Classes c
      LEFT JOIN Bookings b ON b.ClassID = c.ClassID
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


