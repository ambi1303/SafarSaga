'use client'

import { useEffect, useState } from "react";
import { DestinationsService, Destination } from "@/lib/destinations-service";

const initialForm: Partial<Destination> = {
  name: "",
  description: "",
  state: "",
  country: "India",
  featured_image_url: "",
  gallery_images: [],
  difficulty_level: "Easy",
  best_time_to_visit: "",
  popular_activities: [],
  average_cost_per_day: 0,
  is_active: true,
};

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<Partial<Destination>>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageValid, setImageValid] = useState<boolean | null>(null);

  // Fetch all destinations from DB
  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await DestinationsService.getDestinations({ limit: 100 });
      setDestinations(res.items);
    } catch (e) {
      setError("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Handle form changes
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle array fields (gallery_images, popular_activities)
  const handleArrayChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value.split(",").map((v) => v.trim()).filter(Boolean) });
  };

  // Create or update destination
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await DestinationsService.updateDestination(editingId, form);
      } else {
        await DestinationsService.createDestination(form);
      }
      setForm(initialForm);
      setEditingId(null);
      fetchDestinations();
    } catch (e) {
      setError("Failed to save destination");
    } finally {
      setLoading(false);
    }
  };

  // Edit destination
  const handleEdit = (dest: Destination) => {
    setEditingId(dest.id);
    setForm({ ...dest });
  };

  // Delete destination
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this destination?")) return;
    setLoading(true);
    setError(null);
    try {
      await DestinationsService.deleteDestination(id);
      fetchDestinations();
    } catch (e) {
      setError("Failed to delete destination");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin: Destinations</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name" required className="border p-2 rounded" />
        <input name="state" value={form.state || ""} onChange={handleChange} placeholder="State" className="border p-2 rounded" />
        <input name="country" value={form.country || ""} onChange={handleChange} placeholder="Country" className="border p-2 rounded" />
        <input name="featured_image_url" value={form.featured_image_url || ""} onChange={handleChange} placeholder="Featured Image URL" className="border p-2 rounded" />
        {form.featured_image_url && (
          <div className="col-span-1 md:col-span-2">
            <img src={form.featured_image_url} alt="Preview" className="mt-1 w-48 h-28 object-cover rounded border" />
          </div>
        )}
        <input name="gallery_images" value={(form.gallery_images || []).join(", ")}
          onChange={e => handleArrayChange("gallery_images", e.target.value)}
          placeholder="Gallery Image URLs (comma separated)" className="border p-2 rounded" />
        <select name="difficulty_level" value={form.difficulty_level || "Easy"} onChange={handleChange} className="border p-2 rounded">
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Challenging">Challenging</option>
        </select>
        <input name="best_time_to_visit" value={form.best_time_to_visit || ""} onChange={handleChange} placeholder="Best Time to Visit" className="border p-2 rounded" />
        <input name="popular_activities" value={(form.popular_activities || []).join(", ")}
          onChange={e => handleArrayChange("popular_activities", e.target.value)}
          placeholder="Popular Activities (comma separated)" className="border p-2 rounded" />
        <input name="average_cost_per_day" type="number" value={form.average_cost_per_day || 0} onChange={handleChange} placeholder="Avg. Cost/Day" className="border p-2 rounded" />
        <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" className="border p-2 rounded col-span-1 md:col-span-2" />
        <label className="flex items-center gap-2">
          <input name="is_active" type="checkbox" checked={form.is_active ?? true} onChange={handleChange} />
          Active
        </label>
        <div className="col-span-1 md:col-span-2 flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {editingId ? "Update" : "Add"} Destination
          </button>
          {editingId && <button type="button" onClick={handleCancel} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">State</th>
              <th className="p-2 border">Country</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Active</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map(dest => (
              <tr key={dest.id}>
                <td className="p-2 border">{dest.name}</td>
                <td className="p-2 border">{dest.state}</td>
                <td className="p-2 border">{dest.country}</td>
                <td className="p-2 border">
                  {dest.featured_image_url && <img src={dest.featured_image_url} alt={dest.name} className="w-16 h-10 object-cover rounded" />}
                </td>
                <td className="p-2 border text-center">{dest.is_active ? "✅" : "❌"}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEdit(dest)} className="bg-yellow-400 px-2 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDelete(dest.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
