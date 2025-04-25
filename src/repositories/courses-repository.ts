import {CourseViewModel} from "../models/CourseViewModel";
import {client} from "./db";
import {CreateCourseModel} from "../models/CreateCourseModel";
import {ObjectId} from "mongodb";

const coursesCollection = client.db('mydb').collection<CourseViewModel>('courses')

export const coursesRepository = {
    async findCourses(title: string): Promise<CourseViewModel[]> {
        const filter: any = {}
        if (title) {
            filter.title = { $regex: title }
        }
        return coursesCollection.find(filter).toArray();
    },
    async findCourseById(id: string): Promise<CourseViewModel | null> {
        let course: CourseViewModel | null = await coursesCollection.findOne({ id });
        if(course) {
            return course;
        }
        return null;
    },
    async createCourse(title: string): Promise<CourseViewModel> {
        const newCourse: CreateCourseModel = { title };

        const result = await coursesCollection.insertOne(newCourse as CourseViewModel);

        return {
            _id: result.insertedId,
            title: newCourse.title
        };
    },
    async updateCourse(id: string, title: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;
        const result = await coursesCollection.updateOne({ _id: new ObjectId(id) }, { $set: { title } });
        return !!result.matchedCount;
    },
    async deleteCourse(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;
        const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });
        return !!result.deletedCount;
    }
}