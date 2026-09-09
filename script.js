const REMOTE_DB = "https://raw.githubusercontent.com/0xMe/ItemID2/main/assets/itemData.json";
const REMOTE_PNGS = "https://raw.githubusercontent.com/0xme/ff-resources/main/pngs/300x300/";
const FALLBACK_CDN = id => `https://cdn.jsdelivr.net/gh/ShahGCreator/icon@main/PNG/${id}.png`;

let ALL_ITEMS = [];
let activeCat = "emote";
let renderTimer = null;
const q = document.getElementById("q");
const grid = document.getElementById("grid");
const count = document.getElementById("count");
const title = document.getElementById("title");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const modal = document.getElementById("modal");
const big = document.getElementById("bigImg");

const TITLES = { emote:"Emotes", weapon:"Weapon Skins", outfit:"Outfit" };

// Exactly 3 tabs. Head/face items and every kind of crate/box are excluded.
const BLOCKED = /\b(crate|crates|chest|box|boxes|supply|airdrop|loot|pack|gear.?set|emote.?essentials|special.?airdrop|7d.?gear|token|currency|diamond|profile|banner|loading|guild|rank|badge|wallpaper|voice|resource|none|unknown|pass|coupon|voucher|fragment|bundle.?crate|emote.?crate)\b/i;
const HEAD_ONLY = /\b(head|helmet|hat|cap|mask|face|hair|haircut|headgear|headwear|portrait|beard|mustache)\b|icon_.*(head|face|mask|hair|helmet|hat)/i;
const MELEE = /machete|katana|sword|blade|knife|pan|baseball.?bat|scythe|parang|saber|melee|tonfa|fist|bat/i;
const WEAPON_WORDS = /ak47|ak-47|an94|m4a1|m14|m1014|mp40|mp5|ump|vector|p90|scar|groza|thompson|xm8|famas|g36|mac10|mag7|m1887|m1873|desert.?eagle|usp|g18|pistol|shotgun|smg|rifle|sks|svd|awm|kar98|treatment.?gun|crossbow|bow|grenade|launcher|weapon.?skin/i;
const OUTFIT_WORDS = /outfit|clothing|cloth|jacket|shirt|top|pants|trouser|jeans|skirt|shoes|sneaker|dress|costume|uniform|hoodie|vest|coat|shorts|sock|boot|glove|suit|wear|bundle/i;
const EMOTE_WORDS = /emote|gesture|dance|action|animation|anim_|icon_.*emote/i;

// Evo/upgrade-gun entries that are commonly used by Craftland Evo-emote
// scripts. They are kept as weapon IDs in the Weapon Skins tab and are also
// exposed as Emote aliases, because the user wants the upgrade/emote action
// entries searchable from the Emotes tab too.
const EVO_EMOTE_ALIASES = {
  "907192407":"AK Max / Evo Emote",
  "907193307":"MP5 Max / Evo Emote",
  "907194208":"MP40 Max / Evo Emote",
  "907194108":"M1014 2.0 / Evo Emote",
  "907193907":"Thompson Max / Evo Emote",
  "907193517":"AN94 Max / Evo Emote",
  "907193107":"M4A1 Max / Evo Emote",
  "907193507":"M1887 Max / Evo Emote",
  "907193007":"UMP Max / Evo Emote",
  "907192907":"FAMAS Max / Evo Emote",
  "907192807":"XM8 Max / Evo Emote",
  "907192707":"M1014 Draco / Evo Emote",
  "907192607":"MP40 Cobra / Evo Emote",
  "907192507":"SCAR Megalodon / Evo Emote"
};

// Real bundle records from the community's Craftland bundle-ID lists.
// These are actual bundle IDs (710...) rather than invented IDs.
const BUNDLE_RECORDS = [
  ["710000075","FF Band Male Bundle","Icon_GarenaStarMalePackage"],
  ["710000014","Survival Bundle","Icon_SurvivalPackage"],
  ["710000015","Cool Colored Bundle","Icon_CoolColoredPackage"],
  ["710000017","Racer Girl Bundle","FF_Icon_sc_racergirlPackage"],
  ["710000019","Cowboy Male Bundle","Icon_Male_CowboyPackage"],
  ["710000020","Cowboy Female Bundle","Icon_Female_CowboyPackage"],
  ["710000021","JK Male Bundle","Icon_Male_JKPackage"],
  ["710000354","Male Armor Jacket Bundle","Icon_male_armorjacket"],
  ["710000355","Male Electricity Bundle","Icon_male_electricity"],
  ["710000356","Female Fire Bundle","Icon_female_fire"],
  ["710000357","Male Lego Bundle","Icon_male_lego"],
  ["710000358","Male Guyver Bundle","Icon_male_guyver"],
  ["710000359","Female Guyver Bundle","Icon_female_guyver"],
  ["710000360","Female Llenn Bundle","Icon_female_llenn"],
  ["710034040","Rampage4 Fire Male Bundle","Icon_bundle_male_rampage4_fire_34"],
  ["710034041","Rampage4 Fire Purple Male Bundle","Icon_bundle_male_rampage4_fire_purple_34"],
  ["710034042","Rampage4 Fire Yellow Male Bundle","Icon_bundle_male_rampage4_fire_yellow_34"],
  ["710034043","Rampage4 Fire Blue Male Bundle","Icon_bundle_male_rampage4_fire_blue_34"],
  ["710035030","Gold Chain Male Bundle","Icon_bundle_male_goldchain_35"],
  ["710035031","Gold Chain Female Bundle","Icon_bundle_female_goldchain_35"],
  ["710035032","Riders Male Bundle","Icon_bundle_male_riders_35"],
  ["710035033","Riders Female Bundle","Icon_bundle_female_riders_35"],
  ["710035034","Pirates Male Bundle","Icon_bundle_male_pirates_35"],
  ["710035035","Pirates Female Bundle","Icon_bundle_female_pirates_35"],
  ["710035036","Sportswear Male Bundle","Icon_bundle_sportswear_me_35"],
  ["710035037","Urbanwear Male Bundle","Icon_bundle_male_urbanwear_br_35"],
  ["710035038","Urbanwear Female Bundle","Icon_bundle_female_urbanwear_br_35"],
  ["710035039","Military Uniform Male Bundle","Icon_bundle_male_militaryuniform_35"],
  ["710035040","City Hunter Female Bundle","Icon_bundle_female_cityhunter_35"],
  ["710040004","Artificial Basic Female Bundle","Icon_bundle_female_Artificial_Basic_40"],
  ["710040005","Artificial Blue Female Bundle","Icon_bundle_female_Artificial_Blue_40"],
  ["710040006","Artificial Female Bundle","Icon_bundle_female_Artificial_40"],
  ["710040009","Artificial Male Bundle","Icon_bundle_male_Artificial_40"],
  ["710040010","Trap Hip Hop Female Bundle","Icon_bundle_female_Traphiphop22_40"],
  ["710040011","Rebellion Female Bundle","Icon_bundle_female_Rebellion_40"],
  ["710040012","K-Wave Female Bundle","Icon_bundle_female_Kwave_40"],
  ["710040013","Cowboy22 Male Bundle","Icon_bundle_male_Cowboy22_40"],
  ["710040014","Royal22 Female Bundle","Icon_bundle_female_Royal22_40"],
  ["710040015","Dark Ghost Male Bundle","Icon_bundle_male_Darkghost_40"],
  ["710040016","Dark Ghost Female Bundle","Icon_bundle_female_Darkghost_40"],
  ["710040017","Fashionist2 Male Bundle","Icon_bundle_male_Fashionist2_40"]
];

function classify(x){
  const id=String(x.id);
  const text=`${x.name} ${x.icon} ${x.type} ${x.rare} ${x.collectionType||''}`.toLowerCase();
  const icon=String(x.icon||'').toLowerCase();

  // IMPORTANT: Outfit IDs are a dedicated 203/204/205 family in the
  // Craftland/community lists. Check this family before generic filters,
  // because metadata such as collectionType can contain unrelated labels.
  if(/^(203|204|205)\d{6}$/.test(id)){
    // Only remove obvious head/face-only wearable pieces. Do NOT reject
    // normal clothing just because a remote metadata field says "head".
    const headIcon=/icon_.*(head|face|mask|hair|helmet|hat|cap|beard|mustache)/i.test(icon);
    const headName=/\b(head|helmet|hat|cap|mask|face|hair|haircut|headgear|headwear|portrait|beard|mustache)\b/i.test(String(x.name||''));
    if(headIcon || headName) return null;
    // Never allow crates/boxes/packs/etc. into Outfit.
    if(/\b(crate|crates|chest|box|boxes|supply|airdrop|loot|bundle.?crate|emote.?crate)\b/i.test(text)) return null;
    return 'outfit';
  }

  // Generic non-playable/box-like assets for the other categories.
  if(BLOCKED.test(text) || HEAD_ONLY.test(text) || /^(none|unknown)$/i.test(String(x.name).trim())) return null;

  // Free Fire Craftland weapon-skin IDs are in the 907... family.
  if(/^907\d{6}$/.test(id)){
    if(MELEE.test(text)) return null;
    if(WEAPON_WORDS.test(text) || /weapon|gun|firearm|icon_/.test(text)) return 'weapon';
    return null;
  }

  // Emotes/animation assets use the 909... ID family.
  if(/^909\d{6}$/.test(id)){
    return 'emote';
  }

  // Some full wearable bundles have separate IDs. Keep them in Outfit only
  // when the metadata clearly says bundle/outfit/clothing, never a box/crate.
  const ct=String(x.collectionType||'').toLowerCase();
  if((/bundle|outfit|clothing|avatar/.test(ct) || /\bbundle\b/i.test(text)) && OUTFIT_WORDS.test(text) && !BLOCKED.test(text)) return 'outfit';

  return null;
}
function normalize(data){
  const base=flattenRecords(data);
  const classified=base.map(x=>({...x, category:classify(x)})).filter(x=>x.category);
  const byId=new Set(classified.map(x=>x.id));

  // Add verified bundle IDs even when the large remote database does not
  // expose them in its current metadata snapshot.
  for(const [id,name,icon] of BUNDLE_RECORDS){
    if(!byId.has(id)){
      classified.push({id,name,icon,type:"Bundle",rare:"",collectionType:"Bundle",category:"outfit",raw:null});
      byId.add(id);
    }
  }

  // Duplicate only the verified Evo-gun entries into Emotes as aliases.
  // The original weapon entry remains available in Weapon Skins.
  const aliases=[];
  for(const x of classified){
    if(x.category!=="weapon" || !EVO_EMOTE_ALIASES[x.id]) continue;
    aliases.push({...x, category:"emote", name:EVO_EMOTE_ALIASES[x.id], type:"Evo Emote"});
  }
  return classified.concat(aliases);
}

function flattenRecords(data){
  const out=[];
  const seen=new WeakSet();
  function walk(node, keyHint=""){
    if(!node || typeof node!=="object") return;
    if(seen.has(node)) return; seen.add(node);
    if(Array.isArray(node)){ node.forEach(x=>walk(x,keyHint)); return; }
    const id = node.itemID ?? node.id ?? node.ID ?? node.itemId ?? node.item_id ?? (/^\d+$/.test(keyHint)?keyHint:null);
    const icon = node.icon ?? node.Icon ?? node.iconName ?? node.image ?? "";
    const name = node.description ?? node.name ?? node.Name ?? node.itemName ?? node.title ?? keyHint ?? "Unknown Item";
    if(id!==undefined && id!==null && /^\d+$/.test(String(id))){
      out.push({
        id:String(id), name:String(name), icon:String(icon),
        type:String(node.itemType ?? node.type ?? node.category ?? node.Category ?? ""),
        rare:String(node.Rare ?? node.rarity ?? ""), collectionType:String(node.collectionType ?? node.collection ?? ""), raw:node
      });
    }
    Object.entries(node).forEach(([k,v])=>{
      if(k!=="raw") walk(v, /^\d+$/.test(k)?k:keyHint);
    });
  }
  walk(data);
  const unique=new Map();
  for(const x of out) if(!unique.has(x.id)) unique.set(x.id,x);
  return [...unique.values()];
}

function imgUrl(x){
  if(x.icon && x.icon !== "undefined" && x.icon !== "null") return REMOTE_PNGS + encodeURIComponent(x.icon) + ".png";
  return FALLBACK_CDN(x.id);
}

function fallbackImg(img,x){
  if(img.dataset.fallback) return;
  img.dataset.fallback="1"; img.src=FALLBACK_CDN(x.id);
  img.onerror=()=>{img.removeAttribute("src");};
}

function currentItems(){
  const term=q.value.trim().toLowerCase();
  return ALL_ITEMS.filter(x=>{
    const catOk=x.category===activeCat;
    if(!catOk) return false;
    if(!term) return true;
    return `${x.name} ${x.id} ${x.icon} ${x.type}`.toLowerCase().includes(term);
  });
}

function render(){
  const items=currentItems();
  count.textContent=items.length.toLocaleString("en-IN");
  title.textContent=TITLES[activeCat] || "Emotes";
  grid.innerHTML="";
  empty.hidden=items.length!==0;
  const frag=document.createDocumentFragment();
  // Keep the DOM light even with 10K+ records; render the first 240 and add more as the user scrolls.
  const slice=items.slice(0,240);
  for(const x of slice){
    const c=document.createElement("button"); c.className="card";
    c.innerHTML=`<div class="pic"><img loading="lazy" alt=""></div><div class="name"></div>`;
    c.querySelector(".name").textContent=x.name;
    const im=c.querySelector("img"); im.src=imgUrl(x); im.onerror=()=>fallbackImg(im,x);
    c.onclick=()=>openItem(x); frag.appendChild(c);
  }
  grid.appendChild(frag);
  if(items.length>240){
    const more=document.createElement("div"); more.className="more"; more.textContent=`Showing 240 of ${items.length.toLocaleString("en-IN")} — use Search to find any ID`; grid.appendChild(more);
  }
}

function openItem(x){
  modal.hidden=false; document.body.style.overflow="hidden";
  big.style.display=""; big.src=imgUrl(x); big.onerror=()=>fallbackImg(big,x);
  document.getElementById("mName").textContent=x.name;
  document.getElementById("mId").textContent=x.id;
  document.getElementById("mIcon").textContent=x.icon || "Not provided";
  document.getElementById("mCat").textContent=TITLES[x.category] || x.category;
  document.getElementById("copy").onclick=async()=>{
    try{await navigator.clipboard.writeText(x.id)}catch{const t=document.createElement("textarea");t.value=x.id;document.body.append(t);t.select();document.execCommand("copy");t.remove()}
    document.getElementById("copy").textContent="COPIED ✓"; setTimeout(()=>document.getElementById("copy").textContent="COPY ID",900);
  };
}
function close(){modal.hidden=true;document.body.style.overflow=""}

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active")); b.classList.add("active"); activeCat=b.dataset.cat; render();
});
q.oninput=()=>{document.getElementById("clear").style.display=q.value?"block":"none"; clearTimeout(renderTimer); renderTimer=setTimeout(render,80)};
document.getElementById("clear").onclick=()=>{q.value="";document.getElementById("clear").style.display="none";render()};
document.getElementById("close").onclick=close; document.getElementById("closeShade").onclick=close;

async function load(){
  try{
    const res=await fetch(REMOTE_DB,{cache:"no-store"});
    if(!res.ok) throw new Error("Database request failed");
    const data=await res.json();
    ALL_ITEMS=normalize(data);
  }catch(err){
    console.warn(err);
    // Keep a local fallback so the site never opens with a blank/0-item page.
    try{const r=await fetch("data.json"); const d=await r.json(); ALL_ITEMS=normalize(d);}
    catch{ALL_ITEMS=[]}
  }
  loading.hidden=true; render();
}
load();
