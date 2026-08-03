export default async function handler(req, res) {
  // Sécurité : seul Vercel Cron peut appeler cette route
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const BREVO_API_KEY = process.env.BREVO_API_KEY

  try {
    // 1. Récupérer tous les utilisateurs Stellar avec rapport activé
    const usersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?plan=eq.stellar&rapport_frequence=neq.aucun&select=*`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const users = await usersRes.json()

    const today = new Date()
    const isMonday = today.getDay() === 1
    const isFirstOfMonth = today.getDate() === 1

    let sent = 0

    for (const user of users) {
      const shouldSendHebdo = user.rapport_frequence === 'hebdo' && isMonday
      const shouldSendMensuel = user.rapport_frequence === 'mensuel' && isFirstOfMonth
      if (!shouldSendHebdo && !shouldSendMensuel) continue

      const destinataire = user.rapport_email || user.email
      const periode = user.rapport_frequence === 'hebdo' ? '7 derniers jours' : 'Ce mois'

      // 2. Envoi via API Brevo
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Zeno', email: 'manarii.taufaw19@gmail.com' },
          to: [{ email: destinataire }],
          subject: `Ton rapport Zeno — ${periode}`,
          htmlContent: `
            <div style="font-family:sans-serif;padding:24px;background:#0d0d1f;color:#fff">
              <h2 style="color:#7b61ff">✦ Zeno — Rapport de performances</h2>
              <p>Bonjour ${user.prenom || ''},</p>
              <p>Voici un résumé de tes performances sur la période : <b>${periode}</b>.</p>
              <p style="color:#a0a0b0;font-size:13px">Connecte-toi à ton dashboard Zeno pour voir le détail complet et exporter le rapport en PDF/Excel.</p>
              <a href="https://TON-DOMAINE-VERCEL.vercel.app/dashboard.html" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7b61ff;color:#fff;text-decoration:none;border-radius:8px">Voir mon dashboard</a>
            </div>
          `
        })
      })

      sent++
    }

    return res.status(200).json({ success: true, sent })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}