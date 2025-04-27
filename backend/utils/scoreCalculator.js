export const calculateScore = async (test, studentAnswers) => {
    let marksObtained = 0;
    const totalMarks = test.totalMarks;
    
    // Calculate marks for each answer
    const answers = studentAnswers.map(answer => {
        const question = test.questions.find(q => q._id.toString() === answer.questionId);
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        const marks = isCorrect ? question.marks : 0;
        
        marksObtained += marks;
        
        return {
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
            marksObtained: marks
        };
    });

    // Calculate percentage
    const percentage = (marksObtained / totalMarks) * 100;
    
    // Determine pass/fail status (assuming 40% is passing)
    const status = percentage >= 40 ? 'pass' : 'fail';

    return {
        totalMarks,
        marksObtained,
        percentage,
        status,
        answers
    };
}; 