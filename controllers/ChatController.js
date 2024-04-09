import Chat from "../models/chat.js";
import Room from "../models/Room.js";
import { io } from "../server.js";

export async function sendMessage(req, res) {
    try {
        const { username, text, image, room_id } = req.body;
        
        // Create a new chat message
        const newChatMessage = new Chat({
            username,
            text,
            image,
            room_id // Add room_id to the chat message
        });

        // Save the chat message to the database
        await newChatMessage.save();
        console.log("Message saved to database:", newChatMessage);

        // Emit the chat message
        io.emit("chatMessage", newChatMessage);
        console.log("Message emitted:", newChatMessage);

        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}


export async function getRoomMessages(req, res) {
    try {
        const { room_id } = req.query; // Consider using query parameters for pagination
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if not specified
        const offset = parseInt(req.query.offset, 10) || 0; // Default to 0 if not specified

        // Fetch messages for the specified room with pagination
        const roomMessages = await Chat.find({ room_id })
            .skip(offset) // Skip the first `offset` documents
            .limit(limit) // Limit the results to `limit` documents
            .exec();

        res.status(200).json(roomMessages);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}


export async function getRooms(req, res) {
    try {
        const { username } = req.params;

        // Fetch rooms for the specified username
        const rooms = await Room.find({
            $or: [
                { buyer_username: username },
                { seller_username: username }
            ]
        }).exec();

        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function createRoom(req, res) {
    try {
        const { buyer_username, seller_username } = req.body;

        // Generate a random room_id between 1000 and 9999
        let room_id;
        let exists = true;
        while (exists) {
            room_id = Math.floor(Math.random() * 9000) + 1000;
            // Check if the generated room_id already exists in the database
            const existingRoom = await Room.findOne({ room_id });
            if (!existingRoom) {
                exists = false; // Exit the loop if room_id is unique
            }
        }

        // Create a new room
        const newRoom = new Room({
            room_id,
            buyer_username,
            seller_username
        });

        // Save the room to the database
        await newRoom.save();

        res.status(201).json({ message: "Room created successfully", room_id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
