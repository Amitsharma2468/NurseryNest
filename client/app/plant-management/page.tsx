"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Plus } from "lucide-react";

export default function PlantList() {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants`);
        if (!res.ok) throw new Error("Failed to fetch plants");
        const data = await res.json();
        setPlants(data);
      } catch (err: any) {
        setError(err.message || "Error fetching plants");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Handler to increment remainingPlant count for a given plantId
  const incrementPlant = async (plantId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_BACKEND_URL}/api/plants/${plantId}/increment`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed to increment plant");
      const updatedPlant = await res.json();

      // Update plants state with updated plant data
      setPlants((prevPlants) =>
        prevPlants.map((plant) =>
          plant.plantId === updatedPlant.plantId ? updatedPlant : plant
        )
      );
    } catch (err) {
      alert("Failed to add one more plant");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-800">Plant Management</h2>
        <Link href="/dashboard/plant-management/add">
          <Button className="bg-green-600 hover:bg-green-700">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plant ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Total Sold</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead> {/* New column for buttons */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants.map((p) => (
              <TableRow key={p.plantId}>
                <TableCell>{p.plantId}</TableCell>
                <TableCell>{p.plantType}</TableCell>
                <TableCell>{p.plantName}</TableCell>
                <TableCell>
                  <img
                    src={p.plantImage || "/placeholder.svg"}
                    alt={p.plantName}
                    className="w-16 h-16 rounded object-cover"
                  />
                </TableCell>
                <TableCell>{p.remainingPlant}</TableCell>
                <TableCell>{p.costPerPlant.toFixed(2)}</TableCell>
                <TableCell>{p.totalSold}</TableCell>
                <TableCell>
                  {p.createdAt ? format(new Date(p.createdAt), "yyyy-MM-dd") : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => incrementPlant(p.plantId)}
                  >
                    Add One More
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
