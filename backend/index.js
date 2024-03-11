const express = require('express');
const app = express();
const cors = require('cors');
// const userRoutes = 
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes')
const logger = require('./src/logger/logger')

app.use(logger.requestLogger);
app.use(logger.responseLogger);

app.use(cors())

//use to parse the data in json format
app.use(express.json());


app.use('/api', authRoutes);
app.use('/users', userRoutes);



app.use(logger.errorLogger);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
