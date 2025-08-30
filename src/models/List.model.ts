import { Document, Schema, Model, model, ObjectId } from "mongoose";

export interface IList extends Document {
  title: string;
  description?: string;
  projectId: ObjectId;
}

const ListSchema = new Schema<IList>(
  {
    title: {
      type: String,
      required: [true, "Please provide a list title"],
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

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "List must belong to a project"],
    },
  },
  { timestamps: true }
);

const List: Model<IList> = model("List", ListSchema);

export default List;
