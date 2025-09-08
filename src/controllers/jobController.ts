import type { Request, Response } from "express"
import { getDb } from "../db.js"
import { ObjectId } from "mongodb"

const COLLECTION = 'job'

export async function createJob(req: Request, res: Response) {
    console.log("create job called")
    const db = getDb()

    const job = {
        ...req.body,
        consultant: new ObjectId(req.user!.id),
        createdAt: new Date()
    }

    const result = await db.collection(COLLECTION).insertOne(job)
    res.json({...job, _id: result.insertedId})
}


export async function getMyJobs(req: Request, res: Response) {
    console.log("getting jobs for user id: ", req.user!.id)
    const db = getDb()
    const jobs = await db.collection(COLLECTION)
                            .find({consultant: new ObjectId(req.user!.id)})
                            .toArray()
    res.json(jobs)
}

export async function getJob(req: Request, res: Response) {
    console.log("getting job for user id: ", req.user!.id, " job id: ", req.params.id)
    const db = getDb()
    const job = await db.collection(COLLECTION)
                            .find({_id: new ObjectId(req.params.id), consultant: new ObjectId(req.user!.id)})
                            .toArray()
    if(Array.isArray(job) && job.length === 0) {
        return res.status(404).json({error: "Job not found"})
    } else {
        res.json(job[0])
    }
}

export async function getAllJobs(req: Request, res: Response) {
    console.log("getting all jobs")
    const db = getDb()

    const jobs = await db.collection('jobs').find({}).toArray()

    res.json(jobs)
}


export async function updateJob(req: Request, res: Response) {
    console.log("update job called")
    const db = getDb()
    const id = req.params.id
    console.log("updating job with id : ", id)

    delete req.body._id
    console.log(req.body)

    await db.collection(COLLECTION).updateOne(
        {_id: new ObjectId(id)},
        {$set: {...req.body, consultant: new ObjectId(req.user!.id)}}
    )

    const updated = await db.collection(COLLECTION).findOne({"_id": new ObjectId(id)})

    res.json(updated)
}


export async function deleteJob(req: Request, res: Response) {
    console.log("delete job called")
    const db = getDb()
    const id = req.params.id

    await db.collection(COLLECTION).deleteOne({"_id": new ObjectId(id)})

    res.sendStatus(204)
}