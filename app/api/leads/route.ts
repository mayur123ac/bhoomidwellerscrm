import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/lib/models/lead";

export const POST = async (request: Request) => {
  try {
    await connectDB();
    const body = await request.json();
    const newLead = new Lead(body);
    await newLead.save();
    return NextResponse.json(newLead, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

export const GET = async () => {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });
    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching leads" }, { status: 500 });
  }
};

// PUT: Update a lead to add a follow-up note
// export const PUT = async (request: Request) => {
//   try {
//     await connectDB();
//     const { leadId, followUp } = await request.json();
    
//     const updatedLead = await Lead.findByIdAndUpdate(
//       leadId,
//       { $push: { followUps: followUp } }, // Push note into array
//       { new: true } // Return the updated document
//     );
//     return NextResponse.json(updatedLead, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Error adding follow-up" }, { status: 500 });
//   }
// };

// PUT: Update a lead (Follow-ups, Editing details, or Solving)
export const PUT = async (request: Request) => {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, followUp, updateData } = body;
    
    let query: any = {};
    
    // If we are adding a follow-up note
    if (followUp) {
      query.$push = { followUps: followUp };
    }
    
    // If we are editing ticket details or solving it
    if (updateData) {
      query.$set = updateData;
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      query,
      { new: true }
    );
    
    return NextResponse.json(updatedLead, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating lead" }, { status: 500 });
  }
};

// DELETE: Remove a lead from the database
export const DELETE = async (request: Request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json({ message: "Lead ID is required" }, { status: 400 });
    }

    const deletedLead = await Lead.findByIdAndDelete(leadId);
    
    if (!deletedLead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting lead" }, { status: 500 });
  }
};