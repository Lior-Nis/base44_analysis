import React from 'react';
import { CheckCircle, XCircle, Eye, Clock, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const SellerDetailView = ({ seller }) => (
    <div className="p-4 space-y-4">
      <div><strong>Business Name:</strong> {seller.name}</div>
      <div><strong>Seller Type:</strong> {seller.seller_type}</div>
      <div><strong>Owner Email:</strong> {seller.owner_email}</div>
      <div><strong>Contact Phone:</strong> {seller.contact_phone}</div>
      <div><strong>Location:</strong> {seller.location}</div>
      <p><strong>Bio:</strong> {seller.bio}</p>
      {seller.profile_image && <img src={seller.profile_image} alt="Profile" className="w-24 h-24 rounded-full"/>}
      {seller.cover_image && <img src={seller.cover_image} alt="Cover" className="w-full h-32 object-cover rounded-md"/>}
    </div>
);

export default function SellerApproval({ sellers, onStatusUpdate }) {
  const pendingSellers = sellers.filter(s => s.status === 'pending');
  const approvedSellers = sellers.filter(s => s.status === 'approved');
  const suspendedSellers = sellers.filter(s => s.status === 'suspended');

  const SellerRow = ({ seller }) => (
    <div className="flex justify-between items-center p-4 border rounded-lg bg-white">
      <div>
        <h3 className="font-medium">{seller.name}</h3>
        <p className="text-sm text-gray-500">{seller.seller_type.replace('_', ' ')}</p>
      </div>
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild><Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" /> View</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>{seller.name}</DialogTitle></DialogHeader><SellerDetailView seller={seller} /></DialogContent>
        </Dialog>
        {seller.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" className="text-green-600" onClick={() => onStatusUpdate(seller.id, 'approved')}><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
            <Button size="sm" variant="outline" className="text-red-600" onClick={() => onStatusUpdate(seller.id, 'rejected')}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
          </>
        )}
        {seller.status === 'approved' && (
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => onStatusUpdate(seller.id, 'suspended')}><ShieldX className="w-4 h-4 mr-1" /> Suspend</Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" /> Pending Approval ({pendingSellers.length})</CardTitle></CardHeader>
        <CardContent>
          {pendingSellers.length > 0 ? (
            <div className="space-y-4">{pendingSellers.map(s => <SellerRow key={s.id} seller={s} />)}</div>
          ) : <p className="text-gray-500 text-center py-4">No sellers pending approval.</p>}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Approved Sellers ({approvedSellers.length})</CardTitle></CardHeader>
        <CardContent>
          {approvedSellers.length > 0 ? (
            <div className="space-y-4">{approvedSellers.map(s => <SellerRow key={s.id} seller={s} />)}</div>
          ) : <p className="text-gray-500 text-center py-4">No approved sellers yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldX className="w-5 h-5 text-red-500" /> Suspended Sellers ({suspendedSellers.length})</CardTitle></CardHeader>
        <CardContent>
          {suspendedSellers.length > 0 ? (
            <div className="space-y-4">{suspendedSellers.map(s => <SellerRow key={s.id} seller={s} />)}</div>
          ) : <p className="text-gray-500 text-center py-4">No suspended sellers.</p>}
        </CardContent>
      </Card>
    </div>
  );
}