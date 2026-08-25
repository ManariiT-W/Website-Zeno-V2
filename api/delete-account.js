export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

  // 1. Récupérer le token envoyé par le client (session de l'utilisateur connecté)
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  const userToken = authHeader.replace('Bearer ', '')

  try {
    // 2. Vérifier le token et récupérer l'utilisateur correspondant
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${userToken}`
      }
    })
    const userData = await userRes.json()

    if (!userRes.ok || !userData.id) {
      return res.status(401).json({ error: 'Session invalide' })
    }

    const userId = userData.id

    // 3. Supprimer en cascade toutes les données liées (via Service Role Key)
    const tables = ['audit_logs', 'publications', 'videos', 'scripts', 'influenceurs', 'dossiers']

    for (const table of tables) {
      const delRes = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?user_id=eq.${userId}`,
        {
          method: 'DELETE',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            Prefer: 'return=minimal'
          }
        }
      )
      if (!delRes.ok) {
        console.error(`Erreur suppression table ${table}:`, await delRes.text())
      }
    }

    // 4. Supprimer la ligne dans la table users
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=minimal'
      }
    })

    // 5. Supprimer le compte auth (Supabase Auth Admin API)
    const deleteAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    })

    if (!deleteAuthRes.ok) {
      const errText = await deleteAuthRes.text()
      console.error('Erreur suppression auth:', errText)
      return res.status(500).json({ error: 'Échec de la suppression du compte' })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Erreur delete-account:', err)
    return res.status(500).json({ error: err.message })
  }
}