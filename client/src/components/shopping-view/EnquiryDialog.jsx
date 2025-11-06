import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

function EnquiryDialog({ open, setOpen, productId, handleSendEnquiry, isLoading }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const phoneRegex = /^\d{10}$/;

    if (!email || !message || !phone) {
      toast({
        title: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast({
        title: "Phone number must be 10 digits.",
        variant: "destructive",
      });
      return;
    }

    handleSendEnquiry({ productId, email, message, phone });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enquire about this product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Your Phone Number"
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 10 && /^[0-9]*$/.test(value)) {
                setPhone(value);
              }
            }}
          />
          <Textarea
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Enquiry"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default EnquiryDialog;
