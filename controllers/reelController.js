import Reel from "../models/reel.js";

// Controller function to create a new reel
export const addReel = async (req, res) => {
    try {
        const reel = await Reel.create(req.body);
        res.status(201).json(reel);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

// Controller function to get all reels
export const getAllReels = async (req, res) => {
    try {
        const reels = await Reel.find();
        res.status(200).json(reels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to get a reel by ID
export const getReelById = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) {
            res.status(404).json({ message: 'Reel not found' });
        } else {
            res.status(200).json(reel);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to update a reel by ID
export const updateReel = async (req, res) => {
    try {
        const reel = await Reel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reel) {
            res.status(404).json({ message: 'Reel not found' });
        } else {
            res.status(200).json(reel);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to delete a reel by ID
export const deleteReel = async (req, res) => {
    try {
        const deletedReel = await Reel.findByIdAndDelete(req.params.id);
        if (!deletedReel) {
            res.status(404).json({ message: 'Reel not found' });
        } else {
            res.status(200).json({ message: 'Reel deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Assuming you have a Reel model imported or defined

export async function updateCommentInReel(req, res) {
    try {
        const reelId = req.params.reelId;
        const commentId = req.params.commentId;

        const updatedReel = await Reel.findOneAndUpdate(
            {
                _id: reelId,
                'comments._id': commentId,
            },
            {
                $set: {
                    'comments.$[comment].content': req.body.content,
                },
            },
            {
                new: true,
                arrayFilters: [{ 'comment._id': commentId }],
            }
        );

        if (!updatedReel) {
            return res.status(404).json({ error: 'Reel or comment not found.' });
        }

        res.json(updatedReel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function addCommentToReel(req, res) {
    try {
        const reelId = req.params.id;

        // Assuming req.body contains the necessary information for the new comment
        const newComment = {
            userName: req.body.user,
            comment: req.body.comment,
        };

        const updatedReel = await Reel.findByIdAndUpdate(
            reelId,
            {
                $push: { comments: newComment },
            },
            { new: true }
        );

        if (!updatedReel) {
            return res.status(404).json({ error: 'Reel not found.' });
        }

        res.json(updatedReel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function deleteCommentFromReel(req, res) {
    try {
        const reelId = req.params.reelId;
        const commentId = req.params.commentId;

        const updatedReel = await Reel.findByIdAndUpdate(
            reelId,
            {
                $pull: { comments: { _id: commentId } },
            },
            { new: true }
        );

        if (!updatedReel) {
            return res.status(404).json({ error: 'Reel not found.' });
        }

        res.json(updatedReel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function likeReel(req, res) {
    try {
        const reelId = req.params.reelId;
        const userId = req.body.userId;

        const reel = await Reel.findById(reelId);

        if (!reel) {
            return res.status(404).json({ error: 'Reel not found.' });
        }

        const isLiked = reel.likes.some((like) => like.user === userId);

        const updatedReel = await Reel.findByIdAndUpdate(
            reelId,
            {
                [isLiked ? '$pull' : '$push']: { likes: { user: userId, reelId: reelId } },
            },
            { new: true }
        );

        const action = isLiked ? 'disliked' : 'liked';
        res.status(200).json(`The reel has been ${action}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

