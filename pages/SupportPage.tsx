
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, Button, Input } from '../components/UI';

const SupportPage: React.FC = () => {
  const { siteSettings } = useAppContext();

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Customer Support Center</h1>
          <p className="text-gray-500">How can we assist you with your sacred journey today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">📞</div>
            <h3 className="font-bold mb-2">Call Us</h3>
            <p className="text-xs text-gray-500 mb-4">Available 24/7 for pilgrims</p>
            <p className="font-bold text-primary">{siteSettings.contactPhone}</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">✉️</div>
            <h3 className="font-bold mb-2">Email Support</h3>
            <p className="text-xs text-gray-500 mb-4">Response within 2 hours</p>
            <p className="font-bold text-primary">{siteSettings.contactEmail}</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">📍</div>
            <h3 className="font-bold mb-2">Main Office</h3>
            <p className="text-xs text-gray-400">{siteSettings.contactAddress}</p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-xl font-bold mb-6 text-neutralDark">Send us a Message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Your Name" />
              <Input label="Email" placeholder="you@example.com" />
            </div>
            <Input label="Booking ID (Optional)" placeholder="US-BK-12345" />
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Message</label>
              <textarea 
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#006D77]/20 focus:border-[#006D77] outline-none h-32"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <Button variant="primary" size="lg" className="w-full">Submit Inquiry</Button>
          </form>
        </Card>

        <div className="mt-12 text-center text-gray-400 text-xs">
          <p>UmrahStay Global Support Desk • Certified Hospitality Partner</p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
