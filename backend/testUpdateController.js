import mongoose from 'mongoose';
import { updateProblem } from './controllers/problemController.js';
import Problem from './models/problem.js';

const MONGO_URI = "mongodb+srv://Algoarmy:algoarmy123@ainterview.hlzlpot.mongodb.net/?appName=Ainterview";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const p = await Problem.findOne({ title: "Add Two Integers" });
  if (!p) {
    console.error("Problem not found!");
    await mongoose.disconnect();
    return;
  }

  // Create mock req and res
  const req = {
    params: { id: p._id.toString() },
    body: {
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      statement: p.statement,
      description: p.description,
      constraints: p.constraints,
      sampleInput: p.sampleInput,
      sampleOutput: p.sampleOutput,
      starterCpp: p.starterCode?.cpp || "",
      starterPython: p.starterCode?.python || "",
      starterJava: p.starterCode?.java || "",
      starterJs: p.starterCode?.javascript || "",
      testCases: p.testCases,
      hiddenTestCases: p.hiddenTestCases,
    }
  };

  const res = {
    jsonStatus: 200,
    status(code) {
      this.jsonStatus = code;
      return this;
    },
    json(data) {
      console.log("Controller response status:", this.jsonStatus);
      console.log("Controller response data:", JSON.stringify(data, null, 2));
    }
  };

  console.log("\n--- Simulating updateProblem controller call ---");
  await updateProblem(req, res);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
