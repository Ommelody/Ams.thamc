import { supabase } from './supabaseClient';
import { Asset, Requisition, Repair, Disposal, Category } from './types';
import { ASSETS_MOCK, REQUISITIONS_MOCK, REPAIRS_MOCK, DISPOSALS_MOCK, CATEGORIES } from './data';

// Helper to check if a table exists by trying to fetch one column
async function isTableAvailable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select('id, code, name').limit(1);
    if (error) {
      // PGRST116 is column not found or table exists but empty, which is fine
      // 42P01 means relation does not exist
      if (error.code === '42P01') {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export interface SupabaseConfigStatus {
  connected: boolean;
  tablesExist: {
    assets: boolean;
    requisitions: boolean;
    repairs: boolean;
    disposals: boolean;
    categories: boolean;
  };
  isEmpty: boolean;
}

export async function getSupabaseStatus(): Promise<SupabaseConfigStatus> {
  const status: SupabaseConfigStatus = {
    connected: false,
    tablesExist: {
      assets: false,
      requisitions: false,
      repairs: false,
      disposals: false,
      categories: false,
    },
    isEmpty: true,
  };

  try {
    const checkRef = await supabase.from('assets').select('code').limit(1);
    if (!checkRef.error || checkRef.error.code !== 'PGRST116') {
      status.connected = true;
    }

    status.tablesExist.assets = await isTableAvailable('assets');
    status.tablesExist.requisitions = await isTableAvailable('requisitions');
    status.tablesExist.repairs = await isTableAvailable('repairs');
    status.tablesExist.disposals = await isTableAvailable('disposals');
    status.tablesExist.categories = await isTableAvailable('categories');

    if (status.tablesExist.assets) {
      const { data } = await supabase.from('assets').select('code').limit(1);
      status.isEmpty = !data || data.length === 0;
    }
  } catch (err) {
    console.error("Error getting status:", err);
  }

  return status;
}

// Automatically seed Supabase with mock data if tables exist but are empty
export async function seedSupabaseIfNeeded(): Promise<boolean> {
  try {
    const status = await getSupabaseStatus();
    if (!status.connected || !status.tablesExist.assets) return false;

    if (status.isEmpty) {
      console.log("Seeding Supabase with initial data...");
      
      // Categories
      if (status.tablesExist.categories) {
        await supabase.from('categories').insert(CATEGORIES);
      }
      
      // Assets
      if (status.tablesExist.assets) {
        await supabase.from('assets').insert(ASSETS_MOCK);
      }

      // Requisitions
      if (status.tablesExist.requisitions) {
        await supabase.from('requisitions').insert(REQUISITIONS_MOCK);
      }

      // Repairs
      if (status.tablesExist.repairs) {
        await supabase.from('repairs').insert(REPAIRS_MOCK);
      }

      // Disposals
      if (status.tablesExist.disposals) {
        await supabase.from('disposals').insert(DISPOSALS_MOCK);
      }

      return true;
    }
  } catch (err) {
    console.error("Failed to seed Supabase:", err);
  }
  return false;
}

// CRUD Operations with clean fallback to localStorage for full application survival

export async function fetchAssets(): Promise<{ data: Asset[]; fromSupabase: boolean }> {
  try {
    const hasTable = await isTableAvailable('assets');
    if (hasTable) {
      const { data, error } = await supabase.from('assets').select('*').order('code');
      if (!error && data) {
        return { data: data as Asset[], fromSupabase: true };
      }
    }
  } catch (e) {
    console.warn("Supabase asset fetch failed, falling back to local storage:", e);
  }

  const local = localStorage.getItem('ams_assets');
  if (local) {
    return { data: JSON.parse(local), fromSupabase: false };
  }
  localStorage.setItem('ams_assets', JSON.stringify(ASSETS_MOCK));
  return { data: ASSETS_MOCK, fromSupabase: false };
}

export async function upsertAsset(asset: Asset): Promise<boolean> {
  // 1. Live Supabase save
  let savedToSupabase = false;
  try {
    const hasTable = await isTableAvailable('assets');
    if (hasTable) {
      const { error } = await supabase.from('assets').upsert(asset);
      if (!error) {
        savedToSupabase = true;
      } else {
        console.error("Supabase upsert asset error:", error);
      }
    }
  } catch (e) {
    console.error("Supabase asset save failed:", e);
  }

  // 2. Local storage sync always to keep in step
  const { data: current } = await fetchAssets();
  const idx = current.findIndex(a => a.code === asset.code);
  if (idx > -1) {
    current[idx] = asset;
  } else {
    current.push(asset);
  }
  localStorage.setItem('ams_assets', JSON.stringify(current));

  return savedToSupabase;
}

export async function fetchRequisitions(): Promise<{ data: Requisition[]; fromSupabase: boolean }> {
  try {
    const hasTable = await isTableAvailable('requisitions');
    if (hasTable) {
      const { data, error } = await supabase.from('requisitions').select('*').order('date', { ascending: false });
      if (!error && data) {
        return { data: data as Requisition[], fromSupabase: true };
      }
    }
  } catch (e) {
    console.warn("Supabase requisition fetch failed:", e);
  }

  const local = localStorage.getItem('ams_requisitions');
  if (local) {
    return { data: JSON.parse(local), fromSupabase: false };
  }
  localStorage.setItem('ams_requisitions', JSON.stringify(REQUISITIONS_MOCK));
  return { data: REQUISITIONS_MOCK, fromSupabase: false };
}

export async function upsertRequisition(req: Requisition): Promise<boolean> {
  let savedToSupabase = false;
  try {
    const hasTable = await isTableAvailable('requisitions');
    if (hasTable) {
      const { error } = await supabase.from('requisitions').upsert(req);
      if (!error) {
        savedToSupabase = true;
      }
    }
  } catch (e) {
    console.error("Supabase req save failed:", e);
  }

  const { data: current } = await fetchRequisitions();
  const idx = current.findIndex(r => r.id === req.id);
  if (idx > -1) {
    current[idx] = req;
  } else {
    current.unshift(req);
  }
  localStorage.setItem('ams_requisitions', JSON.stringify(current));

  return savedToSupabase;
}

export async function fetchRepairs(): Promise<{ data: Repair[]; fromSupabase: boolean }> {
  try {
    const hasTable = await isTableAvailable('repairs');
    if (hasTable) {
      const { data, error } = await supabase.from('repairs').select('*').order('date', { ascending: false });
      if (!error && data) {
        return { data: data as Repair[], fromSupabase: true };
      }
    }
  } catch (e) {
    console.warn("Supabase repairs fetch failed:", e);
  }

  const local = localStorage.getItem('ams_repairs');
  if (local) {
    return { data: JSON.parse(local), fromSupabase: false };
  }
  localStorage.setItem('ams_repairs', JSON.stringify(REPAIRS_MOCK));
  return { data: REPAIRS_MOCK, fromSupabase: false };
}

export async function upsertRepair(repair: Repair): Promise<boolean> {
  let savedToSupabase = false;
  try {
    const hasTable = await isTableAvailable('repairs');
    if (hasTable) {
      const { error } = await supabase.from('repairs').upsert(repair);
      if (!error) {
        savedToSupabase = true;
      }
    }
  } catch (e) {
    console.error("Supabase repair save failed:", e);
  }

  const { data: current } = await fetchRepairs();
  const idx = current.findIndex(r => r.id === repair.id);
  if (idx > -1) {
    current[idx] = repair;
  } else {
    current.unshift(repair);
  }
  localStorage.setItem('ams_repairs', JSON.stringify(current));

  return savedToSupabase;
}

export async function fetchDisposals(): Promise<{ data: Disposal[]; fromSupabase: boolean }> {
  try {
    const hasTable = await isTableAvailable('disposals');
    if (hasTable) {
      const { data, error } = await supabase.from('disposals').select('*').order('date', { ascending: false });
      if (!error && data) {
        return { data: data as Disposal[], fromSupabase: true };
      }
    }
  } catch (e) {
    console.warn("Supabase disposals fetch failed:", e);
  }

  const local = localStorage.getItem('ams_disposals');
  if (local) {
    return { data: JSON.parse(local), fromSupabase: false };
  }
  localStorage.setItem('ams_disposals', JSON.stringify(DISPOSALS_MOCK));
  return { data: DISPOSALS_MOCK, fromSupabase: false };
}

export async function upsertDisposal(disp: Disposal): Promise<boolean> {
  let savedToSupabase = false;
  try {
    const hasTable = await isTableAvailable('disposals');
    if (hasTable) {
      const { error } = await supabase.from('disposals').upsert(disp);
      if (!error) {
        savedToSupabase = true;
      }
    }
  } catch (e) {
    console.error("Supabase disposal save failed:", e);
  }

  const { data: current } = await fetchDisposals();
  const idx = current.findIndex(d => d.id === disp.id);
  if (idx > -1) {
    current[idx] = disp;
  } else {
    current.unshift(disp);
  }
  localStorage.setItem('ams_disposals', JSON.stringify(current));

  return savedToSupabase;
}
