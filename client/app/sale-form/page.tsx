'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Plant = {
  plantId: string;
  plantName: string;
  plantType: string;
  plantImage: string;
  remainingPlant: number;
};

type Sale = {
  saleId: string;
  customerName: string;
  plantName: string;
  plantType: string;
  quantity: number;
  salePricePerPlant: number;
};

export default function SaleFormPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    plantName: '',
    quantity: 1,
    salePricePerPlant: 0,
  });
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants`);
        const data: Plant[] = await res.json();
        setPlants(data);
      } catch {
        setError('Error fetching plants');
      }
    };
    fetchPlants();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
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
        const saleData: Sale = await res.json();
        setSuccess('Sale recorded successfully');
        generateInvoicePDF(saleData);
        setTimeout(() => router.push('/sales'), 1500);
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const generateInvoicePDF = (sale: Sale) => {
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
          sale.quantity.toString(),
          `Tk${sale.salePricePerPlant.toFixed(2)}`,
          `Tk${(sale.salePricePerPlant * sale.quantity).toFixed(2)}`,
        ],
      ],
    });

    doc.save(`Invoice-${sale.saleId}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700 text-lg font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: "url('/nursery.jpg')" }}>
      <div className="max-w-xl w-full bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-10 space-y-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-green-800 font-semibold hover:text-green-600 mb-4"
        >
          <ArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">Create a Sale</h2>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-5" onSubmit={(e: FormEvent) => { e.preventDefault(); handleSubmit(); }}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="plantName">Select Plant *</Label>
            <select
              id="plantName"
              name="plantName"
              value={formData.plantName}
              onChange={handleChange}
              required
              className="w-full p-2 border border-green-300 rounded focus:ring-green-500"
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
            <div className="p-4 bg-white/50 rounded border border-green-200">
              <p><strong>Type:</strong> {selectedPlant.plantType}</p>
              <p><strong>ID:</strong> {selectedPlant.plantId}</p>
              <p><strong>Stock:</strong> {selectedPlant.remainingPlant}</p>
              <img src={selectedPlant.plantImage} alt={selectedPlant.plantName} className="w-24 h-24 object-cover rounded mt-2" />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min={1}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="salePricePerPlant">Sale Price per Plant *</Label>
            <Input
              id="salePricePerPlant"
              type="number"
              name="salePricePerPlant"
              value={formData.salePricePerPlant}
              onChange={handleChange}
              min={0}
              required
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-green-700 hover:bg-green-800">
            {saving ? 'Saving...' : 'Record Sale & Generate Invoice'}
          </Button>
        </form>
      </div>
    </div>
  );
}
