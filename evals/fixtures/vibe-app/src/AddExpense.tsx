import { useState } from "react";

export function AddExpense({ groupId, onAdded }: { groupId: string; onAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const isValid = title.length > 0 && Number(amount) > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        body: JSON.stringify({ title, amount: Number(amount) }),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      alert("Saved!");
      onAdded();
    } catch (err) {
      setError(err as Error);
    }
  }

  return (
    <form onSubmit={submit} className="add-expense">
      <input placeholder="What was it for?" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      {error && <p className="error">{error.message}</p>}
      <button type="submit" disabled={!isValid}>Submit</button>
    </form>
  );
}
