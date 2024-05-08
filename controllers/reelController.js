import Reel from "../models/reel.js";
import axios from 'axios';
import { ObjectId } from 'mongodb';
import mongoose from "mongoose";
import Views from "../models/Views.js";
import Like from "../models/likes.js";
// Controller function to create a new reel
export const addReel = async (req, res) => {
    try {
        const reel = await Reel.create(req.body);
        console.log(reel);
        axios.post('https://reelrecommendationwithai.onrender.com/reels/reel', reel)
        .then(response => {
          // Handle success
          res.status(201).json(response.data);
        })
        .catch(error => {
          // Handle error
          console.error('Error:', error);
        });
        
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};
export const getrecommendedreel = async (req, res) => {
    const reelsvalid = [];
    const userId = req.body.userId;
    var hashtag = {hashtags: "#kungufupanda #cartoon #quote #education #cartoons #anime #kids #panda #animal"}
    try {
           const lastLike = await Like.findOne({ userId }).sort({ _id: -1 });

           console.log(lastLike);
           if(lastLike!=null){
           const reellast = await Reel.findById(lastLike.reelId);
           const hashIndex = reellast.reelDescription.indexOf('#');
           if (hashIndex != -1) {
           hashtag.hashtags = reellast.reelDescription.substring(hashIndex);
           
           }
        }
        console.log(hashtag);
        axios.post('https://reelrecommendationwithai.onrender.com/reels/reelrecommend', hashtag)
            .then(async response => {
                for (const item of response.data) {
                    try {
                        if (item.Id.toString().length > 6) {
                            var reel = await Reel.findById(item.Id);
                            console.log(reel);   
                            if (reel) {
                                var view = await Views.findOne({ userId :userId , reelId : reel._id });
                                console.log(view);   
                                if(view ==null){
                                    console.log("nullll")
                                reelsvalid.push(reel);
                                }
                            } else {
                                console.log(`Reel not found for id: ${item.id}`);
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
                console.log(reelsvalid); // This will log the reelsvalid array correctly
                // Send response after all reels are processed
                res.status(201).json(reelsvalid);
            })
            .catch(error => {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            });
        
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
export const addaview = async (req, res) => {
    try {
        const view = await Views.create(req.body);
        console.log(view);
        
          // Handle success
          res.status(201).json(view);
      
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};
export const addalike = async (req, res) => {
    try {
        // Find the reel document by URL
        const reel = await Reel.findOne({ url: req.body.reelId });
        console.log("reeeeeeel");
        console.log(reel);
        
        if (!reel) {
            // Handle case where reel is not found
            return res.status(404).json({ message: "Reel not found" });
        }

        // Create a new like
        const like = await Like.create({ userId: req.body.userId, reelId: reel._id });

        // Push the like into the likeCount arrayy
        reel.likeCount.push(like);
        var id = {id: reel._id };

        // Save the updated reel documentt
        await reel.save();
        axios.post('https://reelrecommendationwithai.onrender.com/reels/updatelike', id)
            .then(async response => {
                 // This will log the reelsvalid array correctly
                // Send response after all reels are processedd
                console.log(response);
            })
            .catch(error => {
                console.error('Error:', error);
                res.status(500).json({ message: 'Internal server error' });
            });

        // Handle success
        res.status(201).json(like);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};


