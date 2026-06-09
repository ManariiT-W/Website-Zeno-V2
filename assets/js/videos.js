/* ═══════════════════════════════════════
   ZENO — videos.js
   Gestion complète de la section vidéos
═══════════════════════════════════════ */

/* ─── CHARGER LES VIDÉOS ─── */
async function loadVideos() {
  if(!currentUser) return;
  var grid     = document.getElementById('videosGrid');
  var empty    = document.getElementById('videosEmpty');
  var floatBtn = document.getElementById('btnGenererFloat');
  if(!grid || !empty) return;

  const { data } = await zenoDb
    .from('videos')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', {ascending:false});

  if(data && data.length > 0) {
    empty.style.display = 'none';
    grid.style.display  = 'grid';
    if(floatBtn) floatBtn.style.display = 'block';
    document.getElementById('stat-vid').textContent = data.length;
    renderVideoCards(data);
  } else {
    empty.style.display = 'block';
    grid.style.display  = 'none';
    if(floatBtn) floatBtn.style.display = 'none';
  }
}

/* ─── AFFICHER LES CARTES VIDÉOS ─── */
function renderVideoCards(videos) {
  var grid = document.getElementById('videosGrid');
  var html = '';
  videos.forEach(function(v) {
    var statusColor = v.statut === 'publiee'  ? 'var(--green)'  :
                      v.statut === 'erreur'   ? '#ef4444'       :
                      v.statut === 'en_cours' ? 'var(--gold)'   : 'var(--muted2)';
    var statusLabel = v.statut === 'publiee'  ? '✓ Publiée'     :
                      v.statut === 'erreur'   ? '✗ Erreur'      :
                      v.statut === 'en_cours' ? '⏳ En cours'   : '○ En attente';
    var date = new Date(v.created_at).toLocaleDateString('fr-FR');
    html += '<div class="video-card" data-id="' + v.id + '" data-status="' + v.statut + '">';
    html += '<div class="video-card-thumb">';
    html += '<span class="video-card-emoji">🎬</span>';
    html += '<div class="video-card-status" style="color:' + statusColor + '">' + statusLabel + '</div>';
    html += '<button class="video-card-dots" onclick="openVideoDetails(\'' + v.id + '\')">···</button>';
    html += '</div>';
    html += '<div class="video-card-body">';
    html += '<div class="video-card-title">' + (v.titre || 'Vidéo sans titre') + '</div>';
    html += '<div class="video-card-meta">' + (v.reseau || '') + ' · ' + date + '</div>';
    html += '</div></div>';
  });
  grid.innerHTML = html;
}

/* ─── FILTRER LES VIDÉOS ─── */
function filterVideos(status) {
  document.querySelectorAll('.video-card').forEach(function(card) {
    if(status === 'all' || card.dataset.status === status) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

/* ─── VÉRIFIER CONDITIONS AVANT GÉNÉRATION ─── */
async function checkAndOpenGeneration() {
  if(!currentUser) return;

  var hasInfluenceur = false;
  var hasReseau      = false;

  const { data: infs } = await zenoDb
    .from('influenceurs')
    .select('id')
    .eq('user_id', currentUser.id);
  hasInfluenceur = infs && infs.length > 0;

  const { data: userData } = await zenoDb
    .from('users')
    .select('reseau_lie')
    .eq('id', currentUser.id)
    .single();
  hasReseau = userData && userData.reseau_lie && userData.reseau_lie !== '';

  if(!hasInfluenceur && !hasReseau) {
    showVideoCondPopup('both'); return;
  }
  if(!hasInfluenceur) {
    showVideoCondPopup('no_influenceur'); return;
  }
  if(!hasReseau) {
    showVideoCondPopup('no_reseau'); return;
  }
  openGenerationView();
}

/* ─── POPUP CONDITIONS ─── */
function showVideoCondPopup(type) {
  var existing = document.getElementById('videoCondPopup');
  if(existing) existing.remove();

  var title, msg, btn1Label, btn1Action;

  if(type === 'no_influenceur') {
    title      = '🤖 Aucun influenceur créé';
    msg        = 'Tu dois créer au moins <b>1 influenceur IA</b> avant de pouvoir générer une vidéo.';
    btn1Label  = 'Créer mon influenceur';
    btn1Action = 'no_influenceur';
  } else if(type === 'no_reseau') {
    title      = '🔗 Aucun réseau social lié';
    msg        = 'Tu dois lier au moins <b>1 compte réseau social</b>.<br><br>Va dans <b>Paramètres</b> pour lier ton compte.';
    btn1Label  = 'Aller dans Paramètres';
    btn1Action = 'no_reseau';
  } else {
    title      = '⚠️ Deux étapes manquantes';
    msg        = '1. Crée au moins <b>1 influenceur IA</b>.<br>2. Lie au moins <b>1 compte réseau social</b> dans les Paramètres.';
    btn1Label  = 'Créer mon influenceur';
    btn1Action = 'no_influenceur';
  }

  var overlay = document.createElement('div');
  overlay.id = 'videoCondPopup';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(6px)';

  var box = document.createElement('div');
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(123,97,255,.25);border-radius:24px;padding:36px;width:100%;max-width:420px;text-align:center';

  var titleEl = document.createElement('h3');
  titleEl.style.cssText = "font-family:'Syne',sans-serif;font-size:19px;font-weight:800;margin-bottom:12px;color:#fff";
  titleEl.textContent = title;

  var msgEl = document.createElement('p');
  msgEl.style.cssText = 'font-size:13.5px;color:#6b6b80;line-height:1.7;margin-bottom:28px';
  msgEl.innerHTML = msg;

  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:10px';

  var btn1 = document.createElement('button');
  btn1.style.cssText = 'padding:12px;border-radius:12px;background:#7b61ff;border:none;color:#fff;font-size:13.5px;font-weight:700;cursor:pointer';
  btn1.textContent = btn1Label;
  btn1.onclick = function() {
    overlay.remove();
    if(btn1Action === 'no_influenceur') showView('creation');
    else showView('parametres');
  };

  var btn2 = document.createElement('button');
  btn2.style.cssText = 'padding:12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#a0a0b0;font-size:13px;font-weight:600;cursor:pointer';
  btn2.textContent = 'Fermer';
  btn2.onclick = function() { overlay.remove(); };

  btnWrap.appendChild(btn1);
  btnWrap.appendChild(btn2);
  box.appendChild(titleEl);
  box.appendChild(msgEl);
  box.appendChild(btnWrap);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if(e.target === overlay) overlay.remove();
  });
}

/* ─── OUVRIR / FERMER VUE GÉNÉRATION ─── */
function openGenerationView() {
  document.getElementById('videosMainView').style.display      = 'none';
  document.getElementById('videosGenerationView').style.display = 'block';
}

function closeGenerationView() {
  document.getElementById('videosGenerationView').style.display = 'none';
  document.getElementById('videosMainView').style.display      = 'block';
  loadVideos();
}

/* ─── DÉTAILS VIDÉO (3 points) ─── */
function openVideoDetails(videoId) {
  console.log('Détails vidéo :', videoId);
}
