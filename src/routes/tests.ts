import {HTTP_STATUSES} from "../utils";
import express from "express";

export const getTestsRouter = () => {
    const router = express.Router();
    router.delete('/data', (req, res) => {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })
    return router
}