import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json(
        { message: "customerId is required" },
        { status: 400 }
      );
    }

    const rows = await query(
      "SELECT PetID, Name, Species, Breed FROM Pet WHERE CustomerID = ? ORDER BY Name",
      [customerId]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Pets GET error", err);
    return NextResponse.json(
      { message: "Unable to load pets" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, name, species, breed } = body;
    if (!customerId || !name || !species) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `
      INSERT INTO Pet (CustomerID, Name, Species, Breed)
      VALUES (?, ?, ?, ?)
      `,
      [customerId, name, species, breed || null]
    );

    return NextResponse.json(
      { message: "Pet added", petId: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Pets POST error", err);
    return NextResponse.json(
      { message: "Unable to add pet" },
      { status: 500 }
    );
  }
}


