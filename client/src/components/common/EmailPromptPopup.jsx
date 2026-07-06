import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserEmail } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function EmailPromptPopup() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    // Show prompt only for shops (user) and salespersons (salesman)
    if (
      isAuthenticated &&
      user &&
      (user.role === "user" || user.role === "salesman") &&
      !user.email
    ) {
      // Check if dismissed in this session
      const dismissed = sessionStorage.getItem("emailPromptDismissed");
      if (!dismissed) {
        setOpen(true);
      }
    } else {
      setOpen(false);
    }
  }, [isAuthenticated, user]);

  const validateEmail = (val) => {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email Address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(updateUserEmail({ userId: user.id, email })).unwrap();
      if (response?.success) {
        toast({
          title: "Email Updated Successfully",
          description: "You will now receive order notifications at " + email,
        });
        setOpen(false);
      } else {
        toast({
          title: "Update Failed",
          description: response?.message || "Failed to update email.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred",
        description: "Could not update email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("emailPromptDismissed", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-orange-600">Add Your Email Address</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-2">
            To receive order confirmation receipts and invoices directly in your inbox, please provide your email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. shop@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismiss}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Remind Me Later
            </Button>
            <Button
              type="submit"
              disabled={loading || !validateEmail(email)}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? "Saving..." : "Save Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EmailPromptPopup;
