import React from 'react';
import { Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RestaurantDetailView({ restaurant }) {
  const renderDocumentLink = (url, label) => (
    url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><Link className="w-3 h-3"/>{label}</a> : <span className="text-gray-500">Not provided</span>
  );
  
  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
      <div>
        <h3 className="font-bold text-lg mb-2">Basic Info</h3>
        <p><strong>Name:</strong> {restaurant.name}</p>
        <p><strong>Cuisine:</strong> {restaurant.cuisine_type}</p>
        <p><strong>Description:</strong> {restaurant.description}</p>
        <p><strong>Status:</strong> <Badge>{restaurant.status}</Badge></p>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-2">Contact & Location</h3>
        <p><strong>Phone:</strong> {restaurant.contact_phone}</p>
        <p><strong>Email:</strong> {restaurant.contact_email}</p>
        <p><strong>Hours:</strong> {restaurant.opening_hours}</p>
        <p><strong>Coordinates:</strong> {restaurant.latitude}, {restaurant.longitude}</p>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-2">Documents</h3>
        <p><strong>Business Registration:</strong> {renderDocumentLink(restaurant.business_registration_url, 'View Document')}</p>
        <p><strong>Owner ID:</strong> {renderDocumentLink(restaurant.owner_identity_url, 'View Document')}</p>
        {restaurant.other_documents_urls?.length > 0 && (
          <div>
            <strong>Other Documents:</strong>
            <ul className="list-disc list-inside">
              {restaurant.other_documents_urls.map((url, i) => (
                <li key={i}>{renderDocumentLink(url, `Document ${i+1}`)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="font-bold text-lg mb-2">Media</h3>
        {restaurant.logo_url && <div><strong>Logo:</strong> {renderDocumentLink(restaurant.logo_url, 'View Logo')}</div>}
        {restaurant.pdf_menu_url && <div><strong>PDF Menu:</strong> {renderDocumentLink(restaurant.pdf_menu_url, 'View PDF')}</div>}
        
        <div className="mt-2">
            <strong>Restaurant Photos:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
                {restaurant.restaurant_images?.map((url, i) => <img key={i} src={url} className="w-24 h-24 object-cover rounded"/>)}
            </div>
        </div>
        <div className="mt-2">
            <strong>Menu Photos:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
                {restaurant.menu_images?.map((url, i) => <img key={i} src={url} className="w-24 h-24 object-cover rounded"/>)}
            </div>
        </div>
      </div>
    </div>
  );
}