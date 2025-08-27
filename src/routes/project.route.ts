import express from "express";
import { authorizeUser } from "../middlewares/auth";
import { createProject, deleteProject, getAllProjects, getBasicProjectDetails, updateProjectDetails } from "../controller/project.controller";

const ProjectRouter = express.Router();

ProjectRouter.use(authorizeUser);

ProjectRouter.post("/project", createProject);
ProjectRouter.get("/", getAllProjects);
ProjectRouter.get("/:id", getBasicProjectDetails);
ProjectRouter.put("/:id", updateProjectDetails);
ProjectRouter.delete("/:id", deleteProject);

// ProjectRouter.get("/project/:projectId/data", getProjectData);

export default ProjectRouter;
