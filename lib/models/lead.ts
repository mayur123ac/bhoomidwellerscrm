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
  
  clientEmail: { type: String },
  alternatePhone: { type: String },
  preferredLocation: { type: String },
  typeOfUse: { type: String },
  approxPurchaseDate: { type: String },
  siteVisitNeeded: { type: String },
  clientAddress: { type: String },
  siteAddress: { type: String },
  
  budget: { type: String },
  schedule: { type: String }, 
  date: { type: String }, 
  
  employeeName: { type: String, required: true },
  teamLead: { type: String, default: 'Unassigned' },
  callStatus: { type: String, default: 'Pending' },
  lastEditedAt: { type: String },
  isSolved: { type: Boolean, default: false },
  
  followUps: [FollowUpSchema]
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);