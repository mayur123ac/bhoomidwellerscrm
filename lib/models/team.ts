import mongoose from "mongoose";

const EmployeeStatSchema = new mongoose.Schema({
  name: String,
  email: String,
  calls: { type: Number, default: 0 },
  leads: { type: Number, default: 0 }
});

const TeamSchema = new mongoose.Schema({
  tlName: { type: String, required: true },
  tlEmail: { type: String, required: true },
  satisfaction: { type: String, default: 'N/A' },
  employees: [EmployeeStatSchema]
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);