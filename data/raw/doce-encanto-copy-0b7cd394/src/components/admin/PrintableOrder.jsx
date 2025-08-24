import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintableOrder({ order, onBack, siteConfig }) {
  useEffect(() => {
    // Aciona automaticamente o diálogo de impressão quando o componente é montado
    window.print();
  }, []);

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 printable-area">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="no-print mb-8 flex justify-between items-center">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Pedidos
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Novamente
          </Button>
        </div>

        {/* Cabeçalho */}
        <header className="flex justify-between items-start mb-8 pb-4 border-b">
          <div>
            {siteConfig?.site_logo && (
              <img src={siteConfig.site_logo} alt={siteConfig.site_name} className="h-16 w-auto object-contain mb-4" />
            )}
            <h1 className="text-2xl font-bold text-gray-800">{siteConfig?.site_name || 'Lina Kamati'}</h1>
            <p className="text-sm text-gray-500">{siteConfig?.site_tagline || 'Confeitaria Artesanal Premium'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Comprovativo de Pedido</h2>
            <p className="text-gray-600">ID: #{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-500">
              Data do Pedido: {new Date(order.created_date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Detalhes do Cliente e Pedido */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Detalhes do Cliente</h3>
            <div className="space-y-1 text-gray-600">
              <p><strong>Nome:</strong> {order.customer_name}</p>
              <p><strong>Telefone:</strong> {order.customer_phone}</p>
              <p><strong>Email:</strong> {order.customer_email}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Detalhes do Pedido</h3>
            <div className="space-y-1 text-gray-600">
              <p><strong>Tipo de Entrega:</strong> <span className="capitalize">{order.delivery_type}</span></p>
              {order.delivery_type === 'entrega' && (
                <p><strong>Endereço:</strong> {order.delivery_address || 'Não especificado'}</p>
              )}
              {order.event_date && (
                <p><strong>Data do Evento:</strong> {new Date(order.event_date).toLocaleDateString('pt-AO')}</p>
              )}
              <p><strong>Status:</strong> <span className="capitalize font-medium text-blue-600">{order.status}</span></p>
            </div>
          </div>
        </section>

        {/* Tabela de Itens */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Itens do Pedido</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 p-3 font-semibold text-gray-600">Produto</th>
                  <th className="border-b-2 p-3 font-semibold text-gray-600 text-center">Qtd.</th>
                  <th className="border-b-2 p-3 font-semibold text-gray-600 text-right">Preço Unit.</th>
                  <th className="border-b-2 p-3 font-semibold text-gray-600 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.product_name}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">Kz {item.unit_price.toFixed(2)}</td>
                    <td className="p-3 text-right">Kz {(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totais */}
        <section className="flex justify-end mb-8">
          <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({totalItems} itens)</span>
              <span>Kz {order.total_amount.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto ({order.coupon_code})</span>
                <span>- Kz {order.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold text-gray-800">
              <span>Total</span>
              <span>Kz {(order.total_amount - (order.discount_amount || 0)).toFixed(2)}</span>
            </div>
          </div>
        </section>
        
        {/* Observações */}
        {(order.ingredient_notes || order.notes) && (
            <section>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Observações</h3>
                {order.ingredient_notes && <p className="text-sm text-gray-600"><strong>Restrições/Ingredientes:</strong> {order.ingredient_notes}</p>}
                {order.notes && <p className="text-sm text-gray-600"><strong>Notas Adicionais:</strong> {order.notes}</p>}
            </section>
        )}

      </div>
      <style jsx global>{`
        @media print {
          body {
            background-color: white;
          }
          .no-print {
            display: none !important;
          }
          .printable-area {
            padding: 0;
          }
          .printable-area > div {
            box-shadow: none;
            border: none;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}