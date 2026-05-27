/* ═══════════ SUPABASE ═══════════ */
const SUPABASE_URL = document.querySelector('meta[name="supabase-url"]')?.content
const SUPABASE_KEY = document.querySelector('meta[name="supabase-key"]')?.content
const zenoDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

/* NAV */
function goTo(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
function toggleMenu(){
  var m=document.getElementById('mobileMenu');
  var h=document.getElementById('hamburger');
  m.classList.toggle('open');
  h.textContent=m.classList.contains('open')?'✕':'☰';
}
var navIds=['accueil','about','creations','tarifs'];
var navObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      navIds.forEach(function(id){var l=document.getElementById('nav-'+id);if(l)l.classList.remove('active')});
      var l=document.getElementById('nav-'+e.target.id);if(l)l.classList.add('active');
    }
  });
},{threshold:.25});
navIds.forEach(function(id){var el=document.getElementById(id);if(el)navObs.observe(el)});

/* FILTER CREATIONS */
function filterCards(btn,filter){
  document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');
  document.querySelectorAll('.masonry-item').forEach(function(item){
    var show=filter==='all'||item.dataset.platform===filter;
    item.style.transition='opacity .3s,transform .3s';
    if(show){item.style.opacity='1';item.style.transform='';item.style.display='';}
    else{item.style.opacity='0';item.style.transform='scale(.95)';setTimeout(function(){if(item.style.opacity==='0')item.style.display='none';},300);}
  });
}

/* BILLING TOGGLE */
var isAnnual=false;
function toggleBilling(){
  isAnnual=!isAnnual;
  document.getElementById('billingToggle').classList.toggle('on',isAnnual);
  document.getElementById('lbl-mensuel').className='toggle-label '+(isAnnual?'inactive':'active');
  document.getElementById('lbl-annuel').className='toggle-label '+(isAnnual?'active':'inactive');
  document.getElementById('savingsPill').classList.toggle('show',isAnnual);
  if(isAnnual){
    document.getElementById('nova-price').textContent='250€';
    document.getElementById('nova-period').textContent=' / an';
    document.getElementById('nova-annual').style.opacity='1';
    document.getElementById('nova-annual').textContent='soit 20,8€ / mois';
    document.getElementById('nova-savings').classList.add('show');
    document.getElementById('nova-savings').textContent='✦ Économise 98€ — 3 mois offerts';
    document.getElementById('stellar-price').textContent='990€';
    document.getElementById('stellar-period').textContent=' / an';
    document.getElementById('stellar-annual').style.opacity='1';
    document.getElementById('stellar-annual').textContent='soit 82,5€ / mois';
    document.getElementById('stellar-savings').classList.add('show');
    document.getElementById('stellar-savings').textContent='✦ Économise 210€ — 2 mois offerts';
  } else {
    document.getElementById('nova-price').textContent='29€';
    document.getElementById('nova-period').textContent=' / mois';
    document.getElementById('nova-annual').style.opacity='0';
    document.getElementById('nova-savings').classList.remove('show');
    document.getElementById('stellar-price').textContent='100€';
    document.getElementById('stellar-period').textContent=' / mois';
    document.getElementById('stellar-annual').style.opacity='0';
    document.getElementById('stellar-savings').classList.remove('show');
  }
}

/* FAQ */
function toggleFaq(btn){
  var item=btn.closest('.faq-item');
  var isOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i){i.classList.remove('open')});
  if(!isOpen)item.classList.add('open');
}

/* MODAL */
var planCfg={
  starter:{badge:'Plan Starter — Gratuit ✦',bg:'rgba(29,158,117,.15)',border:'#1D9E75',color:'#1D9E75',label:'Starter (Gratuit)'},
  nova:{badge:'Plan Nova — 29€/mois ✦',bg:'rgba(123,97,255,.15)',border:'#7b61ff',color:'#a08bff',label:'Nova — 29€/mois'},
  stellar:{badge:'Plan Stellar — 100€/mois ✦',bg:'rgba(201,168,76,.15)',border:'#C9A84C',color:'#C9A84C',label:'Stellar — 100€/mois'}
};
var currentPlan='starter';

function openModal(plan){
  currentPlan=plan||'starter';
  var cfg=planCfg[currentPlan];
  document.getElementById('modalPlanBadge').innerHTML='<span style="font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;background:'+cfg.bg+';border:1px solid '+cfg.border+';color:'+cfg.color+';display:inline-block;margin-bottom:20px">'+cfg.badge+'</span>';
  document.getElementById('modalPlanBadge').style.display='block';
  document.getElementById('stepperWrap').style.display='flex';
  showStep('step1');
  updateStepper(1);
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow='';
}
function handleOverlay(e){if(e.target===document.getElementById('modalOverlay'))closeModal();}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});

function showStep(id){
  document.querySelectorAll('.modal-step').forEach(function(s){s.classList.remove('active')});
  document.getElementById(id).classList.add('active');
}

function updateStepper(step){
  var circles=['sc1','sc2','sc3'];
  var labels=['sl1','sl2','sl3'];
  var lines=['line1','line2'];
  for(var i=0;i<3;i++){
    var c=document.getElementById(circles[i]);
    var l=document.getElementById(labels[i]);
    if(i+1<step){c.className='stepper-circle done';c.textContent='✓';l.className='stepper-label';}
    else if(i+1===step){c.className='stepper-circle active';c.textContent=i+1;l.className='stepper-label active-lbl';}
    else{c.className='stepper-circle pending';c.textContent=i+1;l.className='stepper-label';}
  }
  lines.forEach(function(lid,idx){
    document.getElementById(lid).classList.toggle('done-line',idx+1<step);
  });
}

function val(id,errId,testFn){
  var v=document.getElementById(id)?document.getElementById(id).value:'';
  var ok=testFn(v);
  var el=document.getElementById(id);
  var err=document.getElementById(errId);
  if(el)el.classList.toggle('err',!ok);
  if(err)err.classList.toggle('show',!ok);
  return ok;
}

function nextStep(from){
  if(from===1){
    var okE=val('f-email','err-email',function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);});
    var okP=val('f-pwd','err-pwd',function(v){return v.length>=8;});
    if(!okE||!okP)return;
    showStep('step2');updateStepper(2);
  } else if(from===2){
    var okN=val('f-name','err-name',function(v){return v.trim().length>0;});
    var okU=val('f-usage','err-usage',function(v){return v!=='';});
    if(!okN||!okU)return;
    document.getElementById('recap-email').textContent=document.getElementById('f-email').value;
    document.getElementById('recap-name').textContent=document.getElementById('f-name').value;
    var cfg=planCfg[currentPlan];
    document.getElementById('recap-plan').textContent=cfg.label;
    document.getElementById('recap-plan').style.color=cfg.color;
    showStep('step3');updateStepper(3);
  }
}

function goBack(from){
  if(from===2){showStep('step1');updateStepper(1);}
  else if(from===3){showStep('step2');updateStepper(2);}
}

async function submitRegister(){
  var cgu = document.getElementById('f-cgu').checked
  document.getElementById('err-cgu').classList.toggle('show', !cgu)
  if(!cgu) return

  const email  = document.getElementById('f-email').value
  const pwd    = document.getElementById('f-pwd').value
  const prenom = document.getElementById('f-name').value
  const usage  = document.getElementById('f-usage').value
  const reseau = document.getElementById('f-network').value

  const { data, error } = await zenoDb.auth.signUp({
    email: email,
    password: pwd,
    options: {
      data: {
        prenom: prenom,
        plan: currentPlan,
        usage: usage,
        reseau: reseau
      }
    }
  })

  if(error){
    alert('Erreur : ' + error.message)
    return
  }

  await zenoDb.from('users').insert({
    email:  email,
    prenom: prenom,
    plan:   currentPlan,
    usage:  usage,
    reseau: reseau
  })

  document.getElementById('stepperWrap').style.display = 'none'
  document.getElementById('modalPlanBadge').style.display = 'none'
  showStep('stepSuccess')
}

function switchToLogin(){
  document.getElementById('modalPlanBadge').style.display='none';
  document.getElementById('stepperWrap').style.display='none';
  showStep('stepLogin');
}
function switchToRegister(){
  document.getElementById('modalPlanBadge').style.display='block';
  document.getElementById('stepperWrap').style.display='flex';
  showStep('step1');updateStepper(1);
}
function submitLogin(){
  var okE=val('l-email','err-lemail',function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);});
  var okP=val('l-pwd','err-lpwd',function(v){return v.length>0;});
  if(!okE||!okP)return;
  document.getElementById('stepperWrap').style.display='none';
  document.getElementById('modalPlanBadge').style.display='none';
  showStep('stepSuccess');
}

/* PASSWORD STRENGTH */
function checkPwd(v){
  var segs=[document.getElementById('seg1'),document.getElementById('seg2'),document.getElementById('seg3'),document.getElementById('seg4')];
  var lbl=document.getElementById('pwdLabel');
  segs.forEach(function(s){s.style.background='rgba(255,255,255,.08)';});
  var strength=0;
  if(v.length>=8)strength++;
  if(v.length>=12)strength++;
  if(/[A-Z]/.test(v)&&/[0-9]/.test(v))strength++;
  if(/[^A-Za-z0-9]/.test(v))strength++;
  var colors=['#ef4444','#f97316','#eab308','#1D9E75'];
  var labels=['Trop court','Faible','Moyen','Fort','Excellent'];
  for(var i=0;i<strength;i++)segs[i].style.background=colors[Math.min(strength-1,3)];
  lbl.textContent=v.length===0?'Saisis un mot de passe':labels[strength];
  lbl.style.color=v.length===0?'var(--muted)':colors[Math.min(strength-1,3)];
}
function togglePwd(){var i=document.getElementById('f-pwd');i.type=i.type==='password'?'text':'password';}
function togglePwdL(){var i=document.getElementById('l-pwd');i.type=i.type==='password'?'text':'password';}
