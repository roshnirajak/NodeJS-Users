const express = require('express');
const app = express();
const cors = require('cors');
// const userRoutes = 
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const notificationRoutes= require('./src/routes/notificationRoute')
const loggerMiddleware = require('./src/middleware/loggerMiddleware')



app.use(cors())

//use to parse the data in json format
app.use(express.json());

app.use(loggerMiddleware);

app.use('/api', authRoutes);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
