const Beats = require("../../models/Beats");

const addBeat = async (req, res) => {
  const { beatName } = req.body; // Extract beatName from the body
  try {
    const checkBeat = await Beats.findOne({ beatName });
    if (checkBeat) {
      return res.json({
        success: false,
        message: "Beat already exists with the same name! Please try again.",
      });
    }

    const newBeat = new Beats({
      beatName, // Use the string value here
    });

    await newBeat.save();
    res.status(201).json({
      success: true,
      message: "Beat added successfully.",
      beat: newBeat,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding a new beat.",
    });
  }
};


const getBeats = async (req, res) => {
    try {
      const beats = await Beats.find(); // Fetch all beats
      if (beats.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No beats found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Beats retrieved successfully.",
        beats, // Return the list of beats
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred while retrieving beats.",
      });
    }
  };
  

  const editBeat = async (req, res) => {
    const { beatId } = req.params; // Assume beatId is passed as a route param
    const { beatName } = req.body; // New data for updating
  
    try {
      const beat = await Beats.findById(beatId);
  
      if (!beat) {
        return res.status(404).json({
          success: false,
          message: "Beat not found.",
        });
      }
  
      beat.beatName = beatName || beat.beatName; // Update the beat name, if provided
  
      await beat.save(); // Save the updated beat
  
      res.status(200).json({
        success: true,
        message: "Beat updated successfully.",
        beat, // Return the updated beat
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating the beat.",
      });
    }
  };
  
  const deleteBeat = async (req, res) => {
    const { beatId } = req.params; // Assume beatId is passed as a route param
  
    try {
      const beat = await Beats.findByIdAndDelete(beatId); // Delete the beat by ID
  
      if (!beat) {
        return res.status(404).json({
          success: false,
          message: "Beat not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Beat deleted successfully.",
        beat, // Optionally return the deleted beat
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting the beat.",
      });
    }
  };
  
  module.exports = {
    addBeat,
    getBeats,
    editBeat,
    deleteBeat // Export the deleteBeat function
  };
  