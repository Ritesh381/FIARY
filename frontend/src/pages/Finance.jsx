import React from "react";

function Finance() {
  const transactions = [
    { id: 1, category: "Salary", amount: 50000, type: "Income", date: "2025-10-01" },
    { id: 2, category: "Rent", amount: 12000, type: "Expense", date: "2025-10-05" },
    { id: 3, category: "Groceries", amount: 6000, type: "Expense", date: "2025-10-15" },
  ];

  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSavings = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-8">
      <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8">
        💰 Financial Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300">Total Income</h2>
          <p className="text-3xl font-bold text-green-400 mt-2">₹{totalIncome}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-400 mt-2">₹{totalExpense}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-300">Savings</h2>
          <p className="text-3xl font-bold text-cyan-400 mt-2">₹{totalSavings}</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-700 text-gray-300 uppercase text-left">
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-600">
                <td className="px-6 py-4">{t.category}</td>
                <td
                  className={`px-6 py-4 ${
                    t.type === "Income" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ₹{t.amount}
                </td>
                <td className="px-6 py-4">{t.type}</td>
                <td className="px-6 py-4">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-gray-400 mt-10">
        * In future updates, users will be able to add, edit, and visualize transactions with charts.
      </p>
    </div>
  );
}

export default Finance;
