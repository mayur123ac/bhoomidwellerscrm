import mongoose from "mongoose";

const FollowUpSchema = new mongoose.Schema({
  author: String,
  text: String,
  time: String
});

const LeadSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  
  // --- NEW FIELDS ADDED ---
  clientEmail: { type: String },
  clientAddress: { type: String },
  siteAddress: { type: String },
  lastEditedAt: { type: String },
  isSolved: { type: Boolean, default: false }, // Solved Ticket Logic
  // ------------------------
  
  budget: { type: String },
  schedule: { type: String }, 
  date: { type: String }, 
  employeeName: { type: String, required: true },
  teamLead: { type: String, default: 'Unassigned' },
  callStatus: { type: String, default: 'Pending' },
  followUps: [FollowUpSchema]
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);