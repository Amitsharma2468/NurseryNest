"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudinaryUpload } from "@/components/cloudinary-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function AddPlantPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    plantType: "",
    plantName: "",
    plantImage: "",
    remainingPlant: 1,
    costPerPlant: 0,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "remainingPlant" || name === "costPerPlant" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      plantImage: url,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    const { plantType, plantName, plantImage, costPerPlant } = formData;

    if (!plantType || !plantName || !plantImage || costPerPlant <= 0) {
      setError("Please fill all required fields correctly.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add plant");
      } else {
        setSuccess("✅ Plant added successfully!");
        setTimeout(() => router.push("/plant-management"), 1500);
      }
    } catch  {
      setError("❌ Network error while saving plant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/nursery.jpg')" }}
    >
      <div className="backdrop-blur-lg bg-white/40 shadow-md rounded-xl p-8 w-full max-w-2xl border border-green-200">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5 text-green-800" />
          </Button>
          <h2 className="text-2xl font-bold text-green-800 ml-3">Add New Plant</h2>
        </div>

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

        <div className="space-y-5">
          <div className="space-y-1">
            <Label>Plant Type *</Label>
            <Input name="plantType" value={formData.plantType} onChange={handleChange} />
          </div>

          <div className="space-y-1">
            <Label>Plant Name *</Label>
            <Input name="plantName" value={formData.plantName} onChange={handleChange} />
          </div>

          <div className="space-y-1">
            <Label>Plant Image *</Label>
            <CloudinaryUpload
              onUploadSuccess={handleImageUpload}
              currentImage={formData.plantImage}
            />
          </div>

          <div className="space-y-1">
            <Label>Remaining Quantity *</Label>
            <Input
              type="number"
              name="remainingPlant"
              value={formData.remainingPlant}
              onChange={handleChange}
              min={1}
            />
          </div>

          <div className="space-y-1">
            <Label>Cost Per Plant *</Label>
            <Input
              type="number"
              name="costPerPlant"
              value={formData.costPerPlant}
              onChange={handleChange}
              min={0}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {saving ? "Saving..." : "Add Plant"}
          </Button>
        </div>
      </div>
    </div>
  );
}
