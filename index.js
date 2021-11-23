const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');
require('dotenv').config()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rf28w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run () {
    try{
        await client.connect();
        
        const database = client.db("travel-booking");
        const placesCollection = database.collection("places");
        const bookingCollection = database.collection("booking");

        //booking data send on database ....
        app.post ('/booking', async (req, res) => {
            const data = req.body
            const bookedUser = {
                name : data.name,
                email : data.email,
                address : data.address,
                number : data.number,
                status : data.status,
                place : data.place,
                date : data.date,
                duration : data.tourTime
            }
            const bookedResult = await bookingCollection.insertOne(bookedUser)
            res.json(bookedResult)

        })
        //places data send on database
        app.post('/places', async (req, res) => {
            const data = req.body
            console.log(data);
            const addDestination = {
                name : data.name,
                details : data.details,
                image : data.image ,
                price : data.price,
                tourDuration : data.tourTime,
                date : data.date
            }
            const places = await placesCollection.insertOne(addDestination)
            res.json(places)
        })

        //delete booking data from database
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id : ObjectId(id)}
            const result = await bookingCollection.deleteOne(query)
            res.json(result)
        })

        //booking status change from data base
        app.put('/booking/:id' , async (req, res) => {
            const id = req.params.id
            console.log('updating ', id);
            const updateItem= req.body
            const filter = {_id : ObjectId(id)}
            const option = {upsert : true}
            const updateBooking = {
                $set : {
                    name : updateItem.name,
                    email : updateItem.email,
                    address : updateItem.address,
                    number : updateItem.number,
                    place : updateItem.place,
                    status : updateItem.status,
                    date : updateItem.date,
                    duration : updateItem.duration,
                }
            }
            const result = await bookingCollection.updateOne(filter, updateBooking,option)
            res.json(result)
        })
        //bookings data get from server
        app.get('/booking', async (req, res) => {
            const cursor = bookingCollection.find({})
            const AllUserBooking = await cursor.toArray()
            res.send(AllUserBooking)
        })

        //places data get from server
        app.get('/places', async (req, res) => {
            const cursor = placesCollection.find({})
            const places = await cursor.toArray()
            res.send(places)
        })

        //places single data get from server by id 
        app.get('/places/:id', async (req,res) => {
            const id = req.params.id
            const query = {_id : ObjectId(id)}
            console.log(query);
            const place =  await placesCollection.findOne(query)
            res.send(place)
         })


    }
    finally{
        //await client.close();
    }
}

run().catch(console.dir)

app.get('/',  (req,res) => {
    res.send('Travel Booking Site')
})

app.listen(port, () => {
    console.log('Server running on port' , port);
})