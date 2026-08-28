import { createClient } from '@/lib/supabase/client'

export async function getCurrentProfile() {
  const supabase = createClient() as any
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    // Demo fallback - default to admin if no auth session
    return {
      id: 'demo-admin-id',
      full_name: 'Quản Lý Hải Hương (Demo)',
      role: 'admin',
      tenants: { name: 'Nước Mắm Hải Hương' }
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', session.user.id)
    .single()

  return profile || {
    id: session.user.id,
    full_name: session.user.email?.split('@')[0] || 'User',
    role: 'sales',
    tenants: { name: 'Nước Mắm Hải Hương' }
  }
}
