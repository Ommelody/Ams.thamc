export interface Category {
  id: string;
  name: string;
  life: number;
  dep: number;
}

export interface Asset {
  code: string;
  name: string;
  cat: string;
  dept: string;
  holder: string;
  loc: string;
  acquired: string;
  price: number;
  vendor: string;
  status: 'available' | 'in_use' | 'borrowed' | 'repair' | 'disposed' | 'lost';
  method: string;
}

export interface Requisition {
  id: string;
  date: string;
  requester: string;
  dept: string;
  item: string;
  type: string;
  purpose: string;
  status: 'pending' | 'approved' | 'disbursed' | 'rejected';
  approver: string;
}

export interface Repair {
  id: string;
  date: string;
  asset: string;
  code: string;
  reporter: string;
  problem: string;
  status: 'waiting' | 'repairing' | 'done' | 'scrap';
  vendor: string;
}

export interface Disposal {
  id: string;
  date: string;
  asset: string;
  code: string;
  method: string;
  reason: string;
  value: number;
  committee: string;
}

export interface Activity {
  t: string;
  who: string;
  action: string;
  target: string;
  tone: 'amber' | 'blue' | 'orange' | 'green' | 'red' | 'gray';
}
