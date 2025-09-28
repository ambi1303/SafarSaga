'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = '9311706027';
  const message = 'Hello! I would like to know more about your travel packages.';
  
  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}