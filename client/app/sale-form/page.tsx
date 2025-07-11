'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SaleFormPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    plantName: '',
    quantity: 1,
    salePricePerPlant: 0,
  });
  const [selectedPlant, setSelectedPlant] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants`);
        const data = await res.json();
        setPlants(data);
      } catch (err) {
        console.error('Error fetching plants:', err);
      }
    };
    fetchPlants();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'salePricePerPlant' ? Number(value) : value,
    }));

    if (name === 'plantName') {
      const matched = plants.find((p) => p.plantName === value);
      setSelectedPlant(matched || null);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    const { customerName, plantName, quantity, salePricePerPlant } = formData;

    if (!customerName || !plantName || !quantity || !salePricePerPlant) {
      setError('Please fill in all fields');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to submit sale');
      } else {
        const saleData = await res.json();
        setSuccess('Sale recorded successfully');
        generateInvoicePDF(saleData);
        setTimeout(() => router.push('/sales'), 1500);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const generateInvoicePDF = (sale: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('NurseryNest Sale Invoice', 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Customer', 'Plant', 'Type', 'Quantity', 'Unit Price', 'Total']],
      body: [
        [
          sale.customerName,
          sale.plantName,
          sale.plantType,
          sale.quantity,
          `$${sale.salePricePerPlant.toFixed(2)}`,
          `$${sale.totalSalePrice.toFixed(2)}`
        ]
      ]
    });

    doc.save(`Invoice-${sale.saleId}.pdf`);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-green-50 rounded-md shadow-md">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Create a Sale</h2>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label>Customer Name *</Label>
          <Input name="customerName" value={formData.customerName} onChange={handleChange} />
        </div>

        <div>
          <Label>Select Plant *</Label>
          <select
            name="plantName"
            value={formData.plantName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select a plant</option>
            {plants.map((plant) => (
              <option key={plant.plantId} value={plant.plantName}>
                {plant.plantName}
              </option>
            ))}
          </select>
        </div>

        {selectedPlant && (
          <div className="p-3 bg-white rounded shadow-sm border space-y-2">
            <p><b>Type:</b> {selectedPlant.plantType}</p>
            <p><b>ID:</b> {selectedPlant.plantId}</p>
            <p><b>Stock:</b> {selectedPlant.remainingPlant}</p>
            <img src={selectedPlant.plantImage} alt="Preview" className="w-20 h-20 object-cover rounded" />
          </div>
        )}

        <div>
          <Label>Quantity *</Label>
          <Input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min={1}
          />
        </div>

        <div>
          <Label>Sale Price per Plant *</Label>
          <Input
            type="number"
            name="salePricePerPlant"
            value={formData.salePricePerPlant}
            onChange={handleChange}
            min={0}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Saving...' : 'Record Sale & Generate Invoice'}
        </Button>
      </div>
    </div>
  );
}
