import express from "express";
import {getCoursesRoutes} from "./routes/courses";
import {getTestsRouter} from "./routes/tests";

export const app = express()

export const jsonBodyMiddleware = express.json()

app.use(jsonBodyMiddleware)
app.use(express.urlencoded({ extended: true }));

const coursesRouter = getCoursesRoutes()
const testsRouter = getTestsRouter()
app.use('/courses', coursesRouter)
app.use('/__tests__', testsRouter)

