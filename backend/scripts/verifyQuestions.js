import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import TestQuestion from '../models/TestQuestion.js';

dotenv.config();

const verifyQuestions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all tests
        const tests = await Test.find({});
        console.log(`\nFound ${tests.length} tests in the database`);

        // For each test, get its questions
        for (const test of tests) {
            console.log(`\nTest: ${test.title} (ID: ${test._id})`);
            
            const questions = await TestQuestion.find({ testId: test._id });
            console.log(`Number of questions: ${questions.length}`);
            
            // Display first 3 questions as sample
            questions.slice(0, 3).forEach((q, index) => {
                console.log(`\nQuestion ${index + 1}:`);
                console.log(`Text: ${q.question}`);
                console.log(`Options: ${q.options.join(', ')}`);
                console.log(`Correct Answer: ${q.correctAnswer}`);
                console.log(`Marks: ${q.marks}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

verifyQuestions(); 