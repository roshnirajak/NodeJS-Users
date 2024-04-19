const express = require('express');

const app = express();
app.use(express.json());

// Connection establishing
const connection = require('./conn')
const table = "course";

const getAllCourse = (req, res) => {
    // const query = `
    //   SELECT c.course_id, c.course_name
    //   FROM course c
    //   WHERE c.course_id IN (
    //     SELECT s.course_id 
    //     FROM students s
    //     WHERE s.is_active = 1
    //   )
    // `;
    // const query = `SELECT course_id, course_name FROM course`
  
    // connection.query(query, (err, results) => {
    //   if (err) {
    //     console.error('Error getting courses:', err);
    //     return res.status(500).json({ error: 'Internal Server Error' });
    //   }
  
    //   res.json(results);
    // });
    return knex.select('course_id', 'course_name').table(table)
  };

module.exports = {
    getAllCourse
};
