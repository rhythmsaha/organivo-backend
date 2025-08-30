import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Project from "../models/Project.model";
import type { IProject } from "../models/Project.model";

import { default as validator } from "validator";
import ErrorHandler from "../utils/AppError";
import List, { IList } from "../models/List.model";
import Task, { ITask } from "../models/Task.model";
import { Document, isValidObjectId, ObjectId } from "mongoose";

// Create Project
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { title, description, priority } = req.body;

  if (!title) {
    throw new ErrorHandler("Please provide a valid title", 400);
  }

  if (description && !validator.isLength(description, { min: 10, max: 500 })) {
    throw new ErrorHandler("Description must be between 10 and 500 characters", 400);
  }

  if (priority && !["low", "medium", "high", "default"].includes(priority)) {
    throw new ErrorHandler("Priority must be either 'low', 'medium', 'high', or 'default'", 400);
  }

  const project = new Project({
    owner: userId,
    title,
    description,
    lists: [],
    priority,
  });

  if (!project) {
    throw new ErrorHandler("Failed to create project", 500);
  }

  const defaultLists = [
    { title: "Planned", projectId: project._id, owner: userId },
    { title: "Todo", projectId: project._id, owner: userId },
    { title: "In Progress", projectId: project._id, owner: userId },
    { title: "Completed", projectId: project._id, owner: userId },
  ];

  const lists = await List.create(defaultLists);
  project.lists = lists.map((list) => list._id) as ObjectId[];

  const saveProject = await project.save();

  if (!saveProject) {
    throw new ErrorHandler("Failed to create project", 500);
  }

  res.status(201).json({
    success: true,
    data: {
      project: {
        _id: saveProject._id,
        title: saveProject.title,
        description: saveProject.description,
        owner: saveProject.owner,
        status: saveProject.status,
        priority: saveProject.priority,
        isPublic: saveProject.isPublic,
        createdAt: saveProject.createdAt,
        updatedAt: saveProject.updatedAt,
      },
    },
  });
});

// Get All Projects for a User
export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  // filter and sort logic
  const { status, priority, limit, sortBy } = req.query;

  const query: any = { owner: userId };
  if (status && ["active", "completed", "archived"].includes(status as string)) {
    query.status = status;
  }

  if (priority && ["low", "medium", "high", "default"].includes(priority as string)) {
    query.priority = priority;
  }

  const sort: Record<string, number> = { createdAt: -1 }; // default sort by createdAt desc
  if (sortBy) {
    const [field, order] = (sortBy as string).split(":");
    sort[field] = order === "asc" ? 1 : -1;
  }

  //   limit
  const resLimit = parseInt(limit as string) || 0;

  const projects = (await Project.find(query)
    .sort(sort as any)
    .select("-__v")
    .limit(resLimit)) as IProject[];

  res.status(200).json({
    success: true,
    data: {
      projects,
      total: projects.length,
    },
  });
});

// Get Basic Project Details
export const getBasicProjectDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;

  const project = await Project.findOne({ _id: projectId, owner: userId }).select("-__v");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      project,
    },
  });
});

// Update Basic Project Details
export const updateProjectDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;
  const { title, description, priority, status } = req.body;

  const project = await Project.findOne({ _id: projectId, owner: userId });

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  if (title) {
    project.title = title;
  }

  if (description && !validator.isLength(description, { min: 10, max: 500 })) {
    project.description = description;
  }

  if (priority && ["low", "medium", "high", "default"].includes(priority)) {
    project.priority = priority;
  }

  if (status && ["active", "completed", "archived"].includes(status)) {
    project.status = status;
  }

  await project.save();

  res.status(200).json({
    success: true,
    data: {
      project,
    },
  });
});

// Get a Project Data + List + Tasks
export const getProjectData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;

  const project = await Project.findOne({ _id: projectId, owner: userId })
    .select("-__v")
    .populate({
      path: "lists",
      select: "-__v",
      options: {
        lean: true,
      },
    });

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  // sort by order
  let tasks = await Task.find({ projectId }).select("-__v").sort({ order: 1 }).lean();
  let lists = project.lists as unknown as { _id: ObjectId; cards: any[] }[];

  res.status(200).json({
    success: true,
    data: {
      project,
      lists,
      tasks,
    },
  });
});

// List Controller
export const createList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;
  const { title, description } = req.body;

  const project = await Project.findOne({ _id: projectId, owner: userId });

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  const list = await List.create({
    title,
    description,
    projectId,
    owner: userId,
  });

  if (!list) {
    throw new ErrorHandler("List creation failed", 500);
  }

  project.lists.push(list._id as ObjectId);
  await project.save();

  res.status(201).json({
    success: true,
    data: {
      list,
    },
  });
});

export const updateList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const listId = req.params.listId;
  const projectId = req.params.id;

  const { title } = req.body;

  const project = await Project.findOne({ _id: projectId, owner: userId }).select("lists");

  if (!project) {
    throw new ErrorHandler("Project not found or you do not have permission", 404);
  }

  const list = await List.findOne({ _id: listId, projectId: project._id });

  if (!list) {
    throw new ErrorHandler("List not found or you do not have permission", 404);
  }

  list.title = title || list.title;

  await list.save();

  res.status(200).json({
    success: true,
    data: {
      list,
    },
  });
});

export const deleteList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;
  const listId = req.params.listId;

  const project = await Project.findOne({ _id: projectId, owner: userId });

  if (!project) {
    throw new ErrorHandler("Project not found or you do not have permission", 404);
  }

  const list = await List.findOneAndDelete({ _id: listId, projectId: project._id });

  if (!list) {
    throw new ErrorHandler("List not found", 404);
  }

  project.lists = project.lists.filter((l) => l.toString() !== listId);
  await project.save();

  Task.deleteMany({ listId: list._id }).exec();

  res.status(200).json({
    success: true,
    message: "List deleted successfully",
    data: {
      listId: list._id,
    },
  });
});

export const reOrderList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;

  const { listIds }: { listIds: string[] } = req.body;

  // Find the project
  const project = await Project.findOne({ _id: projectId, owner: userId });

  if (!project) {
    throw new ErrorHandler("Project not found or you do not have permission", 404);
  }

  console.log(listIds);

  // Validate ObjectIds
  const invalidIds = listIds.filter((id) => !isValidObjectId(id));

  if (invalidIds.length > 0) {
    throw new ErrorHandler("Invalid list IDs", 400);
  }

  project.lists = listIds as unknown as ObjectId[];

  await project.save();

  res.status(200).json({
    success: true,
    data: {
      lists: project.lists,
    },
  });
});

// createTask
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;
  const { title, description, listId, order } = req.body;

  // check if project exists and user have permission
  const project = await Project.findOne({ _id: projectId, owner: userId }).select("owner");

  if (!project) {
    throw new ErrorHandler("Project not found or you do not have permission", 404);
  }

  const list = await List.findOne({ _id: listId, projectId });

  if (!list) {
    throw new ErrorHandler("List not found in this project", 404);
  }

  const task = await Task.create({
    title,
    description,
    listId,
    order,
    projectId,
  });

  if (!task) {
    throw new ErrorHandler("Task creation failed", 500);
  }

  res.status(201).json({
    success: true,
    data: {
      task,
    },
  });
});

export const reOrderTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;
  const { tasks }: { tasks: { _id: string; order: number; listId: string }[] } = req.body;

  // Find the project
  const project = await Project.findOne({ _id: projectId, owner: userId });

  if (!project) {
    throw new ErrorHandler("Project not found or you do not have permission", 404);
  }

  const invalidIds = tasks.filter((task) => !isValidObjectId(task._id));

  if (invalidIds.length > 0) {
    throw new ErrorHandler("Invalid task IDs", 400);
  }

  // mongoose bulk update tasks finding with listId and _id
  const bulkOps = tasks.map((task) => ({
    updateOne: {
      filter: { _id: task._id, projectId },
      update: { order: task.order, listId: task.listId },
    },
  }));

  const result = await Task.bulkWrite(bulkOps);

  console.log(result);

  res.status(200).json({
    success: true,
    data: {
      tasks,
    },
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id: projectId, taskId } = req.params;

  const { title, description } = req.body;

  // check if project exists and user have permission
  const project = await Project.findOne({ _id: projectId, owner: userId }).select("owner").lean();

  if (!project) {
    throw new ErrorHandler("Project not found or you do not have permission", 404);
  }

  const task = await Task.findOne({ _id: taskId, projectId: project._id });

  if (!task) {
    throw new ErrorHandler("Task not found in this project", 404);
  }

  task.title = title || task.title;
  task.description = description || task.description;

  const saveTask = await task.save();

  res.status(200).json({
    success: true,
    data: {
      task: saveTask,
    },
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { taskId } = req.params;

  const task = (await Task.findOne({ _id: taskId }).populate("projectId", "owner")) as unknown as ITask & {
    projectId: { owner: ObjectId };
  };

  if (!task) {
    throw new ErrorHandler("Task not found", 404);
  }

  if (task.projectId.owner.toString() !== userId) {
    throw new ErrorHandler("You do not have permission to delete this task", 403);
  }

  const deleteTask = await Task.findByIdAndDelete(taskId);

  if (!deleteTask) {
    throw new ErrorHandler("Task deletion failed", 500);
  }

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
    data: {
      taskId: deleteTask._id,
    },
  });
});

// Delete a Project
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;

  const project = await Project.findOneAndDelete({ _id: projectId, owner: userId });

  List.deleteMany({
    projectId: projectId,
  }).exec();

  Task.deleteMany({ projectId }).exec();

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
    data: {
      projectId: project._id,
    },
  });
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  // find the number of projects
  const projects = await Project.find({ owner: userId }).distinct("_id");
  const totalProjects = projects.length;

  // count total tasks
  const totalTasks = await Task.countDocuments({
    projectId: { $in: projects },
  });

  const totalLists = await List.countDocuments({
    projectId: { $in: projects },
  });

  const avgTasksPerProject = totalProjects > 0 ? (totalTasks / totalProjects).toFixed(2) : 0;

  // Get the total number of tasks
  res.status(200).json({
    success: true,
    data: [
      { title: "Total Projects", value: totalProjects },
      { title: "Total Tasks", value: totalTasks },
      { title: "Total Lists", value: totalLists },
      { title: "Average Tasks", value: avgTasksPerProject },
    ],
  });
});
