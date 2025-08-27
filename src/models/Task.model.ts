import { Document, Schema, Model, model, ObjectId } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  projectId: ObjectId;
  listId: ObjectId;
  order: number;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      minlength: [1, "Title must be at least 1 character long"],
      maxlength: [100, "Title must be at most 100 characters long"],
      trim: true,
    },

    description: {
      type: String,
      minlength: [0, "Description must be at least 0 characters long"],
      maxlength: [500, "Description must be at most 500 characters long"],
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Task must belong to a project"],
    },

    listId: {
      type: Schema.Types.ObjectId,
      ref: "List",
      required: [true, "Task must belong to a list"],
    },

    order: {
      type: Number,
      required: [true, "Task must have an order"],
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> = model("Task", TaskSchema);
export default Task;
