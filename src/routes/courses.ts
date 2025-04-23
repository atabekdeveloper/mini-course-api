import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery
} from "../types";
import { QueryCoursesModel } from "../models/QueryCoursesModel";
import express, { Request, Response } from "express";
import { CourseViewModel } from "../models/CourseViewModel";
import { URIParamsCourseIdModel } from "../models/URIParamsCourseIdModel";
import { CreateCourseModel } from "../models/CreateCourseModel";
import { UpdateCourseModel } from "../models/UpdateCourseModel";
import { CourseType, DBType } from "../db/db";
import { HTTP_STATUSES } from "../utils";
import { body, validationResult } from "express-validator";

export const getCourseViewModel = (dbCourse: CourseType): CourseViewModel => {
    return {
        id: dbCourse.id,
        title: dbCourse.title,
    };
};

export const getCoursesRoutes = (db: DBType) => {
    const router = express.Router();

    router.get('/', (req: RequestWithQuery<QueryCoursesModel>, res: Response<CourseViewModel[]>) => {
        let foundCourses = db.courses;
        if (req.query.title) {
            foundCourses = db.courses.filter(c => c.title.includes(req.query.title));
        }

        res.json(foundCourses.map(getCourseViewModel));
    });

    router.get('/:id', (req: RequestWithParams<URIParamsCourseIdModel>, res: Response<CourseViewModel>) => {
        const foundCourse = db.courses.find((c) => c.id === +req.params.id);
        if (!foundCourse) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        res.json(getCourseViewModel(foundCourse));
    });

    router.post(
        '/',
        body('title')
            .isString().withMessage('Title must be a string')
            .trim()
            .isLength({ min: 3, max: 15 }).withMessage('Title must be between 3 and 15 characters'),
        // @ts-ignore
        (req: RequestWithBody<CreateCourseModel>, res: Response<CourseViewModel | { errors: any }>) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errors: errors.array() });
            }

            const createdCourse: CourseType = {
                id: +(new Date()),
                title: req.body.title,
                studentsCount: 0,
            };

            db.courses.push(createdCourse);
            return res.status(HTTP_STATUSES.CREATED_201).json(getCourseViewModel(createdCourse));
        }
    );

    router.put(
        '/:id',
        body('title')
            .isString().withMessage('Title must be a string')
            .trim()
            .isLength({ min: 3, max: 15 }).withMessage('Title must be between 3 and 15 characters'),
        // @ts-ignore
        (req: RequestWithParamsAndBody<URIParamsCourseIdModel, UpdateCourseModel>, res: Response<{ errors: any } | void>) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errors: errors.array() });
            }

            const foundCourse = db.courses.find((c) => c.id === +req.params.id);
            if (!foundCourse) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
                return;
            }

            foundCourse.title = req.body.title;
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        }
    );

    router.delete('/:id', (req: Request<URIParamsCourseIdModel>, res: Response) => {
        if (db.courses.find((c) => c.id === +req.params.id)) {
            db.courses = db.courses.filter(c => c.id !== +req.params.id);
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
    });

    return router;
};