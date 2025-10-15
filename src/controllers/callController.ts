import type { Request, Response } from "express"
import { getDb } from "../db.js"
import { ObjectId } from "mongodb"
import { upsertContact } from "./googleController.js"
import { getJobById } from "./jobController.js"

const COLLECTION = 'call'

interface Call {
    _id?: ObjectId,
    name: string,
    vendor: string,
    phoneNumber: string,
    jobId?: string,
    createdAt?: Date,
    updatedAt?: Date
}

interface Contact {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    notes?: string 
}

async function prepareContact(call: Call): Promise<Contact>  {
    let nameParts = call.name.split(" ")
    let contact = {
        lastName: nameParts.pop() || "",
        firstName: nameParts.join(" ") || "",
        email: call.vendor,
        phone: call.phoneNumber,
        notes: ""
    }
    try{
        if (call.jobId) {
            const job = await getJobById(call.jobId) 
            if (job) {
                contact.notes = `${job?.title} (${job?._id}) - JL: ${job?.jobLocation} - ML: ${job?.myLocation} - ${job?.client} - ${job?.endClient} - ${job?.marketingTeam}`
            }
        }
        return contact
    } catch (error: any) {
        console.error("Error preparing notes for contact:", error);
        return contact
    }
}

export async function createCall(req: Request, res: Response) {
    const db = getDb()

    const call = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const result = await db.collection(COLLECTION).insertOne(call)
    console.log(`created call: ${result}`)
    
    let contact: Contact = await prepareContact(call)
    await upsertContact(contact.firstName, contact.lastName, contact.email, contact.phone, contact.notes )
    res.json({...call, _id: result.insertedId})
}

export async function getAllCalls(req: Request, res: Response) {
    const db = getDb()

    const calls = await db.collection(COLLECTION).find({}).toArray()

    res.json(calls)
}


export async function updateCall(req: Request, res: Response) {
    const db = getDb()
    const id = req.params.id
    delete req.body._id

    const call = req.body
    console.log("updating call with id : ", id)

    console.log(req.body)

    await db.collection(COLLECTION).updateOne(
        {_id: new ObjectId(id)},
        {$set: { ...call, updatedAt: new Date() }}
    )
    // console.log("updated call")
    const updated = await db.collection(COLLECTION).findOne({"_id": new ObjectId(id)})
    console.log(`updated call: ${updated}`)
    let contact: Contact = await prepareContact(call)
    await upsertContact(contact.firstName, contact.lastName, contact.email, contact.phone, contact.notes )
    res.json(updated)
}


export async function deleteCall(req: Request, res: Response) {
    const db = getDb()
    const id = req.params.id

    await db.collection(COLLECTION).deleteOne({"_id": new ObjectId(id)})

    res.sendStatus(204)
}