/* ═══════════════════════════════════════
   ZENO — generation.js
   Interface de génération de vidéo
═══════════════════════════════════════ */

var generationData = {
  influenceur_id: '',
  influenceur_nom: '',
  format: '9:16',
  qualite: '1080p',
  duree: '30',
  description: '',
  reseau: ''
}

/* ─── INITIALISER LA VUE GÉNÉRATION ─── */
async function initGenerationView() {
  var wrap = document.getElementById('videosGenerationView')
  if(!wrap) return

  var infs = await getInfluenceurs()

  wrap.innerHTML = buildGenerationHTML(infs)
  bindGenerationEvents()
  updatePreview()
}

/* ─── RÉCUPÉRER LES INFLUENCEURS ─── */
async function getInfluenceurs() {
  if(!currentUser) return []
  const { data } = await zenoDb
    .from('influenceurs')
    .select('*')
    .eq('user_id', currentUser.id)
  return data || []
}

/* ─── CONSTRUIRE LE HTML ─── */
function buildGenerationHTML(infs) {
  var infCards = ''
  infs.forEach(function(inf) {
    var emojis = {mode:'👗',fitness:'💪',tech:'💻',food:'🍕',gaming:'🎮',travel:'✈️',business:'💼',beauty:'💄'}
    var emoji = emojis[inf.niche] || '🤖'
    infCards += '<div class="gen-inf-card" data-id="' + inf.id + '" data-nom="' + inf.nom + '" onclick="selectInfluenceur(this)">'
    infCards += '<div class="gen-inf-emoji">' + emoji + '</div>'
    infCards += '<div class="gen-inf-nom">' + inf.nom + '</div>'
    infCards += '<div class="gen-inf-niche">' + (inf.niche || '') + '</div>'
    infCards += '</div>'
  })

  return '<div class="gen-wrap">' +

    /* HEADER */
    '<div class="gen-header">' +
    '<button class="gen-back-btn" onclick="closeGenerationView()">← Retour</button>' +
    '<h2 class="gen-title">Générer une vidéo</h2>' +
    '<div style="width:80px"></div>' +
    '</div>' +

    '<div class="gen-layout">' +

    /* SECTION 1 — Barre latérale gauche */
    '<div class="gen-sidebar">' +

    '<div class="gen-section-title">Influenceur</div>' +
    '<div class="gen-inf-grid" id="genInfGrid">' + infCards + '</div>' +

    '<div class="gen-section-title" style="margin-top:20px">Format vidéo</div>' +
    '<div class="gen-options-grid">' +
    '<div class="gen-option selected" data-group="format" data-val="9:16" onclick="selectOption(this,\'format\')"><span class="gen-option-icon">📱</span><span class="gen-option-label">9:16</span><span class="gen-option-sub">TikTok / Reels</span></div>' +
    '<div class="gen-option" data-group="format" data-val="1:1" onclick="selectOption(this,\'format\')"><span class="gen-option-icon">⬜</span><span class="gen-option-label">1:1</span><span class="gen-option-sub">Instagram Feed</span></div>' +
    '<div class="gen-option" data-group="format" data-val="16:9" onclick="selectOption(this,\'format\')"><span class="gen-option-icon">🖥️</span><span class="gen-option-label">16:9</span><span class="gen-option-sub">YouTube</span></div>' +
    '</div>' +

    '<div class="gen-section-title" style="margin-top:20px">Qualité vidéo</div>' +
    '<div class="gen-options-grid">' +
    '<div class="gen-option selected" data-group="qualite" data-val="720p" onclick="selectOption(this,\'qualite\')"><span class="gen-option-label">720p</span></div>' +
    '<div class="gen-option gen-option-locked" data-group="qualite" data-val="1080p" data-plan="nova" onclick="selectQualiteLocked(this,\'nova\')"><span class="gen-option-label">1080p</span><span class="gen-option-lock">🔒</span></div>' +
    '<div class="gen-option gen-option-locked" data-group="qualite" data-val="4K" data-plan="nova" onclick="selectQualiteLocked(this,\'nova\')"><span class="gen-option-label">4K</span><span class="gen-option-lock">🔒</span></div>' +
    '</div>' +

    '<div class="gen-section-title" style="margin-top:20px">Durée</div>' +
    '<div class="gen-options-grid">' +
    '<div class="gen-option" data-group="duree" data-val="20" onclick="selectOption(this,\'duree\')"><span class="gen-option-label">20s</span></div>' +
    '<div class="gen-option" data-group="duree" data-val="25" onclick="selectOption(this,\'duree\')"><span class="gen-option-label">25s</span></div>' +
    '<div class="gen-option selected" data-group="duree" data-val="30" onclick="selectOption(this,\'duree\')"><span class="gen-option-label">30s</span></div>' +
    '<div class="gen-option" data-group="duree" data-val="35" onclick="selectOption(this,\'duree\')"><span class="gen-option-label">35s</span></div>' +
    '<div class="gen-option" data-group="duree" data-val="60" onclick="selectOption(this,\'duree\')"><span class="gen-option-label">60s</span></div>' +
    '</div>' +

    '</div>' +

    /* SECTION 2 — Description */
    '<div class="gen-main">' +
    '<div class="gen-section-title">Description de la vidéo</div>' +
    '<p style="font-size:12.5px;color:var(--muted);margin-bottom:12px;line-height:1.6">Décris comment ta vidéo doit commencer et se terminer. L\'IA générera le script et la vidéo selon ta description.</p>' +
    '<textarea id="genDescription" class="gen-textarea" placeholder="Ex: La vidéo commence avec Luna qui salue ses abonnés depuis un café parisien. Elle présente les 3 tendances mode de l\'été. La vidéo se termine avec un appel à l\'action pour s\'abonner..." oninput="updateDescription(this.value)"></textarea>' +
    '<div id="genDescCount" style="font-size:11px;color:var(--muted);text-align:right;margin-top:6px">0 / 500 caractères</div>' +

    '<div class="gen-actions">' +
    '<button class="gen-btn-launch" id="genBtnLaunch" onclick="lancerGeneration()">✨ Lancer la génération</button>' +
    '<button class="gen-btn-confirm" id="genBtnConfirm" onclick="confirmerGeneration()" disabled>✓ Confirmer et publier</button>' +
    '</div>' +

    '<div id="genStatus" style="display:none;margin-top:16px">' +
    '<div class="gen-progress-wrap">' +
    '<div class="gen-progress-bar" id="genProgressBar"></div>' +
    '</div>' +
    '<div id="genStatusText" style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px">Génération en cours...</div>' +
    '</div>' +

    '</div>' +

    /* SECTION 3 — Aperçu */
    '<div class="gen-preview">' +
    '<div class="gen-section-title">Aperçu</div>' +
    '<div class="gen-preview-box" id="genPreviewBox">' +
    '<div class="gen-preview-empty" id="genPreviewEmpty">' +
    '<div style="font-size:40px;margin-bottom:12px;opacity:.3">🎬</div>' +
    '<p style="font-size:12px;color:var(--muted)">L\'aperçu apparaîtra<br>après la génération</p>' +
    '</div>' +
    '<div class="gen-preview-result" id="genPreviewResult" style="display:none">' +
    '<div class="gen-preview-thumb" id="genPreviewThumb"></div>' +
    '<div class="gen-preview-info" id="genPreviewInfo"></div>' +
    '</div>' +
    '</div>' +
    '</div>' +

    '</div>' +
    '</div>'
}

/* ─── SÉLECTIONNER UN INFLUENCEUR ─── */
function selectInfluenceur(card) {
  document.querySelectorAll('.gen-inf-card').forEach(function(c) { c.classList.remove('selected') })
  card.classList.add('selected')
  generationData.influenceur_id  = card.dataset.id
  generationData.influenceur_nom = card.dataset.nom
  updatePreview()
}

/* ─── SÉLECTIONNER UNE OPTION ─── */
function selectOption(el, group) {
  document.querySelectorAll('[data-group="' + group + '"]').forEach(function(o) { o.classList.remove('selected') })
  el.classList.add('selected')
  generationData[group] = el.dataset.val
  updatePreview()
}

/* ─── METTRE À JOUR LA DESCRIPTION ─── */
function updateDescription(val) {
  generationData.description = val
  var count = document.getElementById('genDescCount')
  if(count) count.textContent = val.length + ' / 500 caractères'
  if(val.length > 500) {
    document.getElementById('genDescription').value = val.substring(0, 500)
    generationData.description = val.substring(0, 500)
  }
}

/* ─── METTRE À JOUR L'APERÇU ─── */
function updatePreview() {
  var box = document.getElementById('genPreviewBox')
  if(!box) return

  // Reset styles
  box.style.width      = '100%'
  box.style.maxHeight  = '320px'
  box.style.overflow   = 'hidden'

  if(generationData.format === '9:16') {
    box.style.aspectRatio = '9/16'
    box.style.maxWidth    = '180px'
    box.style.margin      = '0 auto 20px'
  } else if(generationData.format === '1:1') {
    box.style.aspectRatio = '1/1'
    box.style.maxWidth    = '280px'
    box.style.margin      = '0 auto 20px'
  } else {
    box.style.aspectRatio = '16/9'
    box.style.maxWidth    = '100%'
    box.style.margin      = '0 0 20px 0'
  }
}

/* ─── LANCER LA GÉNÉRATION ─── */
async function lancerGeneration() {
  if(!generationData.influenceur_id) {
    showGenAlert('Sélectionne un influenceur avant de générer.'); return
  }
  if(!generationData.description.trim()) {
    showGenAlert('Décris ta vidéo avant de la générer.'); return
  }

  var btnLaunch   = document.getElementById('genBtnLaunch')
  var btnConfirm  = document.getElementById('genBtnConfirm')
  var statusWrap  = document.getElementById('genStatus')
  var progressBar = document.getElementById('genProgressBar')
  var statusText  = document.getElementById('genStatusText')

  btnLaunch.disabled  = true
  btnLaunch.textContent = '⏳ Génération en cours...'
  statusWrap.style.display = 'block'

  var steps = [
    { text: 'Analyse de la description...', width: '20%' },
    { text: 'Génération du script IA...', width: '40%' },
    { text: 'Création de la voix...', width: '60%' },
    { text: 'Animation du visage...', width: '80%' },
    { text: 'Finalisation de la vidéo...', width: '95%' }
  ]
  var i = 0
  var interval = setInterval(function() {
    if(i < steps.length) {
      progressBar.style.width = steps[i].width
      statusText.textContent  = steps[i].text
      i++
    } else {
      clearInterval(interval)
      progressBar.style.width = '100%'
      statusText.textContent  = '✓ Vidéo générée !'
      statusText.style.color  = 'var(--green)'
      btnLaunch.textContent   = '🔄 Régénérer'
      btnLaunch.disabled      = false
      btnConfirm.disabled     = false
      showPreviewResult()
    }
  }, 1200)
}

/* ─── AFFICHER LE RÉSULTAT ─── */
function showPreviewResult() {
  var empty  = document.getElementById('genPreviewEmpty')
  var result = document.getElementById('genPreviewResult')
  var thumb  = document.getElementById('genPreviewThumb')
  var info   = document.getElementById('genPreviewInfo')
  if(!empty || !result) return

  empty.style.display  = 'none'
  result.style.display = 'block'

  thumb.style.cssText = 'width:100%;height:200px;background:linear-gradient(135deg,rgba(123,97,255,.3),rgba(0,212,255,.15));display:flex;align-items:center;justify-content:center;font-size:48px;border-radius:12px;margin-bottom:12px'
  thumb.textContent = '🎬'

  info.innerHTML =
    '<div style="font-size:11px;color:var(--muted);line-height:1.8">' +
    '<div><b style="color:var(--muted2)">Influenceur :</b> ' + generationData.influenceur_nom + '</div>' +
    '<div><b style="color:var(--muted2)">Format :</b> ' + generationData.format + '</div>' +
    '<div><b style="color:var(--muted2)">Qualité :</b> ' + generationData.qualite + '</div>' +
    '<div><b style="color:var(--muted2)">Durée :</b> ' + generationData.duree + 's</div>' +
    '</div>'
}

/* ─── CONFIRMER ET PUBLIER ─── */
function confirmerGeneration() {
  if(document.getElementById('genBtnConfirm').disabled) return
  openPlanificationView()
}

/* ─── ALERTE SIMPLE ─── */
function showGenAlert(msg) {
  var existing = document.getElementById('genAlertPopup')
  if(existing) existing.remove()
  var overlay = document.createElement('div')
  overlay.id = 'genAlertPopup'
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.8);backdrop-filter:blur(4px)'
  var box = document.createElement('div')
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(123,97,255,.25);border-radius:20px;padding:28px;max-width:360px;text-align:center'
  var p = document.createElement('p')
  p.style.cssText = 'font-size:13.5px;color:#a0a0b0;margin-bottom:20px;line-height:1.6'
  p.textContent = msg
  var btn = document.createElement('button')
  btn.style.cssText = 'padding:10px 24px;border-radius:10px;background:#7b61ff;border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer'
  btn.textContent = 'OK'
  btn.onclick = function() { overlay.remove() }
  box.appendChild(p)
  box.appendChild(btn)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
}

/* ─── QUALITÉ VERROUILLÉE ─── */
function selectQualiteLocked(el, planRequired) {
  var plan = window.currentPlanUser || 'starter'
  var planLabel = planRequired === 'nova' ? 'Nova' : 'Stellar'

  // Si le plan est suffisant on sélectionne normalement
  if(plan === 'nova' || plan === 'stellar') {
    el.classList.remove('gen-option-locked')
    selectOption(el, 'qualite')
    return
  }

  // Sinon popup upgrade
  var overlay = document.createElement('div')
  overlay.id = 'qualitePopup'
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(6px)'
  var box = document.createElement('div')
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(123,97,255,.25);border-radius:24px;padding:36px;max-width:380px;text-align:center'
  var titleEl = document.createElement('h3')
  titleEl.style.cssText = "font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:10px;color:#fff"
  titleEl.textContent = '🔒 Qualité ' + el.dataset.val
  var msgEl = document.createElement('p')
  msgEl.style.cssText = 'font-size:13px;color:#6b6b80;line-height:1.65;margin-bottom:24px'
  msgEl.innerHTML = 'La qualité <b style="color:#fff">' + el.dataset.val + '</b> est disponible à partir du plan <b style="color:#a08bff">' + planLabel + '</b>.<br><br>Passe au plan ' + planLabel + ' pour débloquer cette qualité.'
  var btnWrap = document.createElement('div')
  btnWrap.style.cssText = 'display:flex;gap:10px;justify-content:center'
  var btn1 = document.createElement('button')
  btn1.style.cssText = 'padding:11px 22px;border-radius:12px;background:#7b61ff;border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer'
  btn1.textContent = 'Voir les plans'
  btn1.onclick = function() { overlay.remove(); window.location.href='index.html#tarifs' }
  var btn2 = document.createElement('button')
  btn2.style.cssText = 'padding:11px 22px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#a0a0b0;font-size:13px;font-weight:600;cursor:pointer'
  btn2.textContent = 'Fermer'
  btn2.onclick = function() { overlay.remove() }
  btnWrap.appendChild(btn1)
  btnWrap.appendChild(btn2)
  box.appendChild(titleEl)
  box.appendChild(msgEl)
  box.appendChild(btnWrap)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
  overlay.addEventListener('click', function(e) { if(e.target === overlay) overlay.remove() })
}

/* ─── BIND EVENTS ─── */
function bindGenerationEvents() {}

/* ─── PLANIFICATION (Partie 3) ─── */
function openPlanificationView() {
  var wrap = document.getElementById('videosGenerationView')
  if(!wrap) return
  wrap.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted)"><div style="font-size:48px;margin-bottom:16px">📅</div><p>Interface de planification — Partie 3 à venir</p><br><button onclick="closeGenerationView()" style="padding:10px 20px;border-radius:12px;background:#0d0d1f;border:1px solid rgba(255,255,255,.1);color:#a0a0b0;cursor:pointer">← Retour</button></div>'
}
