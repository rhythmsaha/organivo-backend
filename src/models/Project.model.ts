import { Document, Schema, Model, model, ObjectId } from "mongoose";

export interface IProject extends Document {
  title: string;
  description?: string;
  owner: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  lists: ObjectId[];
  status: "active" | "completed" | "archived";
  priority?: "low" | "medium" | "high";
  isPublic?: boolean;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Please provide a project title"],
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [50, "Title must be at most 50 characters long"],
      trim: true,
    },

    description: {
      type: String,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [500, "Description must be at most 500 characters long"],
      trim: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must have an owner"],
      index: true,
    },

    lists: [
      {
        type: Schema.Types.ObjectId,
        ref: "List",
      },
    ],

    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "default"],
      default: "default",
    },

    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Project: Model<IProject> = model("Project", ProjectSchema);

export default Project;
