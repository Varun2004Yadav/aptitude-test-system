import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the backend directory path
const backendDir = path.resolve(__dirname, '..');

try {
    // Sample questions data with the exact column names matching the Excel file
    const questions = [
        {
            'Question': 'What is th18',
            'Option A': '32',
            'Option B': '24',
            'Option C': '20',
            'Option D': '18',
            'Correct Answer': 'B',
            'Type': 'MCQ'
        },
        {
            'Question': 'If the cost ₹600',
            'Option A': '₹580',
            'Option B': '₹620',
            'Option C': '₹540',
            'Option D': '₹500',
            'Correct Answer': 'A',
            'Type': 'MCQ'
        },
        {
            'Question': 'A train 1036 km/h',
            'Option A': '40 km/h',
            'Option B': '36 m/s',
            'Option C': '10 m/s',
            'Option D': '35 m/s',
            'Correct Answer': 'D',
            'Type': 'MCQ'
        },
        {
            'Question': 'What is th4',
            'Option A': '5',
            'Option B': '6.6',
            'Option C': '7',
            'Option D': '8',
            'Correct Answer': 'D',
            'Type': 'MCQ'
        },
        {
            'Question': 'If x + y = 12',
            'Option A': '6',
            'Option B': '7',
            'Option C': '8',
            'Option D': '9',
            'Correct Answer': 'D',
            'Type': 'MCQ'
        }
    ];

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(questions, {
        header: ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Type']
    });

    // Add the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Questions");

    // Write the file
    const filePath = path.join(backendDir, 'sample_questions.xlsx');
    xlsx.writeFile(workbook, filePath);

    console.log('✅ Sample Excel file created at:', filePath);
    console.log('\n📝 Excel file format:');
    console.log('-----------------');
    console.log('| Question | Option A | Option B | Option C | Option D | Correct Answer | Type |');
    console.log('|----------|-----------|-----------|-----------|-----------|--------------|------|');
    console.log('| What is th18 | 32 | 24 | 20 | 18 | B | MCQ |');
} catch (error) {
    console.error('❌ Error generating sample Excel file:', error.message);
    process.exit(1);
} 