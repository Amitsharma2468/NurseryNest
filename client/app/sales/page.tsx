"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ArrowLeft } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Sale {
  saleId: string;
  customerName: string;
  plantName: string;
  quantity: number;
  totalSalePrice: number;
  salePricePerPlant: number;
  costPerPlant: number;
  createdAt: string;
}

interface Benefit {
  monthlyBenefit: number;
  totalBenefit: number;
}

export default function SaleList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [benefit, setBenefit] = useState<Benefit>({ monthlyBenefit: 0, totalBenefit: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to logout user
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Fetch sales with auth header and handle 401
  const fetchSales = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/sales/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setSales(data);
      setFilteredSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  // Fetch benefits with auth header and handle 401
  const fetchBenefits = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/sales/benefit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setBenefit({
        monthlyBenefit: Number(data.monthlyBenefit || 0),
        totalBenefit: Number(data.totalBenefit || 0),
      });
    } catch (error) {
      console.error("Error fetching benefits:", error);
    }
  };

  // Initial auth check and data fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSales(token), fetchBenefits(token)]);
      setLoading(false);
    };

    loadData();
  }, [router]);

  // Filter sales by date range
  const filterSalesByDate = useCallback(() => {
    if (!range.from || !range.to) {
      setFilteredSales(sales);
      return;
    }

    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= fromDate && saleDate <= toDate;
    });

    setFilteredSales(filtered);
  }, [range.from, range.to, sales]);

  // Trigger filtering on date range or sales update
  useEffect(() => {
    filterSalesByDate();
  }, [filterSalesByDate]);

  const generatePDF = () => {
    if (filteredSales.length === 0) {
      alert("No sales data to export");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Nursery Sales Report", 14, 20);

    if (range.from && range.to) {
      doc.setFontSize(12);
      doc.text(`From ${range.from} to ${range.to}`, 14, 30);
    }

    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + (sale.totalSalePrice ?? 0),
      0
    );
    const totalProfit = filteredSales.reduce(
      (sum, sale) =>
        sum + (((sale.salePricePerPlant ?? 0) - (sale.costPerPlant ?? 0)) * (sale.quantity ?? 0)),
      0
    );

    const startY = range.from && range.to ? 40 : 30;
    doc.setFontSize(12);
    doc.text(`Total Sales: ${filteredSales.length}`, 14, startY);
    doc.text(`Total Revenue: Tk${totalRevenue.toFixed(2)}`, 14, startY + 8);
    doc.text(`Total Profit: Tk${totalProfit.toFixed(2)}`, 14, startY + 16);

    autoTable(doc, {
      startY: startY + 26,
      head: [["Sale ID", "Customer", "Plant", "Qty", "Total (Tk)", "Profit (Tk)", "Date"]],
      body: filteredSales.map((s) => [
        s.saleId,
        s.customerName,
        s.plantName,
        (s.quantity ?? 0).toString(),
        (s.totalSalePrice ?? 0).toFixed(2),
        (((s.salePricePerPlant ?? 0) - (s.costPerPlant ?? 0)) * (s.quantity ?? 0)).toFixed(2),
        format(new Date(s.createdAt), "yyyy-MM-dd"),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 197, 94] },
    });

    const fileName =
      range.from && range.to
        ? `sales-${range.from}-to-${range.to}.pdf`
        : `sales-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading sales data...</p>
      </div>
    );
  }

  const totalProfit = filteredSales.reduce(
    (sum, sale) =>
      sum + (((sale.salePricePerPlant ?? 0) - (sale.costPerPlant ?? 0)) * (sale.quantity ?? 0)),
    0
  );

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Top controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Sales Report</h1>
        <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" /> Go to Dashboard
        </Button>
      </div>

      {/* Filter and actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          type="date"
          value={range.from}
          onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))}
        />
        <Input
          type="date"
          value={range.to}
          onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))}
        />
        <Button
          onClick={generatePDF}
          disabled={filteredSales.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full border border-gray-200 text-sm text-center">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-2 py-2 border">Sale ID</th>
              <th className="px-2 py-2 border">Customer</th>
              <th className="px-2 py-2 border">Plant</th>
              <th className="px-2 py-2 border">Qty</th>
              <th className="px-2 py-2 border">Total (Tk)</th>
              <th className="px-2 py-2 border">Profit (Tk)</th>
              <th className="px-2 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((s) => (
              <tr key={s.saleId} className="border-b">
                <td className="px-2 py-1 border">{s.saleId}</td>
                <td className="px-2 py-1 border">{s.customerName}</td>
                <td className="px-2 py-1 border">{s.plantName}</td>
                <td className="px-2 py-1 border">{s.quantity ?? 0}</td>
                <td className="px-2 py-1 border">৳{(s.totalSalePrice ?? 0).toFixed(2)}</td>
                <td className="px-2 py-1 border">
                  ৳
                  {(((s.salePricePerPlant ?? 0) - (s.costPerPlant ?? 0)) * (s.quantity ?? 0)).toFixed(2)}
                </td>
                <td className="px-2 py-1 border">{format(new Date(s.createdAt), "yyyy-MM-dd")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section at bottom */}
      <div className="mt-8 space-y-2 text-right">
        <p className="text-gray-700 text-base">
          This Month&apos;s Revenue: <strong>৳{benefit.monthlyBenefit.toFixed(2)}</strong>
        </p>
        <p className="text-gray-700 text-base">
          Total Revenue: <strong>৳{benefit.totalBenefit.toFixed(2)}</strong>
        </p>
        <p className="text-gray-700 text-base">
          This Month&apos;s Profit: <strong>৳{totalProfit.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}
