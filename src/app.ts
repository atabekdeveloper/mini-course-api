import express from "express";
import {getCoursesRoutes} from "./routes/courses";
import {db} from "./db/db";
import {getTestsRouter} from "./routes/tests";

export const app = express()

export const jsonBodyMiddleware = express.json()

app.use(jsonBodyMiddleware)

const coursesRouter = getCoursesRoutes(db)
const testsRouter = getTestsRouter(db)
app.use('/courses', coursesRouter)
app.use('/__tests__', testsRouter)

