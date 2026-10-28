import * as projectService from '../services/projectService.js';
import { sendSuccess } from '../utils/response.js';

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user._id);
    return sendSuccess(res, 'Project created successfully', { project }, 201);
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const result = await projectService.listProjects(req.query);
    return sendSuccess(res, 'Projects retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return sendSuccess(res, 'Project details retrieved successfully', { project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    return sendSuccess(res, 'Project updated successfully', { project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    return sendSuccess(res, result.message, { id: result.id });
  } catch (error) {
    next(error);
  }
};

