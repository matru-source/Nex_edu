import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, CreditCard, ArrowRight, Package } from "lucide-react";
import TopBar from "../../lazy/TopBar";
import { useCartStore } from "../../../state/cart";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../../lazy/PaymentModal";

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, itemCount, isLoading, fetchCart, removeFromCart, checkout, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemove = async (chapterId: string) => {
    await removeFromCart(chapterId);
    await fetchCart();
  };

  const handleCheckoutClick = () => {
    setIsPaymentModalOpen(true);
  };

  const confirmCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const result = await checkout();
      setCheckoutMessage(result.message);
      setCheckoutSuccess(result.success);
      
      if (result.success) {
        // Show success message briefly then redirect
        setTimeout(() => {
          navigate("/purchases");
        }, 2000);
      } else {
        throw new Error(result.message);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
      await fetchCart();
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="w-full min-h-screen bg-background">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Purchase Complete!</h2>
            <p className="text-muted-foreground mb-6">{checkoutMessage}</p>
            <p className="text-sm text-muted-foreground">Redirecting to your purchases...</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-8">
              Add chapters to your cart to continue learning!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Courses
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <TopBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
              <p className="text-muted-foreground">{itemCount} item(s) in your cart</p>
            </div>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              {/* Thumbnail */}
              <div className="w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {item.chapter.tumbnailUrl || item.chapter.module.expertise.skillCategory.course.tumbnailUrl ? (
                  <img
                    src={item.chapter.tumbnailUrl || item.chapter.module.expertise.skillCategory.course.tumbnailUrl || ""}
                    alt={item.chapter.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {item.chapter.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {item.chapter.module.expertise.skillCategory.course.title} • {item.chapter.module.title}
                </p>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end justify-between">
                <span className="text-lg font-bold text-primary">
                  ${item.chapter.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemove(item.chapterId)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="Remove from cart"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({itemCount} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border"></div>
            <div className="flex justify-between text-lg font-semibold text-foreground">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            disabled={items.length === 0}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            Complete Purchase
          </button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By completing this purchase, you agree to our Terms of Service
          </p>
        </div>
      </div>

      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`${itemCount} Chapter${itemCount > 1 ? "s" : ""}`}
        amount={total}
        onConfirm={confirmCheckout}
        isLoading={isCheckingOut}
      />
    </div>
  );
}
