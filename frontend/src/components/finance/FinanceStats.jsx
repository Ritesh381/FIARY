import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, IndianRupee, PieChart } from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-2xl border border-white/10 ${className}`}
  >
    {children}
  </div>
);

const formatAmount = (amount) => {
  if (amount && typeof amount === "object" && amount.$numberDecimal) {
    return parseFloat(amount.$numberDecimal).toFixed(2);
  }
  if (typeof amount === "string" || typeof amount === "number") {
    return parseFloat(amount).toFixed(2);
  }
  return "0.00";
};

export default function FinanceStats({ entries, currentDate }) {
  const stats = useMemo(() => {
    // Filter entries for current month
    const currentMonthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.when);
      return (
        entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear()
      );
    });

    // Calculate totals
    const totals = currentMonthEntries.reduce(
      (acc, entry) => {
        const amount = parseFloat(formatAmount(entry.amount));
        if (entry.type === "Income") {
          acc.totalIncome += amount;
          acc.incomeCount++;
        } else {
          acc.totalExpense += amount;
          acc.expenseCount++;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, incomeCount: 0, expenseCount: 0 }
    );

    // Calculate category breakdown
    const categoryBreakdown = currentMonthEntries.reduce((acc, entry) => {
      const category = entry.category_name || "Uncategorized";
      const amount = parseFloat(formatAmount(entry.amount));
      
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0, total: 0 };
      }
      
      if (entry.type === "Income") {
        acc[category].income += amount;
      } else {
        acc[category].expense += amount;
      }
      acc[category].total += amount;
      
      return acc;
    }, {});

    // Get top 5 categories by total amount
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5);

    const netBalance = totals.totalIncome - totals.totalExpense;
    const savingsRate = totals.totalIncome > 0 
      ? ((netBalance / totals.totalIncome) * 100).toFixed(1)
      : 0;

    return {
      ...totals,
      netBalance,
      savingsRate,
      topCategories,
      transactionCount: currentMonthEntries.length,
    };
  }, [entries, currentDate]);

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        📊 Financial Statistics - {monthName}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-400">
                ₹{stats.totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.incomeCount} transactions
              </p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </GlassCard>

        {/* Total Expense */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Expense</p>
              <p className="text-2xl font-bold text-red-400">
                ₹{stats.totalExpense.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.expenseCount} transactions
              </p>
            </div>
            <TrendingDown className="text-red-400" size={32} />
          </div>
        </GlassCard>

        {/* Net Balance */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Net Balance</p>
              <p
                className={`text-2xl font-bold ${
                  stats.netBalance >= 0 ? "text-blue-400" : "text-orange-400"
                }`}
              >
                ₹{stats.netBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.transactionCount} total transactions
              </p>
            </div>
            <IndianRupee
              className={stats.netBalance >= 0 ? "text-blue-400" : "text-orange-400"}
              size={32}
            />
          </div>
        </GlassCard>

        {/* Savings Rate */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.savingsRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of total income
              </p>
            </div>
            <PieChart className="text-purple-400" size={32} />
          </div>
        </GlassCard>
      </div>

      {/* Top Categories */}
      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">
          Top 5 Categories by Total Amount
        </h2>
        {stats.topCategories.length === 0 ? (
          <p className="text-gray-400 italic">No transactions this month</p>
        ) : (
          <div className="space-y-3">
            {stats.topCategories.map(([category, data]) => (
              <div key={category} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-white">{category}</h3>
                  <span className="text-lg font-bold text-gray-300">
                    ₹{data.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">
                    Income: ₹{data.income.toFixed(2)}
                  </span>
                  <span className="text-red-400">
                    Expense: ₹{data.expense.toFixed(2)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-red-500"
                    style={{
                      width: `${Math.min(
                        (data.total / stats.totalIncome) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Income vs Expense Comparison */}
      <GlassCard>
        <h2 className="text-xl font-bold text-white mb-4">
          Income vs Expense Overview
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Average Income/Transaction</p>
            <p className="text-xl font-bold text-green-400">
              ₹{stats.incomeCount > 0 ? (stats.totalIncome / stats.incomeCount).toFixed(2) : "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Average Expense/Transaction</p>
            <p className="text-xl font-bold text-red-400">
              ₹{stats.expenseCount > 0 ? (stats.totalExpense / stats.expenseCount).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
