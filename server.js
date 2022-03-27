import express from 'express';
import cors from 'cors';
import knex from 'knex';
import bcrypt from 'bcrypt-nodejs';
import register from './controllers/register.js';
import {signinAuthentication} from './controllers/signin.js';
import {handleProfileGet, handleProfileUpdate} from './controllers/profile.js';
import {handleImage, handleApiCall} from './controllers/image.js';
import morgan from 'morgan';
import requireAuth from './controllers/authorization.js';
import handleSignOut from './controllers/signout.js';
import redis from 'redis';

const redisClient = redis.createClient({url: process.env.REDIS_URL});

const db=knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL, //where database lives
    ssl: {
      rejectUnauthorized: false
    } 
  }
});

const app=express();
app.use(express.json());
app.use(morgan('combined'))
app.use(cors());

app.get('/',(req, res)=>{res.send('it is working')})
app.post('/signin', signinAuthentication(db, bcrypt)) //Dependency Injection
app.post('/register', register(db, bcrypt))
app.get('/profile/:id', requireAuth, (req, res)=>{handleProfileGet(req, res, db)})
app.post('/profile/:id', requireAuth, (req, res)=>{handleProfileUpdate(req, res, db)})
app.put('/image', requireAuth, (req, res)=>{handleImage(req, res, db)})
app.post('/imageurl', requireAuth, (req, res)=>{handleApiCall(req, res)})
app.put('/signout', requireAuth, (req, res)=>{handleSignOut(req, res)})

app.listen(3000,()=>{
	console.log(`app is running on port 3000`);
});

export default redisClient;