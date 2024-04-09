import Task from '../models/task.js'


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
    if (req.body.deadline) {
        try {
            updateData.deadline = calculateDeadline(req.body.deadline);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

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
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.remove();
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
  