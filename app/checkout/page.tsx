"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext"; // adjust path if needed
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

/**
 * Checkout page with UPI autocomplete + bank name mapping
 *
 * Features:
 * - UPI-id input with live validation (regex)
 * - Autocomplete suggestions for common UPI suffixes (e.g., @okhdfc, @ybl)
 * - Bank name shown when suffix matches known list
 * - Confirm & Pay disabled when UPI invalid
 * - Auto-focus & input focus stability (no losing focus)
 */

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  // Shipping form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [agree, setAgree] = useState(false);

  // Payment UI state
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "upi-id" | "upi-qr" | null
  >(null);
  const [upiId, setUpiId] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // UPI suggestion + bank mapping
  const upiSuffixes: { suffix: string; bank: string }[] = [
    { suffix: "@okaxis", bank: "Axis Bank (OKaxis)" },
    { suffix: "@okhdfc", bank: "HDFC Bank (OKHDFC)" },
    { suffix: "@ybl", bank: "YES Bank (YBL)" },
    { suffix: "@ibl", bank: "IndusInd Bank (IBL)" },
    { suffix: "@oksbi", bank: "State Bank of India (SBI)" },
    { suffix: "@upi", bank: "Generic UPI" },
    { suffix: "@paytm", bank: "Paytm Payments Bank" },
    { suffix: "@icici", bank: "ICICI Bank" },
    { suffix: "@axis", bank: "Axis Bank" },
    // add more if needed
  ];

  const suggestionRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Pricing logic
  const subtotal = useMemo(
    () => (cart && cart.length ? cart.reduce((s, i) => s + i.price * i.qty, 0) : 0),
    [cart]
  );

  // Auto apply 40% if subtotal > 999
  const discount = useMemo(() => {
    if (subtotal > 999) return Math.round(subtotal * 0.4);
    return 0;
  }, [subtotal]);

  const shipping = subtotal > 0 ? 50 : 0; // flat shipping if any item
  const total = Math.max(0, subtotal - discount + shipping);

  // --- placeOrder: existing save logic (saves to backend + localStorage + redirect)
  const placeOrder = async (orderPayload: any) => {
    setLoading(true);
    try {
      // 1) Try saving to backend (if backend available)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch("http://localhost:4000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          console.error("Order API error:", err || res.statusText);
          toast.error(err?.message || "Could not save order to server. Order not completed.");
          setLoading(false);
          return false;
        }
      } catch (err) {
        console.error("Order POST failed:", err);
        toast.error("Could not reach server to save order. Try again.");
        setLoading(false);
        return false;
      }

      // 2) Save order locally (for order-success page + receipt)
      try {
        localStorage.setItem("lastOrder", JSON.stringify(orderPayload));
      } catch (err) {
        console.warn("Could not save order to localStorage", err);
      }

      // 3) Clear cart and redirect
      clearCart();
      toast.success("Order placed!");
      router.push("/order-success");
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Build order payload (shared)
  const buildOrderPayload = () => {
    const orderId = `ORD-${uuidv4().split("-")[0].toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const items = cart.map((it) => ({
      productId: it.productId,
      title: it.title,
      price: it.price,
      qty: it.qty,
      image: it.image || null,
    }));

    const originalSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discountVal = originalSubtotal > 999 ? Math.round(originalSubtotal * 0.4) : 0;
    const discountedSubtotal = Math.max(0, originalSubtotal - discountVal);
    const shippingVal = originalSubtotal > 0 ? 50 : 0;
    const totalVal = Math.max(0, discountedSubtotal + shippingVal);

    return {
      orderId,
      items,
      originalSubtotal,
      subtotal: discountedSubtotal,
      discount: discountVal,
      shipping: shippingVal,
      total: totalVal,
      billing: {
        name: fullName,
        email,
        phone,
        country,
        city,
        state: stateVal,
        zip,
      },
      payment: {
        brand: paymentMethod === "cod" ? "COD" : paymentMethod === "upi-id" ? "UPI" : "UPI-QR",
        last4: paymentMethod === "cod" ? "N/A" : paymentMethod === "upi-id" ? upiId.slice(-4) : "QR",
        method: paymentMethod,
      },
      createdAt,
    };
  };

  // UPI validation regex (basic)
  const isValidUpi = (v: string) => /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(v.trim());

  // derive suggestions based on current input
  const getSuggestions = (input: string) => {
  const trimmed = input.trim();
  const atIndex = trimmed.indexOf("@");
  const left = atIndex === -1 ? trimmed : trimmed.slice(0, atIndex);
  const rightPart = atIndex === -1 ? "" : trimmed.slice(atIndex);
  const q = rightPart.toLowerCase();

  if (!left) return [];

  // Filter suggestions
  const matches = upiSuffixes.filter((s) => {
    if (!q || q === "@") return true;
    return (
      s.suffix.toLowerCase().startsWith(q) ||
      s.suffix.toLowerCase().includes(q)
    );
  });

  // ➜ LIMIT TO MAX 3
  return matches.slice(0, 3);
};


  // when user clicks suggestion
  const handleSelectSuggestion = (suffix: string) => {
    const atIndex = upiId.indexOf("@");
    const localPart = atIndex === -1 ? upiId.trim() : upiId.slice(0, atIndex);
    const newVal = `${localPart}${suffix}`;
    setUpiId(newVal);
    // focus input
    inputRef.current?.focus();
  };

  // Called when user confirms the payment step
  const handleConfirmPayment = async () => {
    // validate basics
    if (!fullName || !email || !phone || !country) {
      toast.error("Please fill required shipping fields.");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please choose a payment method.");
      return;
    }

    // COD: immediate
    if (paymentMethod === "cod") {
      const order = buildOrderPayload();
      await placeOrder(order);
      return;
    }

    // UPI via ID: validate UPI then simulate a success (you can later integrate payment verification)
    if (paymentMethod === "upi-id") {
      if (!isValidUpi(upiId)) {
        toast.error("Enter a valid UPI ID (e.g. name@bank).");
        return;
      }
      // simulate processing
      setLoading(true);
      setTimeout(async () => {
        setLoading(false);
        toast.success("UPI payment received (simulated).");
        const order = buildOrderPayload();
        await placeOrder(order);
      }, 900);
      return;
    }

    // UPI via QR: show modal; actual confirmation handled by user clicking "I paid"
    if (paymentMethod === "upi-qr") {
      setShowQrModal(true);
      return;
    }
  };

  // When user scanned QR and clicks "I paid"
  const handleQrConfirmed = async () => {
    setShowQrModal(false);
    toast.success("Payment confirmed (QR).");
    const order = buildOrderPayload();
    await placeOrder(order);
  };

  // get bank name from suffix if any
  const getBankNameForUpi = (v: string) => {
    const atIndex = v.indexOf("@");
    if (atIndex === -1) return null;
    const suffix = v.slice(atIndex).toLowerCase();
    const found = upiSuffixes.find((s) => s.suffix.toLowerCase() === suffix);
    return found ? found.bank : null;
  };

  // Render PaymentChooser inline
  const PaymentChooser = () => {
    const suggestions = getSuggestions(upiId);
    const bankName = getBankNameForUpi(upiId);

    return (
      <div className="bg-white border rounded-lg p-3 relative">
        <div className="text-sm font-medium mb-2">Choose payment method</div>

        <div className="flex flex-col gap-2">
          <label
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setPaymentMethod("cod")}
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            <div>
              <div className="font-medium">Cash on Delivery</div>
              <div className="text-xs text-gray-500">Pay when the order arrives</div>
            </div>
          </label>

          {/* UPI via ID option - input moved outside label to avoid focus loss */}
          <div className="flex items-start gap-3">
            <label
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                setPaymentMethod("upi-id");
                // focus input after short delay so radio click resolves first
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "upi-id"}
                onChange={() => setPaymentMethod("upi-id")}
              />
              <div>
                <div className="font-medium">UPI — Pay via UPI ID</div>
                <div className="text-xs text-gray-500">Enter your UPI ID (e.g., name@bank)</div>
              </div>
            </label>

            {paymentMethod === "upi-id" && (
              <div className="pl-2 pt-1 flex-1 relative">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()} // prevents label from stealing focus
                    autoFocus
                    inputMode="text"
                    placeholder="yourid@bank"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />

                  {/* Live validation icon */}
                  {upiId.length > 0 && (
                    isValidUpi(upiId) ? (
                      <span className="text-green-600 font-bold text-lg">✔</span>
                    ) : (
                      <span className="text-red-600 font-bold text-lg">✖</span>
                    )
                  )}

                  {/* bank name pill */}
                  {bankName && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {bankName}
                    </span>
                  )}
                </div>

                {/* suggestion dropdown */}
                {suggestions.length > 0 && upiId.trim().length > 0 && (
                  <div
                    ref={suggestionRef}
                    className="absolute left-0 top-full z-40 mt-2 w-full bg-white border rounded-md shadow-sm"
                    role="listbox"
                  >
                    {suggestions.map((s) => (
                      <div
                        key={s.suffix}
                        role="option"
                        onMouseDown={(e) => {
                          // mousedown used instead of click to avoid blur on input
                          e.preventDefault();
                          handleSelectSuggestion(s.suffix);
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                      >
                        <div className="text-sm">{(upiId.split("@")[0] || upiId) + s.suffix}</div>
                        <div className="text-xs text-gray-500">{s.bank}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Validation message */}
                {upiId.length > 0 && !isValidUpi(upiId) && (
                  <div className="text-xs text-red-500 mt-1">
                    Enter a valid UPI ID format (example: name@bank)
                  </div>
                )}

                {upiId.length > 0 && isValidUpi(upiId) && (
                  <div className="text-xs text-green-600 mt-1">
                    UPI ID looks good!
                  </div>
                )}
              </div>
            )}
          </div>

          <label
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setPaymentMethod("upi-qr");
            }}
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "upi-qr"}
              onChange={() => setPaymentMethod("upi-qr")}
            />
            <div>
              <div className="font-medium">UPI — Scan QR</div>
              <div className="text-xs text-gray-500">Scan with your phone UPI app and confirm payment</div>
            </div>
          </label>
        </div>

        <div className="mt-3">
          <button
            onClick={handleConfirmPayment}
            disabled={
              loading ||
              (paymentMethod === "upi-id" && !isValidUpi(upiId))
            }
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold disabled:opacity-60"
          >
            {loading ? "Processing..." : "Confirm & Pay"}
          </button>
        </div>
      </div>
    );
  };

  // If cart empty
  if (!cart || cart.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-500">Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Shipping form */}
        <section className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Full name *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Enter full name" />

            <label className="block text-sm font-medium">Email address *</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Enter email" />

            <label className="block text-sm font-medium">Phone number *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Enter phone number" />

            <label className="block text-sm font-medium">Country *</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Country" />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium">State</label>
                <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="State" />
              </div>
              <div>
                <label className="block text-sm font-medium">ZIP Code</label>
                <input value={zip} onChange={(e) => setZip(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="ZIP" />
              </div>
            </div>

            <label className="flex items-center gap-2 mt-3">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span className="text-sm">I have read and agree to the Terms & Conditions.</span>
            </label>
          </div>
        </section>

        {/* RIGHT: Order summary + payment chooser */}
        <aside className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Review your cart</h2>

            <div className="space-y-4">
              {cart.map((it) => (
                <div key={it.productId} className="flex items-center gap-3">
                  <img src={it.image || "/placeholder.png"} className="w-16 h-16 object-cover rounded" alt={it.title} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{it.title}</div>
                    <div className="text-xs text-gray-500">{it.qty} × ₹{it.price}</div>
                  </div>
                  <div className="font-semibold">₹{it.price * it.qty}</div>
                </div>
              ))}

              <div className="mt-4 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {/* Auto-applied coupon */}
                {discount > 0 ? (
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <div className="text-sm font-medium">Coupon applied</div>
                      <div className="text-xs text-gray-500">SAVE40 (40% off)</div>
                    </div>
                    <div className="text-red-600">-₹{discount}</div>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>No coupon available</span>
                    <span>—</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{shipping}</span>
                </div>

                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment chooser component (inline) */}
          <PaymentChooser />

          {/* Quick note */}
          <div className="text-xs text-gray-500">
            You won't be redirected to another page. Choose a payment method above, confirm payment and we'll complete your order on this screen.
          </div>
        </aside>
      </div>

      {/* QR Modal */}
      {/* QR Modal */}
{showQrModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
      <h3 className="text-lg font-semibold mb-3">Scan to pay (UPI)</h3>
      <div className="flex flex-col items-center gap-4">
        {/* QR image: put your image in public/qr.png (or change path below) */}
        <img
          src="/qr.jpeg"
          alt="UPI QR Code"
          className="w-48 h-48 object-contain rounded-md border"
        />

        <div className="text-sm text-gray-600 text-center">
          Scan this QR with your UPI app and complete payment. After paying, click <strong>I have paid</strong>.
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={() => setShowQrModal(false)} className="flex-1 border rounded-md py-2">Cancel</button>
          <button onClick={handleQrConfirmed} className="flex-1 bg-green-600 text-white rounded-md py-2">I have paid</button>
        </div>
      </div>
    </div>
  </div>
)}

    </main>
  );
}