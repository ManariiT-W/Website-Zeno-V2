/* ═══════════════════════════════════════
   ZENO — videos.js
   Gestion complète de la section vidéos
═══════════════════════════════════════ */

/* ─── CHARGER LES VIDÉOS ─── */
async function loadVideos() {
  if(!currentUser) return
  const { data } = await zenoDb
    .from('videos')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', {ascending:false})

  var grid     = document.getElementById('videosGrid')
  var empty    = document.getElementById('videosEmpty')
  var floatBtn = document.getElementById('btnGenererFloat')

  if(data && data.length > 0) {
    empty.style.display = 'none'
    grid.style.display  = 'grid'
    if(floatBtn) floatBtn.style.display = 'block'
    document.getElementById('stat-vid').textContent = data.length
    renderVideoCards(data)
  } else {
    empty.style.display = 'block'
    grid.style.display  = 'none'
    if(floatBtn) floatBtn.style.display = 'none'
  }
}

/* ─── AFFICHER LES CARTES VIDÉOS ─── */
function renderVideoCards(videos) {
  var grid = document.getElementById('videosGrid')
  grid.innerHTML = videos.map(function(v) {
    var statusColor = v.statut === 'publiee'   ? 'var(--green)'  :
                      v.statut === 'erreur'    ? '#ef4444'       :
                      v.statut === 'en_cours'  ? 'var(--gold)'   : 'var(--muted2)'
    var statusLabel = v.statut === 'publiee'   ? '✓ Publiée'     :
                      v.statut === 'erreur'    ? '✗ Erreur'      :
                      v.statut === 'en_cours'  ? '⏳ En cours'   : '○ En attente'
    var date = new Date(v.created_at).toLocaleDateString('fr-FR')
    return `
      <div class="video-card" data-id="${v.id}" data-status="${v.statut}">
        <div class="video-card-thumb">
          <span class="video-card-emoji">🎬</span>
          <div class="video-card-status" style="color:${statusColor}">${statusLabel}</div>
          <button class="video-card-dots" onclick="openVideoDetails('${v.id}')">···</button>
        </div>
        <div class="video-card-body">
          <div class="video-card-title">${v.titre || 'Vidéo sans titre'}</div>
          <div class="video-card-meta">${v.reseau || ''} · ${date}</div>
        </div>
      </div>`
  }).join('')
}

/* ─── FILTRER LES VIDÉOS ─── */
function filterVideos(status) {
  document.querySelectorAll('.video-card').forEach(function(card) {
    if(status === 'all' || card.dataset.status === status) {
      card.style.display = ''
    } else {
      card.style.display = 'none'
    }
  })
}

/* ─── VÉRIFIER CONDITIONS AVANT GÉNÉRATION ─── */
async function checkAndOpenGeneration() {
  if(!currentUser) return

  // Condition 1 — au moins 1 influenceur créé
  const { data: infs } = await zenoDb
    .from('influenceurs')
    .select('id')
    .eq('user_id', currentUser.id)
  var hasInfluenceur = infs && infs.length > 0

  // Condition 2 — au moins 1 réseau social lié
  const { data: userData } = await zenoDb
    .from('users')
    .select('reseau_lie')
    .eq('id', currentUser.id)
    .single()
  var hasReseau = userData && userData.reseau_lie && userData.reseau_lie !== ''

  // Aucune condition remplie → popup groupé
  if(!hasInfluenceur && !hasReseau) {
    showVideoCondPopup('both'); return
  }
  // Manque influenceur
  if(!hasInfluenceur) {
    showVideoCondPopup('no_influenceur'); return
  }
  // Manque réseau
  if(!hasReseau) {
    showVideoCondPopup('no_reseau'); return
  }

  // Les 2 conditions remplies → ouvrir génération
  openGenerationView()
}

/* ─── POPUP CONDITIONS ─── */
function showVideoCondPopup(type) {
  var existing = document.getElementById('videoCondPopup')
  if(existing) existing.remove()

  var title, msg, btn1Label, btn1Action

  if(type === 'no_influenceur') {
    title      = '🤖 Aucun influenceur créé'
    msg        = 'Tu dois créer au moins <strong>1 influenceur IA</strong> avant de pouvoir générer une vidéo.'
    btn1Label  = 'Créer mon influenceur'
    btn1Action = "document.getElementById('videoCondPopup').remove();showView('creation')"
  } else if(type === 'no_reseau') {
    title      = '🔗 Aucun réseau social lié'
    msg        = 'Tu dois lier au moins <strong>1 compte réseau social</strong>.<br><br>Va dans <strong>Paramètres → Liaison réseaux sociaux</strong>.'
    btn1Label  = 'Aller dans Paramètres'
    btn1Action = "document.getElementById('videoCondPopup').remove();showView('parametres')"
  } else {
    title      = '⚠️ Deux étapes manquantes'
    msg        = '1. Crée au moins <strong>1 influenceur IA</strong>.<br>2. Lie au moins <strong>1 compte réseau social</strong> dans les Paramètres.'
    btn1Label  = 'Créer mon influenceur'
    btn1Action = "document.getElementById('videoCondPopup').remove();showView('creation')"
  }

  var popup = document.createElement('div')
  popup.id = 'videoCondPopup'
  popup.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(6px)'
  popup.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-xl);padding:36px;width:100%;max-width:420px;text-align:center;animation:popIn .3s ease-out">
      <h3 style="font-family:'Syne',sans-serif;font-size:19px;font-weight:800;margin-bottom:12px">${title}</h3>
      <p style="font-size:13.5px;color:var(--muted);line-height:1.7;margin-bottom:28px">${msg}</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button onclick="${btn1Action}" style="padding:12px;border-radius:var(--r-md);background:var(--violet);border:none;color:var(--white);font-size:13.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 0 20px rgba(123,97,255,.3)">${btn1Label}</button>
        <button onclick="document.getElementById('videoCondPopup').remove()" style="padding:12px;border-radius:var(--r-md);background:rgba(255,255,255,.05);border:1px solid var(--border2);color:var(--muted2);font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif">Fermer</button>
      </div>
    </div>`
  document.body.appendChild(popup)
  popup.addEventListener('click', function(e) {
    if(e.target === popup) popup.remove()
  })
}

/* ─── OUVRIR / FERMER VUE GÉNÉRATION ─── */
function openGenerationView() {
  document.getElementById('videosMainView').style.display  = 'none'
  document.getElementById('videosGenerationView').style.display = 'block'
}

function closeGenerationView() {
  document.getElementById('videosGenerationView').style.display = 'none'
  document.getElementById('videosMainView').style.display  = 'block'
  loadVideos()
}

/* ─── DÉTAILS VIDÉO (3 points) ─── */
function openVideoDetails(videoId) {
  // Sera complété en Partie 4
  console.log('Détails vidéo :', videoId)
}
