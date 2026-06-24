require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" }});

const lessonsDir = path.join(__dirname, 'src', 'api', 'lessons');

async function processFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const prompt = `
      You are an expert technical writer and web development instructor.
      Your task is to take the following JSON file representing a lesson in our platform and EXPAND the \`content\` property of every \`subtopic\` to be extremely comprehensive, similar to the W3Schools format.
      
      RULES:
      1. ONLY modify the \`content\` property of each subtopic. 
      2. The \`content\` string MUST be formatted using Markdown.
      3. For each subtopic content, include:
         - A clear definition/introduction
         - The basic syntax or rule
         - Detailed explanations
         - A "Try it Yourself" or complete code example
         - Best practices
      4. DO NOT change any other keys in the JSON (id, title, description, duration, level, order, learningObjectives, subtopics array structure, glossary, resources). Keep them exactly the same.
      5. Make sure the output is a valid JSON array matching the original schema.
      
      Original JSON:
      ${fileContent}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Validate JSON
    const parsed = JSON.parse(responseText);
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`Successfully expanded ${filePath}`);
  } catch (error) {
    console.error(`Failed to process ${filePath}:`, error);
  }
}

async function run() {
  const courses = fs.readdirSync(lessonsDir).filter(f => fs.statSync(path.join(lessonsDir, f)).isDirectory());
  
  for (const course of courses) {
    console.log(`Processing course: ${course}`);
    const courseDir = path.join(lessonsDir, course);
    const lessonFiles = fs.readdirSync(courseDir).filter(f => f.endsWith('.json'));
    
    for (const file of lessonFiles) {
      const filePath = path.join(courseDir, file);
      console.log(`  -> Expanding ${file}...`);
      await processFile(filePath);
      // Wait 3 seconds to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log("ALL DONE!");
}

run();
