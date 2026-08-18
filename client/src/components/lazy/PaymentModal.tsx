import { useState } from "react";
import { X, CreditCard, Lock, CheckCircle2, Loader2 } from "lucide-react";
import Modal from "../lazy/Modal";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export default function PaymentModal({
  open,
  onClose,
  title,
  amount,
  onConfirm,
  isLoading = false,
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [step, setStep] = useState<"payment" | "processing" | "success">(
    "payment"
  );

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (value.length <= 16) {
      value = value.match(/.{1,4}/g)?.join(" ") || value;
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert("Please fill in all payment details");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      alert("Please enter a valid 16-digit card number");
      return;
    }

    setStep("processing");

    try {
      await onConfirm();
      setStep("success");

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setStep("payment");
      alert("Payment failed. Please try again.");
    }
  };

  const handleClose = () => {
    setStep("payment");
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setCvv("");
    onClose();
  };

  return (
    <Modal open={open}>
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Secure Payment</h3>
                <p className="text-xs text-primary-foreground/80">
                  {step === "payment" && "Enter your payment details"}
                  {step === "processing" && "Processing your payment..."}
                  {step === "success" && "Payment successful!"}
                </p>
              </div>
            </div>
            {step === "payment" && (
              <button
                onClick={handleClose}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "payment" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Info */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Items</p>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  ${amount.toFixed(2)}
                </p>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
                    maxLength={19}
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
                <Lock size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your payment information is secure and encrypted. This is a
                  demo transaction.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Pay ${amount.toFixed(2)}
              </button>
            </form>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">
                Processing Payment...
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we process your payment
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">
                Payment Successful!
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Your purchase has been completed successfully
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
