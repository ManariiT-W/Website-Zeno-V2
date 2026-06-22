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

  if(!data || data.length === 0) {
    empty.style.display = 'block';
    grid.style.display  = 'none';
    if(floatBtn) floatBtn.style.display = 'none';
    return;
  }

  var now = new Date();
  for(var i = 0; i < data.length; i++) {
    var v = data[i];
    if(v.statut === 'en_attente') {
      const { data: pubs } = await zenoDb
        .from('publications')
        .select('date_publication,statut')
        .eq('user_id', currentUser.id)
        .eq('influenceur_id', v.influenceur_id)
        .eq('reseau', v.reseau);
      if(pubs && pubs.length > 0) {
        var shouldPublish = pubs.some(function(p) {
          return new Date(p.date_publication) < now;
        });
        if(shouldPublish) {
          await zenoDb.from('videos').update({ statut:'publiee' }).eq('id', v.id);
          v.statut = 'publiee';
        }
      }
    }
  }

  empty.style.display = 'none';
  grid.style.display  = 'grid';
  if(floatBtn) floatBtn.style.display = 'block';
  document.getElementById('stat-vid').textContent = data.length;
  renderVideoCards(data);
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
  initGenerationView();
}

function closeGenerationView() {
  document.getElementById('videosGenerationView').style.display = 'none';
  document.getElementById('videosMainView').style.display      = 'block';
  loadVideos();
}

/* ─── DÉTAILS VIDÉO (3 points) ─── */
/* ─── DÉTAILS VIDÉO (3 points) ─── */
function openVideoDetails(videoId) {
  var existing = document.getElementById('videoDetailsPopup')
  if(existing) existing.remove()

  // Chercher la vidéo dans le DOM pour récupérer les données
  zenoDb
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .single()
    .then(function({ data: v }) {
      if(!v) return

      var statusColor = v.statut === 'publiee'  ? 'var(--green)'  :
                        v.statut === 'erreur'   ? '#ef4444'       :
                        v.statut === 'en_cours' ? 'var(--gold)'   : 'var(--muted2)'
      var statusLabel = v.statut === 'publiee'  ? '✓ Publiée'     :
                        v.statut === 'erreur'   ? '✗ Erreur'      :
                        v.statut === 'en_cours' ? '⏳ En cours'   : '○ En attente'
      var date = new Date(v.created_at).toLocaleDateString('fr-FR', {
        day:'numeric', month:'long', year:'numeric'
      })

      var overlay = document.createElement('div')
      overlay.id = 'videoDetailsPopup'
      overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(6px)'

      var box = document.createElement('div')
      box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(123,97,255,.2);border-radius:24px;padding:32px;width:100%;max-width:460px;position:relative'

      // Bouton fermer
      var closeBtn = document.createElement('button')
      closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#6b6b80;cursor:pointer;font-size:14px'
      closeBtn.textContent = '✕'
      closeBtn.onclick = function() { overlay.remove() }

      // Titre
      var titleEl = document.createElement('h3')
      titleEl.style.cssText = "font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:20px;color:#fff;padding-right:32px"
      titleEl.textContent = v.titre || 'Vidéo sans titre'

      // Infos
      var rows = [
        { label: 'Réseau',       value: v.reseau || '—' },
        { label: 'Statut',       value: statusLabel, color: statusColor },
        { label: 'Date création', value: date },
        { label: 'Description',  value: v.description || '—' },
        { label: 'Hashtags',     value: v.hashtags || '—' }
      ]

      var infoWrap = document.createElement('div')
      infoWrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin-bottom:24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:16px'

      rows.forEach(function(row) {
        var rowEl = document.createElement('div')
        rowEl.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;gap:12px'
        var labelEl = document.createElement('span')
        labelEl.style.cssText = 'font-size:11px;color:#6b6b80;flex-shrink:0;padding-top:1px'
        labelEl.textContent = row.label
        var valueEl = document.createElement('span')
        valueEl.style.cssText = 'font-size:12.5px;color:' + (row.color || '#a0a0b0') + ';text-align:right;line-height:1.5'
        valueEl.textContent = row.value
        rowEl.appendChild(labelEl)
        rowEl.appendChild(valueEl)
        infoWrap.appendChild(rowEl)
      })

      // Avertissement suppression
      var warningEl = document.createElement('p')
      warningEl.style.cssText = 'font-size:11.5px;color:#6b6b80;text-align:center;margin-bottom:16px;line-height:1.5'
      warningEl.textContent = 'ℹ️ La suppression retire la vidéo de Zeno uniquement. Elle reste publiée sur le réseau social.'

      // Boutons
      var btnWrap = document.createElement('div')
      btnWrap.style.cssText = 'display:flex;gap:10px'

      var btnClose = document.createElement('button')
      btnClose.style.cssText = 'flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#a0a0b0;font-size:13px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif'
      btnClose.textContent = 'Fermer'
      btnClose.onclick = function() { overlay.remove() }

      var btnDelete = document.createElement('button')
      btnDelete.style.cssText = 'flex:1;padding:12px;border-radius:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;transition:all .2s'
      btnDelete.textContent = '🗑 Supprimer'
      btnDelete.onmouseover = function() { this.style.background='rgba(239,68,68,.2)' }
      btnDelete.onmouseout  = function() { this.style.background='rgba(239,68,68,.1)' }
      btnDelete.onclick = function() {
        overlay.remove()
        confirmDeleteVideo(videoId, v.titre || 'cette vidéo')
      }

      btnWrap.appendChild(btnClose)
      btnWrap.appendChild(btnDelete)
      box.appendChild(closeBtn)
      box.appendChild(titleEl)
      box.appendChild(infoWrap)
      box.appendChild(warningEl)
      box.appendChild(btnWrap)
      overlay.appendChild(box)
      document.body.appendChild(overlay)

      overlay.addEventListener('click', function(e) {
        if(e.target === overlay) overlay.remove()
      })
    })
}

/* ─── CONFIRMATION SUPPRESSION ─── */
function confirmDeleteVideo(videoId, titre) {
  var overlay = document.createElement('div')
  overlay.id = 'deleteConfirmPopup'
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.88);backdrop-filter:blur(6px)'

  var box = document.createElement('div')
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(239,68,68,.2);border-radius:24px;padding:36px;width:100%;max-width:400px;text-align:center'

  var icon = document.createElement('div')
  icon.style.cssText = 'font-size:44px;margin-bottom:16px'
  icon.textContent = '🗑'

  var titleEl = document.createElement('h3')
  titleEl.style.cssText = "font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:10px;color:#fff"
  titleEl.textContent = 'Supprimer la vidéo ?'

  var msgEl = document.createElement('p')
  msgEl.style.cssText = 'font-size:13px;color:#6b6b80;line-height:1.65;margin-bottom:8px'
  msgEl.innerHTML = 'Tu es sur le point de supprimer <b style="color:#fff">' + titre + '</b>.'

  var msg2El = document.createElement('p')
  msg2El.style.cssText = 'font-size:12px;color:#ef4444;margin-bottom:24px;font-weight:600'
  msg2El.textContent = 'Cette action est irréversible.'

  var btnWrap = document.createElement('div')
  btnWrap.style.cssText = 'display:flex;gap:10px;justify-content:center'

  var btnCancel = document.createElement('button')
  btnCancel.style.cssText = 'flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#a0a0b0;font-size:13px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif'
  btnCancel.textContent = 'Annuler'
  btnCancel.onclick = function() { overlay.remove() }

  var btnConfirm = document.createElement('button')
  btnConfirm.style.cssText = 'flex:1;padding:12px;border-radius:12px;background:#ef4444;border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif'
  btnConfirm.textContent = 'Oui, supprimer'
  btnConfirm.onclick = function() {
    overlay.remove()
    deleteVideo(videoId)
  }

  btnWrap.appendChild(btnCancel)
  btnWrap.appendChild(btnConfirm)
  box.appendChild(icon)
  box.appendChild(titleEl)
  box.appendChild(msgEl)
  box.appendChild(msg2El)
  box.appendChild(btnWrap)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
}

/* ─── SUPPRIMER LA VIDÉO ─── */
async function deleteVideo(videoId) {
  // Supprimer uniquement les publications liées à cette vidéo
  await zenoDb
    .from('publications')
    .delete()
    .eq('video_id', videoId)
    .eq('user_id', currentUser.id)

  // Supprimer la vidéo
  const { error } = await zenoDb
    .from('videos')
    .delete()
    .eq('id', videoId)
    .eq('user_id', currentUser.id)
    

  // Recharger les vidéos
  loadVideos()

  // Popup succès
  var overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.8);backdrop-filter:blur(4px)'
  var box = document.createElement('div')
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(29,158,117,.2);border-radius:20px;padding:28px;max-width:340px;text-align:center'
  var p = document.createElement('p')
  p.style.cssText = 'font-size:15px;font-weight:700;color:#1D9E75;margin-bottom:6px'
  p.textContent = '✓ Vidéo supprimée'
  var sub = document.createElement('p')
  sub.style.cssText = 'font-size:12.5px;color:#6b6b80'
  sub.textContent = 'La vidéo a été retirée de Zeno.'
  box.appendChild(p)
  box.appendChild(sub)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
  setTimeout(function() { overlay.remove() }, 2000)
}

