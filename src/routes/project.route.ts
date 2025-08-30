import express from "express";
import { authorizeUser } from "../middlewares/auth";
import {
  createList,
  createProject,
  createTask,
  deleteList,
  deleteProject,
  deleteTask,
  getAllProjects,
  getBasicProjectDetails,
  getProjectData,
  getStats,
  reOrderList,
  reOrderTasks,
  updateList,
  updateProjectDetails,
  updateTask,
} from "../controller/project.controller";

const ProjectRouter = express.Router();

ProjectRouter.use(authorizeUser);

ProjectRouter.get("/stats", getStats);

ProjectRouter.post("/project", createProject);
ProjectRouter.get("/", getAllProjects);
ProjectRouter.get("/:id", getBasicProjectDetails);
ProjectRouter.put("/:id", updateProjectDetails);
ProjectRouter.delete("/:id", deleteProject);

// Individual Project Routes
ProjectRouter.get("/:id/data", getProjectData);
ProjectRouter.post("/:id/list", createList);
ProjectRouter.patch("/:id/list", reOrderList);
ProjectRouter.put("/:id/list/:listId", updateList);
ProjectRouter.delete("/:id/list/:listId", deleteList);

// Task Routes
ProjectRouter.post("/:id/task", createTask);
ProjectRouter.patch("/:id/tasks", reOrderTasks);
ProjectRouter.patch("/:id/task/:taskId", updateTask);
ProjectRouter.delete("/task/:taskId", deleteTask);

export default ProjectRouter;
