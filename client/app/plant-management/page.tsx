"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, ArrowLeft } from "lucide-react";

// Define a type for Plant to avoid using any
interface Plant {
  plantId: string;
  plantType: string;
  plantName: string;
  plantImage?: string;
  remainingPlant: number;
  costPerPlant: number;
  totalSold: number;
  createdAt?: string;
}

export default function PlantList() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const fetchPlants = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants`);
        if (!res.ok) throw new Error("Failed to fetch plants");
        const data: Plant[] = await res.json();
        setPlants(data);
      } catch (error) {
        // error might be unknown so assert type
        const err = error as Error;
        setError(err.message || "Error fetching plants");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [router]);

  const incrementPlant = async (plantId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants/${plantId}/increment`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to increment plant");
      const updatedPlant: Plant = await res.json();

      setPlants((prevPlants) =>
        prevPlants.map((plant) =>
          plant.plantId === updatedPlant.plantId ? updatedPlant : plant
        )
      );
    } catch {
      alert("Failed to add one more plant");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white px-4 py-6 sm:px-6 md:px-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 ml-0 sm:ml-2">
            Plant Management
          </h2>
        </div>
        <Link href="/plant-management/add">
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Plant
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-green-700">Loading plants...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : plants.length === 0 ? (
        <p className="text-center text-gray-600">No plants found</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-green-100">
              <TableRow>
                <TableHead>Plant ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Total Sold</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plants.map((p) => (
                <TableRow key={p.plantId} className="text-sm">
                  <TableCell>{p.plantId}</TableCell>
                  <TableCell>{p.plantType}</TableCell>
                  <TableCell>{p.plantName}</TableCell>
                  <TableCell>
                    <img
                      src={p.plantImage || "/placeholder.svg"}
                      alt={p.plantName}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell>{p.remainingPlant}</TableCell>
                  <TableCell>৳{p.costPerPlant.toFixed(2)}</TableCell>
                  <TableCell>{p.totalSold}</TableCell>
                  <TableCell>
                    {p.createdAt
                      ? format(new Date(p.createdAt), "yyyy-MM-dd")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementPlant(p.plantId)}
                    >
                      Add One
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
