// --- pages/sales.tsx ---
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function SaleList() {
  const [sales, setSales] = useState<any[]>([]);
  const [range, setRange] = useState({ from: "", to: "" });
  const [benefit, setBenefit] = useState<any>({});

  const fetchSales = async () => {
    let url = `${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/sales/all`;
    if (range.from && range.to) {
      url = `${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/sales/range?from=${range.from}&to=${range.to}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setSales(data);
  };

  const fetchBenefits = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/sales/benefit`);
    const data = await res.json();
    setBenefit(data);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Sale ID", "Customer", "Plant", "Qty", "Total", "Profit"]],
      body: sales.map((s) => [
        s.saleId,
        s.customerName,
        s.plantName,
        s.quantity,
        s.totalSalePrice,
        (s.salePricePerPlant - s.costPerPlant) * s.quantity,
      ]),
    });
    doc.save("sales.pdf");
  };

  useEffect(() => {
    fetchSales();
    fetchBenefits();
  }, [range]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sales Report</h2>

      <div className="flex gap-2 mb-4">
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
        <Button onClick={generatePDF} className="bg-green-700 text-white">
          Download PDF
        </Button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-green-100">
            <th>Sale ID</th>
            <th>Customer</th>
            <th>Plant</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Profit</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.saleId} className="text-center border-b">
              <td>{s.saleId}</td>
              <td>{s.customerName}</td>
              <td>{s.plantName}</td>
              <td>{s.quantity}</td>
              <td>{s.totalSalePrice.toFixed(2)}</td>
              <td>{((s.salePricePerPlant - s.costPerPlant) * s.quantity).toFixed(2)}</td>
              <td>{format(new Date(s.createdAt), "yyyy-MM-dd")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right space-y-2">
        <p>Total Benefit This Month: <strong>{benefit.monthlyBenefit}</strong></p>
        <p>Total Benefit All Time: <strong>{benefit.totalBenefit}</strong></p>
      </div>
    </div>
  );
}
