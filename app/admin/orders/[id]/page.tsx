import OrderViewClient from "./OrderViewClient";

export default async function ViewOrderPage({ params }: { params: { id: string } }) {
  const id = (await params).id; // important!

  let order = null;

  try {
    const res = await fetch(`http://localhost:4000/api/orders/${id}`, {
      cache: "no-store",
    });

    if (res.ok) {
      order = await res.json();
    }
  } catch (err) {
    console.error("Order fetch error:", err);
  }

  return <OrderViewClient order={order} />;
}
