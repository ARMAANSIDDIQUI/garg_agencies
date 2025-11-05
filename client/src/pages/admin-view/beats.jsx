import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBeats, addNewBeat, editBeatById, resetSuccessMessage, deleteBeat } from '@/store/admin/beats-slice';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FilePenLine, Trash2 } from 'lucide-react'; // Import Trash2 icon
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"; // Import sheet components

const Beats = () => {
  const dispatch = useDispatch();
  const { beatsList, isLoading, error, successMessage } = useSelector((state) => state.beats);
  const { toast } = useToast();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [newBeatName, setNewBeatName] = useState('');
  const [editBeat, setEditBeat] = useState(null); // Track the beat being edited

  // Fetch all beats from the backend on component mount using Redux dispatch
  useEffect(() => {
    dispatch(getAllBeats());
  }, [dispatch]);

  // Handle success and error messages with toast
  useEffect(() => {
    if (successMessage) {
      toast({ title: "Success", description: successMessage, status: "success" });
      dispatch(resetSuccessMessage());
    }
    if (error) {
      toast({ title: "Error", description: error, status: "error" });
    }
  }, [successMessage, error, toast, dispatch]);

  // Function to handle adding a new beat
  const handleAddBeat = async () => {
    if (!newBeatName) return;
    dispatch(addNewBeat(newBeatName));
    setNewBeatName('');
    setSheetOpen(false);
  };

  // Function to handle editing an existing beat
  const handleEditBeat = (beat) => {
    setEditBeat(beat);
    setNewBeatName(beat.beatName);
    setSheetOpen(true); // Open sheet in edit mode
  };

  // Function to submit edited beat
  const handleUpdateBeat = async () => {
    if (!newBeatName || !editBeat) return;
    dispatch(editBeatById({ id: editBeat._id, beatName: newBeatName }));
    setNewBeatName('');
    setEditBeat(null);
    setSheetOpen(false);
  };

  // Function to handle deleting a beat with confirmation
  const handleDeleteBeat = (beat) => {
    if (window.confirm(`Are you sure you want to delete the beat "${beat.beatName}"?`)) {
      dispatch(deleteBeat(beat._id));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Beats</h1>
        <Button onClick={() => { setSheetOpen(true); setEditBeat(null); }} className="bg-blue-500 text-white">
          Add Beat
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {beatsList.map((beat) => (
            <div
              key={beat._id}
              className="bg-white shadow-lg rounded-lg p-6 flex justify-between items-center"
            >
              <h2 className="text-lg font-semibold">{beat.beatName}</h2>
              <div className="flex items-center">
                <FilePenLine 
                  className="cursor-pointer mr-2" 
                  onClick={() => handleEditBeat(beat)} 
                />
                <Trash2 
                  className="cursor-pointer text-red-600" 
                  onClick={() => handleDeleteBeat(beat)} 
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Beat Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editBeat ? "Edit Beat" : "Add New Beat"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter beat name"
              value={newBeatName}
              onChange={(e) => setNewBeatName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <Button
              onClick={editBeat ? handleUpdateBeat : handleAddBeat}
              className="mt-4 bg-blue-500 text-white"
            >
              {editBeat ? "Update Beat" : "Submit"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Beats;
