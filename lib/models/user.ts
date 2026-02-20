// lib/models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], required: true },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;