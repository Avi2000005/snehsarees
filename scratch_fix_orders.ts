import { db } from './server/data/db';

async function fix() {
  const orders = await db.getOrders();
  console.log('Total orders:', orders.length);
  
  for (const o of orders) {
    const status = (o as any).status;
    const trackingId = (o as any).trackingId;
    console.log(`Order ${o.id}: status=${status}, trackingId=${trackingId}`);
    
    // If the order is currently marked 'shipped' BUT the trackingId is all digits
    // (which means it's a Shiprocket internal shipment_id, NOT a real courier AWB)
    // Real AWBs look like: 1234567890123, FEDEX123, DELHIVERY123456 — but Shiprocket
    // internal shipment IDs are pure numeric ~8-9 digits
    if (status === 'shipped' && trackingId && /^\d{6,12}$/.test(trackingId)) {
      console.log(`>>> RESETTING order ${o.id} - falsely marked shipped with internal ID: ${trackingId}`);
      await db.updateOrderStatus(o.id, 'paid');
    }
  }
  
  console.log('Done!');
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
