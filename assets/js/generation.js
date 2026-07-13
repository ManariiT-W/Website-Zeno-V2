/* ═══════════════════════════════════════
   ZENO — generation.js
   Interface de génération de vidéo
═══════════════════════════════════════ */

var generationData = {
  influenceur_id: '',
  influenceur_nom: '',
  format: '9:16',
  qualite: '720p',
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

    /* SECTION 2 — Centre : Aperçu + Description */
    '<div class="gen-main">' +
    '<div class="gen-section-title">Aperçu</div>' +
    '<div id="genPreviewBox" style="width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;min-height:160px;transition:all .3s;overflow:hidden">' +
    '<div id="genPreviewEmpty" style="text-align:center;padding:24px">' +
    '<div style="font-size:36px;margin-bottom:10px;opacity:.3">🎬</div>' +
    '<p style="font-size:11px;color:var(--muted)">Aperçu après génération</p>' +
    '</div>' +
    '<div id="genPreviewResult" style="display:none;width:100%;padding:14px">' +
    '<div id="genPreviewThumb"></div>' +
    '<div id="genPreviewInfo"></div>' +
    '</div>' +
    '</div>' +
    '<div class="gen-section-title">Description de la vidéo</div>' +
    '<p style="font-size:12.5px;color:var(--muted);margin-bottom:12px;line-height:1.6">Décris comment ta vidéo doit commencer et se terminer.</p>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
    '<span style="font-size:12.5px;color:var(--muted)">Décris comment ta vidéo doit commencer et se terminer.</span>' +
    '<button onclick="openScriptSelector()" style="display:flex;align-items:center;gap:6px;background:rgba(123,97,255,.1);border:1px solid rgba(123,97,255,.25);border-radius:8px;padding:6px 12px;color:var(--violet2);font-size:12px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif;transition:all .2s" onmouseover="this.style.background=\'rgba(123,97,255,.2)\'" onmouseout="this.style.background=\'rgba(123,97,255,.1)\'">📝 Utiliser un script</button>' +
    '</div>' +
    '<textarea id="genDescription" class="gen-textarea" placeholder="Ex: La vidéo commence avec Luna qui salue ses abonnés depuis un café parisien..." oninput="updateDescription(this.value)"></textarea>' +
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

  var today = new Date()
  var monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  var currentMonth = today.getMonth()
  var currentYear  = today.getFullYear()

  wrap.innerHTML =
    '<div class="plan-wrap">' +
    '<div class="plan-header">' +
    '<button class="gen-back-btn" onclick="retourGeneration()">← Retour</button>' +
    '<h2 class="gen-title">Planifier la publication</h2>' +
    '<div style="width:80px"></div>' +
    '</div>' +

    '<div class="plan-layout">' +

    /* Colonne gauche - couverture + description */
    '<div class="plan-left">' +
    '<div class="plan-section-title">Image de couverture</div>' +
    '<div class="plan-cover-wrap">' +
    '<div class="plan-cover-preview" id="planCoverPreview">' +
    '<div style="font-size:32px;margin-bottom:8px;opacity:.4">🖼️</div>' +
    '<p style="font-size:11px;color:var(--muted)">Aucune image sélectionnée</p>' +
    '</div>' +
    '<div class="plan-cover-options">' +
    '<button class="plan-cover-btn" onclick="selectCoverFrame()">📸 Choisir une frame</button>' +
    '<button class="plan-cover-btn" onclick="document.getElementById(\'coverUpload\').click()">⬆️ Uploader une image</button>' +
    '<input type="file" id="coverUpload" accept="image/*" style="display:none" onchange="handleCoverUpload(this)">' +
    '<button class="plan-cover-btn" onclick="generateAICover()">✨ Générer avec l\'IA</button>' +
    '</div>' +
    '</div>' +

    '<div class="plan-section-title" style="margin-top:20px">Description</div>' +
    '<textarea id="planDescription" class="gen-textarea" style="height:100px" placeholder="Description de ta vidéo..."></textarea>' +

    '<div class="plan-section-title" style="margin-top:14px">Hashtags</div>' +
    '<textarea id="planHashtags" class="gen-textarea" style="height:70px" placeholder="#mode #fashion #tendance..."></textarea>' +

    '</div>' +

    /* Colonne droite - calendrier + plateforme */
    '<div class="plan-right">' +

    '<div class="plan-section-title">Date de publication</div>' +
    '<div class="plan-calendar" id="planCalendar">' +
    buildCalendar(currentMonth, currentYear, today) +
    '</div>' +

    '<div class="plan-time-wrap">' +
    '<div class="plan-section-title" style="margin-bottom:10px">Heure de publication</div>' +
    '<div style="display:flex;align-items:center;gap:10px">' +
    '<select id="planHeure" class="plan-select" onchange="checkPublishReady()">' + buildHours() + '</select>' +
    '<span style="color:var(--muted);font-weight:700">:</span>' +
    '<select id="planMinute" class="plan-select" onchange="checkPublishReady()">' + buildMinutes() + '</select>' +
    '</div>' +
    '</div>' +

    '<div class="plan-section-title" style="margin-top:20px">Plateforme</div>' +
    '<div class="plan-platforms" id="planPlatforms">' +
    buildPlatformButtons() +
    '</div>' +

    '<div id="planDateSelected" style="font-size:12px;color:var(--muted);margin-top:12px;min-height:18px"></div>' +

    '<button class="plan-publish-btn" id="planPublishBtn" onclick="confirmerPublication()" disabled>' +
    '🚀 Publier' +
    '</button>' +

    '</div>' +
    '</div>' +
    '</div>'

  window.planState = {
    date: null,
    heure: '12',
    minute: '00',
    plateformes: [],
    month: currentMonth,
    year: currentYear,
    today: today
  }
}

function buildCalendar(month, year, today) {
  var monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  var dayNames   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
  var firstDay   = new Date(year, month, 1).getDay()
  firstDay = firstDay === 0 ? 6 : firstDay - 1
  var daysInMonth = new Date(year, month + 1, 0).getDate()
  var todayStr = today.toDateString()

  var html =
    '<div class="cal-nav">' +
    '<button class="cal-nav-btn" onclick="changeCalendarMonth(-1)">‹</button>' +
    '<span class="cal-month-label" id="calMonthLabel">' + monthNames[month] + ' ' + year + '</span>' +
    '<button class="cal-nav-btn" onclick="changeCalendarMonth(1)">›</button>' +
    '</div>' +
    '<div class="cal-grid">'

  dayNames.forEach(function(d) {
    html += '<div class="cal-day-name">' + d + '</div>'
  })

  for(var i = 0; i < firstDay; i++) {
    html += '<div></div>'
  }

  for(var day = 1; day <= daysInMonth; day++) {
    var thisDate  = new Date(year, month, day)
    var isPast    = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    var isToday   = thisDate.toDateString() === todayStr
    var cls       = 'cal-day'
    if(isPast)  cls += ' cal-day-past'
    if(isToday) cls += ' cal-day-today'
    var dateStr = year + '-' + (month+1) + '-' + day
    html += '<div class="' + cls + '" ' + (isPast ? '' : 'onclick="selectCalendarDay(this,\'' + dateStr + '\')"') + '>' + day + '</div>'
  }

  html += '</div>'
  return html
}

function buildHours() {
  var html = ''
  for(var h = 0; h < 24; h++) {
    var val = h < 10 ? '0' + h : '' + h
    html += '<option value="' + val + '"' + (h === 12 ? ' selected' : '') + '>' + val + 'h</option>'
  }
  return html
}

function buildMinutes() {
  var html = ''
  var mins = ['00','05','10','15','20','25','30','35','40','45','50','55']
  mins.forEach(function(m) {
    html += '<option value="' + m + '">' + m + '</option>'
  })
  return html
}

function buildPlatformButtons() {
  var reseaux = (window.reseauxLies && window.reseauxLies.length > 0) ? window.reseauxLies : ['tiktok']
  var labels  = { tiktok:'TikTok', instagram:'Instagram', youtube:'YouTube Shorts' }
  var html = ''
  reseaux.forEach(function(r) {
    html += '<button class="plan-platform-btn" data-reseau="' + r + '" onclick="togglePlatform(this)">' + (labels[r] || r) + '</button>'
  })
  return html
}

function changeCalendarMonth(dir) {
  if(!window.planState) return
  window.planState.month += dir
  if(window.planState.month > 11) { window.planState.month = 0;  window.planState.year++ }
  if(window.planState.month < 0)  { window.planState.month = 11; window.planState.year-- }
  var cal = document.getElementById('planCalendar')
  if(cal) cal.innerHTML = buildCalendar(window.planState.month, window.planState.year, window.planState.today)
}

function selectCalendarDay(el, dateStr) {
  document.querySelectorAll('.cal-day').forEach(function(d) { d.classList.remove('cal-day-selected') })
  el.classList.add('cal-day-selected')
  if(window.planState) window.planState.date = dateStr
  var parts = dateStr.split('-')
  var monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  var label = document.getElementById('planDateSelected')
  if(label) label.textContent = '📅 ' + parts[2] + ' ' + monthNames[parseInt(parts[1])-1] + ' ' + parts[0]
  checkPublishReady()
}

function togglePlatform(btn) {
  btn.classList.toggle('plan-platform-btn-active')
  if(!window.planState) return
  var r = btn.dataset.reseau
  var idx = window.planState.plateformes.indexOf(r)
  if(idx > -1) window.planState.plateformes.splice(idx, 1)
  else window.planState.plateformes.push(r)
  checkPublishReady()
}

function checkPublishReady() {
  var btn = document.getElementById('planPublishBtn')
  if(!btn || !window.planState) return
  var ready = window.planState.date && window.planState.plateformes.length > 0
  btn.disabled = !ready
}

function selectCoverFrame()  { showGenAlert('Fonctionnalité disponible après intégration des APIs vidéo.') }
function generateAICover()   { showGenAlert('Fonctionnalité disponible après intégration des APIs IA.') }
function handleCoverUpload(input) {
  if(!input.files || !input.files[0]) return
  var reader = new FileReader()
  reader.onload = function(e) {
    var preview = document.getElementById('planCoverPreview')
    if(preview) preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:10px">'
  }
  reader.readAsDataURL(input.files[0])
}

function retourGeneration() {
  var wrap = document.getElementById('videosGenerationView')
  if(wrap) wrap.innerHTML = ''
  initGenerationView()
}

function confirmerPublication() {
  if(!window.planState || !window.planState.date || window.planState.plateformes.length === 0) return
  var parts      = window.planState.date.split('-')
  var monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  var dateLabel  = parts[2] + ' ' + monthNames[parseInt(parts[1])-1] + ' ' + parts[0]
  var heureLabel = document.getElementById('planHeure').value + 'h' + document.getElementById('planMinute').value
  var platLabels = { tiktok:'TikTok', instagram:'Instagram', youtube:'YouTube Shorts' }
  var platText   = window.planState.plateformes.map(function(p) { return platLabels[p] || p }).join(', ')

  var overlay = document.createElement('div')
  overlay.id  = 'confirmPubPopup'
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.88);backdrop-filter:blur(6px)'

  var box = document.createElement('div')
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(123,97,255,.25);border-radius:24px;padding:36px;max-width:420px;width:100%;text-align:center'

  var icon = document.createElement('div')
  icon.style.cssText = 'font-size:48px;margin-bottom:16px'
  icon.textContent = '🚀'

  var title = document.createElement('h3')
  title.style.cssText = "font-family:'Syne',sans-serif;font-size:19px;font-weight:800;margin-bottom:12px;color:#fff"
  title.textContent = 'Confirmer la publication'

  var msg = document.createElement('p')
  msg.style.cssText = 'font-size:13.5px;color:#6b6b80;line-height:1.75;margin-bottom:24px'
  msg.innerHTML =
    'Ta vidéo sera publiée le <b style="color:#fff">' + dateLabel + '</b> à <b style="color:#fff">' + heureLabel + '</b>' +
    '<br>sur <b style="color:#a08bff">' + platText + '</b>.'

  var btnWrap = document.createElement('div')
  btnWrap.style.cssText = 'display:flex;gap:10px;justify-content:center'

  var btnConfirm = document.createElement('button')
  btnConfirm.style.cssText = 'padding:12px 24px;border-radius:12px;background:#7b61ff;border:none;color:#fff;font-size:13.5px;font-weight:700;cursor:pointer'
  btnConfirm.textContent = '✓ Confirmer'
  btnConfirm.onclick = function() {
    overlay.remove()
    savePublication()
  }

  var btnCancel = document.createElement('button')
  btnCancel.style.cssText = 'padding:12px 24px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#a0a0b0;font-size:13px;font-weight:600;cursor:pointer'
  btnCancel.textContent = 'Retour'
  btnCancel.onclick = function() { overlay.remove() }

  btnWrap.appendChild(btnConfirm)
  btnWrap.appendChild(btnCancel)
  box.appendChild(icon)
  box.appendChild(title)
  box.appendChild(msg)
  box.appendChild(btnWrap)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
}

async function savePublication() {
  if(!currentUser || !window.planState) return
  var heure     = document.getElementById('planHeure').value
  var minute    = document.getElementById('planMinute').value
  var parts     = window.planState.date.split('-')
  var pubDate   = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]), parseInt(heure), parseInt(minute))
  var desc      = document.getElementById('planDescription') ? document.getElementById('planDescription').value : ''
  var hashtags  = document.getElementById('planHashtags')    ? document.getElementById('planHashtags').value    : ''

  for(var i = 0; i < window.planState.plateformes.length; i++) {
    var reseau = window.planState.plateformes[i]
    await zenoDb.from('publications').insert({
      user_id:          currentUser.id,
      influenceur_id:   generationData.influenceur_id,
      reseau:           reseau,
      date_publication: pubDate.toISOString(),
      statut:           'planifie'
    })
    await zenoDb.from('videos').insert({
      user_id:        currentUser.id,
      influenceur_id: generationData.influenceur_id,
      titre:          'Vidéo - ' + generationData.influenceur_nom,
      description:    desc,
      hashtags:       hashtags,
      reseau:         reseau,
      statut:         'en_attente'
    })
  }

  closeGenerationView()
  showPublicationSuccessPopup()
}

function showPublicationSuccessPopup() {
  var overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(6px)'
  var box = document.createElement('div')
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(29,158,117,.25);border-radius:24px;padding:36px;max-width:380px;text-align:center'
  var icon = document.createElement('div')
  icon.style.cssText = 'font-size:48px;margin-bottom:16px'
  icon.textContent = '🎉'
  var title = document.createElement('h3')
  title.style.cssText = "font-family:'Syne',sans-serif;font-size:19px;font-weight:800;margin-bottom:10px;color:#fff"
  title.textContent = 'Vidéo planifiée !'
  var msg = document.createElement('p')
  msg.style.cssText = 'font-size:13px;color:#6b6b80;line-height:1.65;margin-bottom:24px'
  msg.textContent = 'Ta vidéo a été planifiée avec succès. Tu peux la retrouver dans Mes vidéos.'
  var btn = document.createElement('button')
  btn.style.cssText = 'padding:12px 24px;border-radius:12px;background:#1D9E75;border:none;color:#fff;font-size:13.5px;font-weight:700;cursor:pointer'
  btn.textContent = 'Voir mes vidéos'
  btn.onclick = function() { overlay.remove(); showView('videos') }
  box.appendChild(icon)
  box.appendChild(title)
  box.appendChild(msg)
  box.appendChild(btn)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
}

/* ─── SÉLECTEUR DE SCRIPT ─── */
async function openScriptSelector() {
  var plan = window.currentPlanUser || 'starter'

  // Popup upgrade si Starter
  if(plan === 'starter') {
    var overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(6px)'
    var box = document.createElement('div')
    box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(123,97,255,.2);border-radius:24px;padding:36px;max-width:380px;text-align:center'
    var icon = document.createElement('div')
    icon.style.cssText = 'font-size:44px;margin-bottom:16px'
    icon.textContent = '🔒'
    var titleEl = document.createElement('h3')
    titleEl.style.cssText = "font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:10px;color:#fff"
    titleEl.textContent = 'Fonctionnalité Nova'
    var msgEl = document.createElement('p')
    msgEl.style.cssText = 'font-size:13px;color:#6b6b80;line-height:1.65;margin-bottom:24px'
    msgEl.innerHTML = 'La bibliothèque de scripts est disponible à partir du plan <b style="color:#a08bff">Nova</b>.<br><br>Passe au plan Nova pour réutiliser tes scripts.'
    var btnWrap = document.createElement('div')
    btnWrap.style.cssText = 'display:flex;gap:10px;justify-content:center'
    var btnCancel = document.createElement('button')
    btnCancel.style.cssText = 'flex:1;padding:11px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#a0a0b0;font-size:13px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif'
    btnCancel.textContent = 'Fermer'
    btnCancel.onclick = function() { overlay.remove() }
    var btnUpgrade = document.createElement('button')
    btnUpgrade.style.cssText = 'flex:1;padding:11px;border-radius:12px;background:var(--violet);border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif'
    btnUpgrade.textContent = 'Voir les plans'
    btnUpgrade.onclick = function() { overlay.remove(); window.location.href='index.html#tarifs' }
    btnWrap.appendChild(btnCancel)
    btnWrap.appendChild(btnUpgrade)
    box.appendChild(icon)
    box.appendChild(titleEl)
    box.appendChild(msgEl)
    box.appendChild(btnWrap)
    overlay.appendChild(box)
    document.body.appendChild(overlay)
    return
  }

  // Charger les scripts
  const { data: scripts } = await zenoDb
    .from('scripts')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })

  var overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(6px)'

  var box = document.createElement('div')
  box.style.cssText = 'background:#0d0d1f;border:1px solid rgba(123,97,255,.2);border-radius:24px;padding:32px;width:100%;max-width:500px;position:relative;max-height:80vh;display:flex;flex-direction:column'

  var closeBtn = document.createElement('button')
  closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#6b6b80;cursor:pointer;font-size:14px'
  closeBtn.textContent = '✕'
  closeBtn.onclick = function() { overlay.remove() }

  var titleEl = document.createElement('h3')
  titleEl.style.cssText = "font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:6px;color:#fff"
  titleEl.textContent = 'Choisir un script'

  var subEl = document.createElement('p')
  subEl.style.cssText = 'font-size:12.5px;color:#6b6b80;margin-bottom:20px'
  subEl.textContent = 'Sélectionne un script pour l\'insérer dans la description.'

  var listWrap = document.createElement('div')
  listWrap.style.cssText = 'overflow-y:auto;display:flex;flex-direction:column;gap:10px;flex:1'

  if(!scripts || scripts.length === 0) {
    var emptyEl = document.createElement('div')
    emptyEl.style.cssText = 'text-align:center;padding:40px 20px'
    emptyEl.innerHTML = '<div style="font-size:36px;margin-bottom:12px;opacity:.4">📝</div><div style="font-size:14px;color:#6b6b80">Aucun script dans ta bibliothèque.<br>Crée-en un depuis l\'onglet Scripts.</div>'
    listWrap.appendChild(emptyEl)
  } else {
    scripts.forEach(function(s) {
      var card = document.createElement('div')
      card.style.cssText = 'background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px 16px;cursor:pointer;transition:all .2s'
      card.onmouseover = function() { this.style.borderColor='rgba(123,97,255,.4)'; this.style.background='rgba(123,97,255,.06)' }
      card.onmouseout  = function() { this.style.borderColor='rgba(255,255,255,.07)'; this.style.background='rgba(255,255,255,.03)' }

      var cardTitle = document.createElement('div')
      cardTitle.style.cssText = 'font-size:13px;font-weight:700;color:#fff;margin-bottom:6px'
      cardTitle.textContent = s.titre

      var cardPreview = document.createElement('div')
      cardPreview.style.cssText = 'font-size:12px;color:#6b6b80;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'
      cardPreview.textContent = s.contenu

      card.appendChild(cardTitle)
      card.appendChild(cardPreview)
      card.onclick = function() {
        var textarea = document.getElementById('genDescription')
        if(textarea) {
          textarea.value = s.contenu
          updateDescription(s.contenu)
        }
        overlay.remove()
      }
      listWrap.appendChild(card)
    })
  }

  box.appendChild(closeBtn)
  box.appendChild(titleEl)
  box.appendChild(subEl)
  box.appendChild(listWrap)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
  overlay.addEventListener('click', function(e) { if(e.target === overlay) overlay.remove() })
}