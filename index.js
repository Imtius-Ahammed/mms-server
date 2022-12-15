const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'sk_test_51LXB94DzzWrIfioBAGKjJTvCKDXX8mqZmhTcrmuxT0YVoazfdzus4m7eDFLgMqZw9DMTz9Ej9MMbat1X8Pu9DJPy00YlqYqTiA';
const stripe = require("stripe")(SECRET_KEY);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://mosque:7BSq1R4J2tdYLdOx@cluster0.8bklk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {
        await client.connect();

        const helpCollection = client.db('allCampaign').collection('campaign');
        const eventCollection = client.db('allCampaign').collection('events');
        const grantInfoCollection = client.db('allCampaign').collection('grantInfo');
        const expertsCollection = client.db('allCampaign').collection('experts');
        const userCollection = client.db('allCampaign').collection('users');
        const imamCollection = client.db('allCampaign').collection('imam');

        const KhutbaCollection = client.db('allCampaign').collection('Khutba');


        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }
        }

        app.post('/imam', async (req, res) => {
            const imam = req.body;
            const result = await imamCollection.insertOne(imam);
            res.send(result);
        });

        // load all campaigns from mongodb

        // app.get('/campaigns', async (req, res) => {
        //     console.log('query', req.query);
        //     const query = {};
        //     const cursor = helpCollection.find(query);
        //     const  = await cursor.toArray();
        //     res.send(campaignes);
        // });



        app.get('/campaigns', async (req, res) => {
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = helpCollection.find(query);
            let campaignes;
            if (page || size) {
                // 0 --> skip: 0 get: 0-10(10): 
                // 1 --> skip: 1*10 get: 11-20(10):
                // 2 --> skip: 2*10 get: 21-30 (10):
                // 3 --> skip: 3*10 get: 21-30 (10):
                campaignes = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                campaignes = await cursor.toArray();
            }

            res.send(campaignes);
        });



        app.get('/campaignCount', async (req, res) => {

            const count = await helpCollection.estimatedDocumentCount();
            res.send({ count });
        });


        // app.put('/campaign/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const data = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const updateDoc = {
        //         $set: data
        //     };
        //     const options = { upsert: true };
        //     const result = await helpCollection.updateOne(filter, updateDoc, options);
        //     res.send(result);
        // })


        // app.get('/campaign/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const campaign = await helpCollection.findOne(query);
        //     res.send(campaign);
        // })

        app.get('/campaign/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const result = await helpCollection.findOne(query);
            res.send(result)
        })


        // app.get('/events/:eventsId', async (req, res) => {
        //     const id = req.params.eventsId;
        //     const filter = { _id: ObjectId(id) };
        //     const events = await eventCollection.findOne(filter);
        //     res.send(events)
        // })




        //add campaign
        app.post('/campaigns', async (req, res) => {
            const newcampaign = req.body;
            const result = await helpCollection.insertOne(newcampaign);
            res.send(result);
        });



        //delete
        app.delete('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const campaign = await helpCollection.deleteOne(query);
            res.send(campaign);
        });


        //update
        app.put("/campaign/:id", async (req, res) => {
            const id = req.params.id;
            const campaign = req.body;

            const result = await helpCollection.updateOne(
                { _id: ObjectId(id) }, // Find Data by query many time query type is "_id: id" Cheack on database
                {
                    $set: campaign, // Set updated Data
                },
                { upsert: true } // define work
            );
            res.send({ result });
        });

















        // load all event from mongodb

        app.get('/events', async (req, res) => {
            const query = {};
            const cursor = eventCollection.find(query);
            const events = await cursor.toArray();
            res.send(events);
        });



        app.get('/event/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const event = await eventCollection.findOne(query);
            res.send(event);
        })




        //add event
        app.post('/events', async (req, res) => {
            const newevents = req.body;
            const result = await eventCollection.insertOne(newevents);
            res.send(result);
        });



        //delete event
        app.delete('/event/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const event = await eventCollection.deleteOne(query);
            res.send(event);
        });



        //update event
        //update
        app.put("/event/:id", async (req, res) => {
            const id = req.params.id;
            const event = req.body;

            const result = await eventCollection.updateOne(
                { _id: ObjectId(id) }, // Find Data by query many time query type is "_id: id" Cheack on database
                {
                    $set: event, // Set updated Data
                },
                { upsert: true } // define work
            );
            res.send({ result });
        });



        // load all experts from mongodb

        app.get('/experts', async (req, res) => {
            const query = {};
            const cursor = expertsCollection.find(query);
            const experts = await cursor.toArray();
            res.send(experts);
        });




        //khutba add

        app.post("/addKhutba", async (req, res) => {
            const postKhutba = req.body;
            const result = await KhutbaCollection.insertOne(postKhutba);
            res.send(result);
        });

        //get khutba
        app.get('/allKhutba', async (req, res) => {
            const query = {};
            const allKhutba = await KhutbaCollection.find(query).toArray();
            res.send(allKhutba);
        });

        // //delete khutba
        // app.delete('/allKhutba/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = {
        //         _id: ObjectId(id)
        //     };
        //     const result = await khutbaCollection.deleteOne(filter);
        //     res.send(result);
        // })






        // **************User**************

        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);


        });

        //user info save to database 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            // console.log(user)
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });


        })





        // app.get('/user', async (req, res) => {
        //     const query = {};
        //     const cursor = userCollection.find(query);
        //     const users = await cursor.toArray();
        //     res.send(users);
        // });



        // an admin can only make admin

        app.get('/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        // make a admin and verify

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }

        })




        ///donate

        app.post('/grant-info', async (req, res) => {
            const data = req.body;
            const result = await grantInfoCollection.insertOne(data);
            res.send(result);
        });

        app.get('/grant-info', async (req, res) => {
            const result = await grantInfoCollection.find().toArray();
            res.send(result)
        });

        app.get('/grant-info/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await grantInfoCollection.findOne(filter);
            res.send(result)
        });

        app.post('/create-payment-intent', async (req, res) => {
            // const { price } = req.body; // or 
            const data = req.body;
            const amount = data.amount;
            const price = amount * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: price, // dollar needs to be converted to cents
                currency: 'usd',
                "payment_method_types": [
                    "card"
                ],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        })










    }
    finally {

    }
}

run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Running Masque Management Server');
});

app.get('/test', (req, res) => {
    res.send('running test server');
});


app.listen(port, () => {
    console.log('listining to port', port);
})
