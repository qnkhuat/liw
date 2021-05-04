import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as cert from "./credential.json";
import { body, validatationResult } from "express-validator";
import * as Joi from "joi";

import { Request, Responsei, Next } from 'express'


// *** Validation middleware
const validator = (schema:Joi.Scheme, property: string): void{
  // https://dev.to/itnext/joi-awesome-code-validation-for-node-js-and-express-35pk
  return (req, res, next) => {
    console.log(req);
    const { error } = schema.validate(req[property]);
    const valid = error == null;
    if ( valid ) { next(); }
    else {
      const { details } = error;
      const message = details.map(i => i.message).join(',');
      console.log("error", message);
      res.status(422).json({ error: message });
    }
  }
}

// *** Authen

const isAuthenticated = (req: Request, res: Response, next: Function){
}

// *** Schemas
const itemSchema = Joi.object().keys({
  id: Joi.number().required(),
  item: Joi.object().keys({
    description: Joi.string(),
  }).required(),
})

// *** Firebase
admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: "https://life-61d15.firebaseio.com"
})
admin.firestore().settings({ timestampsInSnapshots: true })
const db: admin.Firestore = admin.firestore();


// *** Expressjs
const app: express.Application = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/ping", (req: Request, res: Response) => {
  return res.status(200).send( new Date() );
})


// *** Routes
app.post("/api/create", validator(itemSchema, "body"), async (req: Request, res: Response) => {
  try {
    await db.collection('items').doc('/' + req.body.id + '/')
      .create({item: req.body.item});
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500.send(error));
  }
})


//POST story
//POST stories
//GET story
//GET stories
//UPDATE story
//UPDATE stories
//POST user
//UPDATE uesr

export const api = functions.https.onRequest(app);
