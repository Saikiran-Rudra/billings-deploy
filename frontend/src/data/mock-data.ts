// Mock data for frontend (temporary - will be replaced by API calls)
// Migrated from the original Constant.ts

export const Table_Data = [
  { id: 1, name: 'ABC corporation', customer_type: 'Business', Phone: '+91 98765 43210', Gst: '29ABC1234D1Z5', Outstanding: 5000, status: 'active' },
  { id: 2, name: 'xyz enterprieses', customer_type: 'Individual', Phone: '+91 98765 43211', Gst: '27xyzab5678gy24', Outstanding: 2000, status: 'active' },
  { id: 3, name: 'tech solutions', customer_type: 'Business', Phone: '+91 98765 43212', Gst: '-', Outstanding: 0, status: 'inactive' },
  { id: 4, name: 'global traders', customer_type: 'Individual', Phone: '+91 98765 43213', Gst: '27xyzab5678gy24', Outstanding: 1000, status: 'active' },
  { id: 5, name: 'local shop', customer_type: 'Business', Phone: '+91 98765 43214', Gst: '-', Outstanding: 0, status: 'inactive' },
  { id: 6, name: 'abc traders', customer_type: 'Individual', Phone: '+91 98765 43215', Gst: '29ABC1234D1Z5', Outstanding: 3000, status: 'active' },
];

export const Invoices_Data = [
  { id: 1, invoice: 'ABC corporation', date: '2024-01-01', customer: '29ABC1234D1Z5', amount: 5000, duedate: '2024-01-31', status: 'active' },
  { id: 2, invoice: 'xyz enterprieses', date: '2024-01-05', customer: '27xyzab5678gy24', amount: 2000, duedate: '2024-02-04', status: 'active' },
  { id: 3, invoice: 'tech solutions', date: '2024-01-10', customer: '-', amount: 0, duedate: '2024-02-09', status: 'inactive' },
  { id: 4, invoice: 'global traders', date: '2024-01-15', customer: '27xyzab5678gy24', amount: 1000, duedate: '2024-02-14', status: 'active' },
  { id: 5, invoice: 'local shop', date: '2024-01-20', customer: '-', amount: 0, duedate: '2024-02-19', status: 'inactive' },
  { id: 6, invoice: 'abc traders', date: '2024-01-25', customer: '29ABC1234D1Z5', amount: 3000, duedate: '2024-02-24', status: 'active' },
  { id: 7, invoice: 'new company', date: '2024-01-30', customer: '29ABC1234D1Z5', amount: 4000, duedate: '2024-02-29', status: 'active' },
  { id: 8, invoice: 'old company', date: '2024-01-31', customer: '27xyzab5678gy24', amount: 1500, duedate: '2024-03-01', status: 'active' },
];

export const paymentreceived_Data = [
  { id: 1, date: '2024-01-05', invoice: 'INV001', customer: 'ABC corporation', Amount: 5000, paymentmode: 'Credit Card', reference: 'REF12345' },
  { id: 2, date: '2024-01-10', invoice: 'INV002', customer: 'xyz enterprieses', Amount: 2000, paymentmode: 'Bank Transfer', reference: 'REF67890' },
  { id: 3, date: '2024-01-15', invoice: 'INV003', customer: 'tech solutions', Amount: 0, paymentmode: 'Cash', reference: 'REF54321' },
  { id: 4, date: '2024-01-20', invoice: 'INV004', customer: 'global traders', Amount: 1000, paymentmode: 'Credit Card', reference: 'REF98765' },
  { id: 5, date: '2024-01-25', invoice: 'INV005', customer: 'local shop', Amount: 0, paymentmode: 'Bank Transfer', reference: 'REF24680' },
  { id: 6, date: '2024-01-30', invoice: 'INV006', customer: 'abc traders', Amount: 3000, paymentmode: 'Cash', reference: 'REF13579' },
  { id: 7, date: '2024-02-04', invoice: 'INV007', customer: 'Niraj', Amount: 4000, paymentmode: 'Credit Card', reference: 'REF11223' },
  { id: 8, date: '2024-02-09', invoice: 'INV008', customer: 'old company', Amount: 1500, paymentmode: 'Bank Transfer', reference: 'REF44556' },
];

export const salesreturn_Data = [
  { id: 1, ReturnID: 'RET001', date: '2024-01-05', originalinvoice: 'INV001', customer: 'ABC corporation', iteams: 'item1, item2', Amount: 5000, status: 'processed' },
  { id: 2, ReturnID: 'RET002', date: '2024-01-10', originalinvoice: 'INV002', customer: 'xyz enterprieses', iteams: 'item3', Amount: 2000, status: 'pending' },
  { id: 3, ReturnID: 'RET003', date: '2024-01-15', originalinvoice: 'INV003', customer: 'tech solutions', iteams: 'item4, item5', Amount: 0, status: 'processed' },
  { id: 4, ReturnID: 'RET004', date: '2024-01-20', originalinvoice: 'INV004', customer: 'global traders', iteams: 'item6', Amount: 1000, status: 'pending' },
  { id: 5, ReturnID: 'RET005', date: '2024-01-25', originalinvoice: 'INV005', customer: 'local shop', iteams: 'item7, item8', Amount: 0, status: 'processed' },
];

export const products_Data = [
  { id: 1, productname: 'Product 1', SKU: 'PROD001', category: 'Electronics', saleprice: 100, purchaseprice: 80, stock: 50, gst: 18, unit: 'pcs', status: 'active', brand: 'Brand A' },
  { id: 2, productname: 'Product 2', SKU: 'PROD002', category: 'Electronics', saleprice: 200, purchaseprice: 160, stock: 30, gst: 18, unit: 'pcs', status: 'active', brand: 'Brand B' },
  { id: 3, productname: 'Product 3', SKU: 'PROD003', category: 'Electronics', saleprice: 150, purchaseprice: 120, stock: 20, gst: 18, unit: 'pcs', status: 'active', brand: 'Brand C' },
  { id: 4, productname: 'Product 4', SKU: 'PROD004', category: 'Electronics', saleprice: 250, purchaseprice: 200, stock: 10, gst: 18, unit: 'pcs', status: 'active', brand: 'Brand D' },
  { id: 5, productname: 'Product 5', SKU: 'PROD005', category: 'Electronics', saleprice: 300, purchaseprice: 240, stock: 5, gst: 18, unit: 'pcs', status: 'active', brand: 'Brand E' },
];

export const stockmanagement_Data = [
  { id: 1, productname: 'Product 1', currentstock: 50, lastupdated: '2024-01-01' },
  { id: 2, productname: 'Product 2', currentstock: 30, lastupdated: '2024-01-02' },
  { id: 3, productname: 'Product 3', currentstock: 20, lastupdated: '2024-01-03' },
  { id: 4, productname: 'Product 4', currentstock: 10, lastupdated: '2024-01-04' },
];

export const cashbank_Data = [
  { id: 1, date: '01-01-2026', description: 'payment received', amount: 5000, mode: 'cash', balance: 5000 },
  { id: 2, date: '02-01-2026', description: 'payment received', amount: 2000, mode: 'bank transfer', balance: 7000 },
  { id: 3, date: '03-01-2026', description: 'payment received', amount: 3000, mode: 'cash', balance: 10000 },
  { id: 4, date: '04-01-2026', description: 'payment received', amount: 4000, mode: 'bank transfer', balance: 14000 },
];

export const mockData = {
  invoiceNo: 'INV001',
  customer: 'ABC corporation',
  amount: 5000,
  dueDate: '2024-01-31',
  Balance: 2000,
  status: 'active', 
}; 
