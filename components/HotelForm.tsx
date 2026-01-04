import React,
{ useState, useEffect } from 'react';
import { Hotel } from '../types';
import { Input, Button } from './UI';

interface HotelFormProps {
  hotel?: Hotel | null;
  onSubmit: (hotelData: Partial<Hotel>) => void;
  onCancel: () => void;
}

const HotelForm: React.FC<HotelFormProps> = ({ hotel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    // Fix: Add type assertion to ensure city is of the correct union type.
    city: 'Makkah' as 'Makkah' | 'Madina',
    address: '',
    stars: 5,
    distanceToHaram: 100,
    description: '',
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        stars: hotel.stars,
        distanceToHaram: hotel.distanceToHaram,
        description: hotel.description,
      });
    }
  }, [hotel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Fix: Handle 'city' separately to cast the value to the correct type.
    if (name === 'city') {
      setFormData(prev => ({ ...prev, city: value as 'Makkah' | 'Madina' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'stars' || name === 'distanceToHaram' ? Number(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" label="Hotel Name" value={formData.name} onChange={handleChange} required />
      {/* Fix: Add a select input for city as it was missing from the form. */}
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <select
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          required
        >
          <option value="Makkah">Makkah</option>
          <option value="Madina">Madina</option>
        </select>
      </div>
      <Input name="address" label="Address" value={formData.address} onChange={handleChange} required />
      <div className="grid grid-cols-2 gap-4">
        <Input name="stars" label="Star Rating" type="number" min="1" max="5" value={formData.stars} onChange={handleChange} required />
        <Input name="distanceToHaram" label="Distance to Haram (m)" type="number" value={formData.distanceToHaram} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{hotel ? 'Update Hotel' : 'Add Hotel'}</Button>
      </div>
    </form>
  );
};

export default HotelForm;