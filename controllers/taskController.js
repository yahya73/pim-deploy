import Task from '../models/task.js'
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AiQuiz from '../models/aiQuiz.js';
import User from '../models/User.js';

// Add a task
export const addTask = async (req, res) => {
    try {
        // Set default values for unspecified fields
        const defaults = {
            description: "None",
            amount: 1, // Default amount set to 1
            status: false,
            qcmQuestion: "None",
            qcmOptions: "None",
            Answer: "None",
        };
    
        // Prepare the task data with defaults for missing fields
        let taskData = { ...defaults, ...req.body };
  
        // Handle the deadline separately if provided
        try {
            taskData.deadline = calculateDeadline(req.body.deadline);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    
        // Validation for qcm type
        if (taskData.validationType === "qcm") {
            if (!taskData.qcmQuestion || taskData.qcmQuestion === "None" || !taskData.qcmOptions || taskData.qcmOptions === "None") {
            return res.status(400).json({ message: "qcmQuestion and qcmOptions must not be empty for 'qcm' validationType" });
            }
        }
    
        const newTask = new Task(taskData);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//update task
export const updateTask = async (req, res) => {
    const { id } = req.params;

    // Handle the deadline separately if provided
    let updateData = req.body;
    console.log(id)
    console.log(updateData)
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

    res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Get all tasks by parent username
export const getAllTasks = async (req, res) => {
    try {
      // Assuming the parent's username is passed as a query parameter 'parentUsername'
      const parentUsername = req.query.parentUsername;
  
      if (!parentUsername) {
        return res.status(400).json({ message: "Parent username is required." });
      }
  
      const allTasks = await Task.find({ parentUsername: parentUsername });
  
      res.status(200).json(allTasks);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};


// Get all ongoing tasks (status: false) by parent username
export const getOngoingTasks = async (req, res) => {
    try {
      // Assuming the parent's username is passed as a query parameter 'parentUsername'
      const parentUsername = req.query.parentUsername;
  
      if (!parentUsername) {
        return res.status(400).json({ message: "Parent username is required." });
      }
  
      // Find tasks with 'status' false (ongoing) that were created by the specified parent
      const ongoingTasks = await Task.find({ status: false, parentUsername: parentUsername });
  
      res.status(200).json(ongoingTasks);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};
  
// Get all finished tasks (status: true)
export const getFinishedTasks = async (req, res) => {
try {
    // Assuming the parent's username is passed as a query parameter 'parentUsername'
    const parentUsername = req.query.parentUsername;
    
    if (!parentUsername) {
      return res.status(400).json({ message: "Parent username is required." });
    }

    const finishedTasks = await Task.find({ status: true, parentUsername: parentUsername });
    res.status(200).json(finishedTasks);
} catch (error) {
    res.status(400).json({ message: error.message });
}
};


// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const task = await Task.findById(id);
    console.log(task)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



//functions 
function calculateDeadline(durationStr) {
    const currentTime = new Date();
    const numberPattern = /\d+/; // Regular expression to extract the number
    const unitPattern = /[a-zA-Z]+/; // Regular expression to extract the time unit (e.g., day, month)
  
    const number = parseInt(durationStr.match(numberPattern)[0], 10);
    const unit = durationStr.match(unitPattern)[0];
  
    switch (unit) {
      case 'day':
      case 'days':
        currentTime.setDate(currentTime.getDate() + number);
        break;
      case 'week':
      case 'weeks':
        currentTime.setDate(currentTime.getDate() + number * 7);
        break;
      case 'month':
      case 'months':
        currentTime.setMonth(currentTime.getMonth() + number);
        break;
      case 'year':
      case 'years':
        currentTime.setFullYear(currentTime.getFullYear() + number);
        break;
      default:
        throw new Error('Invalid time unit in deadline string');
    }
  
    return currentTime;
  }


  //AI QUIZ

  // This function is not exported
  async function createAiTask(parentUsername, childUsername, age, amount) {
    try {
      const apiKey = process.env.GEMINI_API;
  
      if (!apiKey) {
        throw new Error("Missing API key (process.env.GEMINI_API)");
      }
  
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      let question, answer;
      while (true) {
        const prompt = `Generate a single quiz question suitable for a ${age}-year-old. The question should be presented as follows: "[AI QUIZ] Question goes here?". The answer should be between double curly braces, like {{answer}}.`;
  
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("response:", text);
  
        const regex = /\[AI QUIZ\] (.*\?)\n.*\{\{(.*)\}\}/;
        const match = text.match(regex);
  
        if (match && match.length === 3) {
          question = match[1];
          answer = match[2];
          break; // Break the loop if a valid question and answer are found
        } else {
          console.log("Invalid format. Asking for another question.");
        }
      }
  
      const taskData = {
        childUsername,
        parentUsername,
        description: "None",
        title: `[AI QUIZ] ${question}`,
        amount: amount,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        validationType: "question",
        Answer: answer,
        status: false,
        qcmQuestion: "None",
        qcmOptions: "None",
        status: false
      };
  
      const newTask = new Task(taskData);
      const savedTask = await newTask.save();
  
      return savedTask;
    } catch (error) {
      console.error("Error generating AI task:", error);
      throw error;
    }
  }
  

// Usage example (assuming Task is defined elsewhere)
export const generateAiTask = async (req, res) => {
  const { childUsername, parentUsername, age } = req.body;

  try {
    const savedTask = await createAiTask(parentUsername, childUsername, age);
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error generating AI task:", error);
    res.status(500).json("error");
  }
};

  
export async function activateAi(req, res) {
  console.log("activateAi called");
  const { childUsernames, parentUsername, age, amount } = req.body;

  if (!childUsernames || !parentUsername || !age || !Array.isArray(childUsernames)) {
      return res.status(400).json({ message: "Missing or incorrect required fields (childUsernames must be an array, parentUsername, age)" });
  }

  console.log(amount)

  try {
      const results = [];
      for (const childUsername of childUsernames) {
          const existingQuiz = await AiQuiz.findOne({ childUsername, parentUsername });

          if (existingQuiz) {
              await AiQuiz.deleteOne({ childUsername, parentUsername });
              results.push({ childUsername, status: 'AI deactivated' });
          } else {
              const newQuiz = new AiQuiz({ childUsername, parentUsername, age, amount });
              await newQuiz.save();
              results.push({ childUsername, status: 'AI activated' });
          }
      }
      
      return res.status(200).json(results);
  } catch (error) {
      console.error("Error activating AI:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
}
  
  export async function sendAiQuizes() {
    try {
      // Fetch all AiQuiz entries
      const aiQuizes = await AiQuiz.find({});
  
      // Loop through each AiQuiz entry
      for (const quiz of aiQuizes) {
        const { childUsername, parentUsername, age, amount } = quiz;
        await createAiTask(parentUsername, childUsername, age, amount);
      }
  
      console.log("AI quizzes sent successfully");
    } catch (error) {
      console.error("Error sending AI quizzes:", error);
      // Handle errors appropriately (e.g., logging, retries)
    }
  }

  export async function getKids(req, res) {
    const parentUsername = req.body.parentUsername;

    try {
        // Find the parent user by username
        const parent = await User.findOne({ username: parentUsername });
        if (!parent) {
            return res.status(404).send({ message: "Parent not found." });
        }

        // Now find all children linked to this parent's _id
        const children = await User.find({
            role: 'child',
            parentid: parent._id
        });

        const childrenUsernames = children.map(child => child.username);

        // Find which children are activated
        const activatedChildren = await AiQuiz.find({
            parentUsername: parentUsername,
            childUsername: { $in: childrenUsernames } // Search for any quiz entries matching the child usernames
        }).distinct('childUsername'); // Only return unique usernames

        // Return the list of all child usernames and those that have been activated
        return res.status(200).send({
            childUsernames: childrenUsernames,
            activated: activatedChildren
        });
    } catch (error) {
        return res.status(500).send({ message: "Server error: " + error.message });
    }
}
  