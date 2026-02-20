import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/lib/models/team";

export const POST = async (request: Request) => {
  try {
    await connectDB();
    const body = await request.json();
    const newTeam = new Team(body);
    await newTeam.save();
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating team" }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    await connectDB();
    const teams = await Team.find().sort({ createdAt: -1 });
    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching teams" }, { status: 500 });
  }
};
// PUT: Update a team's employees
export const PUT = async (request: Request) => {
  try {
    await connectDB();
    const body = await request.json();
    const { teamId, employees } = body;
    
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { $set: { employees: employees } },
      { new: true }
    );
    
    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating team" }, { status: 500 });
  }
};

// DELETE: Remove a team entirely
export const DELETE = async (request: Request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) return NextResponse.json({ message: "Team ID is required" }, { status: 400 });

    await Team.findByIdAndDelete(teamId);
    return NextResponse.json({ message: "Team deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting team" }, { status: 500 });
  }
};