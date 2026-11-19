import { useEffect, useState } from "react";

type Expense = { id: string; title: string; amount: number; paidBy: string };

export function Expenses({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<Expense[]>([]);

  useEffect(() => {
    fetch(`/api/groups/${groupId}/expenses`)
      .then((r) => r.json())
      .then(setItems);
  }, [groupId]);

  async function remove(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setItems(items.filter((e) => e.id !== id));
  }

  return (
    <div className="expenses">
      <h1>Expenses</h1>
      <ul>
        {items.map((e) => (
          <li key={e.id}>
            <span>{e.title}</span>
            <span>{e.amount.toFixed(2)}</span>
            <div className="trash" onClick={() => remove(e.id)}>
              <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10" /></svg>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
