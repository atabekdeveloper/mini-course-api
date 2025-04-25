import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { HTTP_STATUSES } from "../utils";
import { coursesRepository } from "../repositories/courses-repository";

import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../types";

import { QueryCoursesModel } from "../models/QueryCoursesModel";
import { CourseViewModel } from "../models/CourseViewModel";
import { URIParamsCourseIdModel } from "../models/URIParamsCourseIdModel";
import { CreateCourseModel } from "../models/CreateCourseModel";
import { UpdateCourseModel } from "../models/UpdateCourseModel";

export const getCoursesRoutes = () => {
    const router = express.Router();

    // GET all courses (optionally by title)
    router.get(
        '/',
        async (req: RequestWithQuery<QueryCoursesModel>, res: Response<CourseViewModel[]>) => {
            const foundCourses = await coursesRepository.findCourses(req.query.title);
            res.json(foundCourses);
        }
    );

    // GET course by ID
    router.get('/:id', async (req: RequestWithParams<URIParamsCourseIdModel>, res: Response<CourseViewModel>) => {
        const foundCourse = await coursesRepository.findCourseById(req.params.id);
        if (!foundCourse) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        res.json(foundCourse);
    });

    // POST create new course
    router.post(
        '/',
        body('title')
            .isString().withMessage('Title must be a string')
            .trim()
            .isLength({ min: 3, max: 15 }).withMessage('Title must be between 3 and 15 characters'),
        // @ts-ignore
        async (req: RequestWithBody<CreateCourseModel>, res: Response<CourseViewModel | { errors: any }>) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errors: errors.array() });
            }

            const newCourse = await coursesRepository.createCourse(req.body.title);
            return res.status(HTTP_STATUSES.CREATED_201).json(newCourse);
        }
    );

    // PUT update course by ID
    router.put(
        '/:id',
        body('title')
            .isString().withMessage('Title must be a string')
            .trim()
            .isLength({ min: 3, max: 15 }).withMessage('Title must be between 3 and 15 characters'),
        // @ts-ignore
        async (req: RequestWithParamsAndBody<URIParamsCourseIdModel, UpdateCourseModel>, res: Response<{ errors: any } | void>) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errors: errors.array() });
            }

            const updated = await coursesRepository.updateCourse(req.params.id, req.body.title);
            if (!updated) {
                return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        }
    );

    // DELETE course by ID
    router.delete('/:id', async (req: Request<URIParamsCourseIdModel>, res: Response) => {
        const isDeleted = await coursesRepository.deleteCourse(req.params.id);
        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    });

    return router;
};