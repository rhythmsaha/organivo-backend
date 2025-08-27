import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Project from "../models/Project.model";
import type { IProject } from "../models/Project.model";

import { default as validator } from "validator";
import ErrorHandler from "../utils/AppError";
import List from "../models/List.model";
import Task from "../models/Task.model";

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

  const project = await Project.create({
    owner: userId,
    title,
    description,
    priority,
  });

  if (!project) {
    throw new ErrorHandler("Failed to create project", 500);
  }

  res.status(201).json({
    success: true,
    data: {
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        owner: project.owner,
        status: project.status,
        priority: project.priority,
        isPublic: project.isPublic,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
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
  const projectId = req.params.projectId;

  const project = await Project.findOne({ _id: projectId, owner: userId }).select("-__v");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  let [lists, tasks] = await Promise.all([List.find({ projectId }).select("-__v"), Task.find({ projectId }).select("-__v")]);

  //   if have lists then structure those lists and if have tasks then structure those tasks under the lists like in the list object - tasks = []

  let structuredLists = [];

  if (lists.length > 0) {
    structuredLists = lists.map((list) => {
      const listTasks = tasks.filter((task) => task.listId === list._id);

      return {
        ...list,
        tasks: listTasks,
      };
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      project,
      lists,
      tasks,
    },
  });
});

// update List
// update Task
// Delete List
// Delete Task

// Delete a Project
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const projectId = req.params.id;

  const project = await Project.findOneAndDelete({ _id: projectId, owner: userId });

  Task.deleteMany({ projectId });
  List.deleteMany({ projectId });

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
