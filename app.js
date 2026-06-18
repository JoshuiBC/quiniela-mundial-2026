const SUPABASE_URL = "https://djrntoiunpgcurwvyazk.supabase.co";
const SUPABASE_KEY = "sb_publishable_J57IuliY3QIvfiS7mmBDjQ_A8SmNpYJ";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let usuario = null;

const hoy = new Date();

const fechaHoy =
  hoy.getFullYear() + "-" +
  String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
  String(hoy.getDate()).padStart(2, "0");

document.getElementById("fecha").value = fechaHoy;

function formatearFechaLocal(fecha){
  return fecha.getFullYear() + "-" +
    String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
    String(fecha.getDate()).padStart(2, "0");
}

function crearFechaLocal(valor){
  const partes = String(valor || "").split("-");

  if(partes.length !== 3){
    return new Date();
  }

  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function cambiarFecha(dias){
  const input = document.getElementById("fecha");
  const fecha = crearFechaLocal(input.value || fechaHoy);

  fecha.setDate(fecha.getDate() + dias);
  input.value = formatearFechaLocal(fecha);

  cargarTodo();
}

function mostrarVista(nombre){
  document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));
  document.getElementById("vista-" + nombre).classList.add("activa");

  if(nombre === "estadisticas") cargarRanking();
  if(nombre === "admin") cargarPartidos();
}

function mostrarBotonCerrarSesion(){
  document.getElementById("btnCerrarSesion").style.display = "inline-block";
}

function ocultarBotonCerrarSesion(){
  document.getElementById("btnCerrarSesion").style.display = "none";
}

function cerrarSesion(){
  usuario = null;

  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("pinUsuario");

  document.getElementById("nombreUsuario").value = "";
  document.getElementById("pinUsuario").value = "";
  document.getElementById("usuarioActivo").innerText = "Ingrese su nombre y PIN.";
  document.getElementById("btnAdmin").style.display = "none";

  ocultarBotonCerrarSesion();
  mostrarVista("inicio");
  cargarTodo();
}

async function entrar(){
  const nombre = document.getElementById("nombreUsuario").value.trim();
  const pin = document.getElementById("pinUsuario").value.trim();

  if(!nombre || !pin){
    alert("Ingrese nombre y PIN.");
    return;
  }

  let {data,error} = await db
    .from("usuarios")
    .select("*")
    .eq("nombre", nombre)
    .maybeSingle();

  if(!data){
    const nuevo = await db
      .from("usuarios")
      .insert({nombre, pin, rol:"usuario"})
      .select()
      .single();

    data = nuevo.data;
    error = nuevo.error;
  }else if(data.pin !== pin){
    alert("PIN incorrecto.");
    return;
  }

  if(error){
    alert("Error: " + error.message);
    return;
  }

  usuario = data;

  localStorage.setItem("nombreUsuario", nombre);
  localStorage.setItem("pinUsuario", pin);

  document.getElementById("usuarioActivo").innerText =
    "Usuario activo: " + usuario.nombre;

  mostrarBotonCerrarSesion();

  document.getElementById("btnAdmin").style.display =
    usuario.rol === "admin" ? "block" : "none";

  mostrarVista("pronosticos");
  cargarTodo();
}

function normalizarFecha(valor){
  if(!valor) return null;

  if(/^\d{4}-\d{2}-\d{2}/.test(valor)){
    return valor.slice(0,10);
  }

  if(valor.includes("/")){
    const partes = valor.split(" ")[0].split("/");
    if(partes.length === 3){
      let mes = partes[0];
      let dia = partes[1];
      let anio = partes[2];
      return `${anio}-${mes.padStart(2,"0")}-${dia.padStart(2,"0")}`;
    }
  }

  const f = new Date(valor);
  if(!isNaN(f)) return f.toISOString().slice(0,10);

  return null;
}

function obtenerCampo(obj, opciones){
  for(const k of opciones){
    if(obj[k] !== undefined && obj[k] !== null && obj[k] !== ""){
      return obj[k];
    }
  }
  return null;
}

const CODIGOS_PAISES = {
  alg: "DZ",
  algeria: "DZ",
  argelia: "DZ",
  arg: "AR",
  argentina: "AR",
  aus: "AU",
  australia: "AU",
  aut: "AT",
  austria: "AT",
  bel: "BE",
  belgium: "BE",
  belgica: "BE",
  bih: "BA",
  "bosnia and herzegovina": "BA",
  bosnia: "BA",
  "bosnia y herzegovina": "BA",
  bol: "BO",
  bolivia: "BO",
  bra: "BR",
  brazil: "BR",
  brasil: "BR",
  can: "CA",
  canada: "CA",
  cpv: "CV",
  "cape verde": "CV",
  "cabo verde": "CV",
  civ: "CI",
  "cote d'ivoire": "CI",
  "ivory coast": "CI",
  "costa de marfil": "CI",
  col: "CO",
  colombia: "CO",
  crc: "CR",
  "costa rica": "CR",
  cro: "HR",
  croatia: "HR",
  croacia: "HR",
  cur: "CW",
  curacao: "CW",
  cze: "CZ",
  czechia: "CZ",
  "czech republic": "CZ",
  "republica checa": "CZ",
  cod: "CD",
  "congo dr": "CD",
  "congo, dr": "CD",
  "dr congo": "CD",
  "democratic republic congo": "CD",
  "democratic republic of the congo": "CD",
  "republica democratica del congo": "CD",
  den: "DK",
  denmark: "DK",
  dinamarca: "DK",
  ecu: "EC",
  ecuador: "EC",
  egy: "EG",
  egypt: "EG",
  egipto: "EG",
  eng: "GB-ENG",
  england: "GB-ENG",
  inglaterra: "GB-ENG",
  fra: "FR",
  france: "FR",
  francia: "FR",
  ger: "DE",
  germany: "DE",
  alemania: "DE",
  gha: "GH",
  ghana: "GH",
  hai: "HT",
  haiti: "HT",
  hon: "HN",
  honduras: "HN",
  irn: "IR",
  iran: "IR",
  "ir iran": "IR",
  irq: "IQ",
  iraq: "IQ",
  irak: "IQ",
  jpn: "JP",
  japan: "JP",
  japon: "JP",
  jor: "JO",
  jordan: "JO",
  jordania: "JO",
  kor: "KR",
  "south korea": "KR",
  "korea republic": "KR",
  "republic of korea": "KR",
  "corea del sur": "KR",
  mar: "MA",
  morocco: "MA",
  marruecos: "MA",
  mex: "MX",
  mexico: "MX",
  ned: "NL",
  netherlands: "NL",
  "paises bajos": "NL",
  nga: "NG",
  nigeria: "NG",
  nor: "NO",
  norway: "NO",
  noruega: "NO",
  nzl: "NZ",
  "new zealand": "NZ",
  "nueva zelanda": "NZ",
  pan: "PA",
  panama: "PA",
  par: "PY",
  paraguay: "PY",
  per: "PE",
  peru: "PE",
  por: "PT",
  portugal: "PT",
  qat: "QA",
  qatar: "QA",
  ksa: "SA",
  "saudi arabia": "SA",
  "arabia saudita": "SA",
  sen: "SN",
  senegal: "SN",
  srb: "RS",
  serbia: "RS",
  swe: "SE",
  sweden: "SE",
  suecia: "SE",
  rsa: "ZA",
  "south africa": "ZA",
  sudafrica: "ZA",
  sco: "GB-SCT",
  scotland: "GB-SCT",
  escocia: "GB-SCT",
  esp: "ES",
  spain: "ES",
  espana: "ES",
  sui: "CH",
  switzerland: "CH",
  suiza: "CH",
  tun: "TN",
  tunisia: "TN",
  tunez: "TN",
  tur: "TR",
  turkey: "TR",
  turkiye: "TR",
  turquia: "TR",
  uae: "AE",
  "united arab emirates": "AE",
  "emiratos arabes unidos": "AE",
  ukr: "UA",
  ukraine: "UA",
  ucrania: "UA",
  uru: "UY",
  uruguay: "UY",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  "estados unidos": "US",
  uzb: "UZ",
  uzbekistan: "UZ"
};

const SIGLAS_PAISES = {
  AE: "UAE",
  AR: "ARG",
  AT: "AUT",
  AU: "AUS",
  BA: "BIH",
  BE: "BEL",
  BO: "BOL",
  BR: "BRA",
  CA: "CAN",
  CD: "COD",
  CH: "SUI",
  CI: "CIV",
  CO: "COL",
  CR: "CRC",
  CV: "CPV",
  CW: "CUR",
  CZ: "CZE",
  DE: "GER",
  DK: "DEN",
  DZ: "ALG",
  EC: "ECU",
  EG: "EGY",
  ES: "ESP",
  FR: "FRA",
  "GB-ENG": "ENG",
  "GB-SCT": "SCO",
  GH: "GHA",
  HN: "HON",
  HR: "CRO",
  HT: "HAI",
  IQ: "IRQ",
  IR: "IRN",
  JO: "JOR",
  JP: "JPN",
  KR: "KOR",
  MA: "MAR",
  MX: "MEX",
  NG: "NGA",
  NL: "NED",
  NO: "NOR",
  NZ: "NZL",
  PA: "PAN",
  PE: "PER",
  PT: "POR",
  PY: "PAR",
  QA: "QAT",
  RS: "SRB",
  SA: "KSA",
  SE: "SWE",
  SN: "SEN",
  TN: "TUN",
  TR: "TUR",
  UA: "UKR",
  US: "USA",
  UY: "URU",
  UZ: "UZB",
  ZA: "RSA"
};

function normalizarNombreEquipo(nombre){
  return String(nombre || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ");
}

function obtenerCodigoPais(nombre){
  const nombreNormalizado = normalizarNombreEquipo(nombre);
  return CODIGOS_PAISES[nombreNormalizado] || "";
}

function obtenerSiglaPais(codigo){
  return SIGLAS_PAISES[codigo] || codigo;
}

function mostrarEquipo(nombre){
  const codigo = obtenerCodigoPais(nombre);
  const texto = nombre || "Equipo por definir";

  if(!codigo){
    return '<span class="team-name">' + texto + '</span>';
  }

  const codigoImg = codigo.toLowerCase();
  const sigla = obtenerSiglaPais(codigo);

  return '<span class="team-name">' +
    '<img class="team-flag" src="https://flagcdn.com/w40/' + codigoImg + '.png" alt="Bandera de ' + texto + '" loading="lazy">' +
    '<span class="team-code" title="' + texto + '">' + sigla + '</span>' +
    '</span>';
}

function mostrarPartido(equipoA, equipoB){
  return '<span class="match-teams">' +
    mostrarEquipo(equipoA) +
    '<span class="match-vs">vs</span>' +
    mostrarEquipo(equipoB) +
    '</span>';
}

async function importarPartidosAPI(){
  if(!usuario || usuario.rol !== "admin"){
    alert("Solo el administrador puede importar partidos.");
    return;
  }

  try{
    const resp = await fetch("https://worldcup26.ir/get/games", {
      method: "GET",
      headers: {"Accept": "application/json"}
    });

    if(!resp.ok){
      throw new Error("HTTP " + resp.status);
    }

    const json = await resp.json();
    const juegos = Array.isArray(json)
      ? json
      : (json.games || json.data || json.response || []);

    if(!juegos.length){
      console.log(json);
      alert("La API respondió, pero no encontré partidos.");
      return;
    }

    let importados = 0;
    let ignorados = 0;

    for(const g of juegos){
      const id = String(obtenerCampo(g, ["id","game_id","match_id","_id"]));
      const fechaRaw = obtenerCampo(g, ["local_date","date","match_date","datetime","utc_date"]);
      const fecha = normalizarFecha(fechaRaw);

      const equipoA =
        obtenerCampo(g, ["home_team_name_en","home_team","home","team_a","home_team_label"]) ||
        "Equipo por definir";

      const equipoB =
        obtenerCampo(g, ["away_team_name_en","away_team","away","team_b","away_team_label"]) ||
        "Equipo por definir";

      const marcadorA = obtenerCampo(g, ["home_score","home_goals","score_home","goals_home"]);
      const marcadorB = obtenerCampo(g, ["away_score","away_goals","score_away","goals_away"]);

      const finalizadoRaw = obtenerCampo(g, ["finished","is_finished","status","match_status"]);
      const cerrado =
        finalizadoRaw === true ||
        finalizadoRaw === "TRUE" ||
        finalizadoRaw === "true" ||
        finalizadoRaw === "finished" ||
        finalizadoRaw === "FT";

      if(!id || !fecha) continue;

      const { data: existente } = await db
        .from("partidos")
        .select("cerrado")
        .eq("id", id)
        .maybeSingle();

      if(existente?.cerrado){
        ignorados++;
        continue;
      }

      await db.from("partidos").upsert({
        id,
        fecha,
        equipo_a: equipoA,
        equipo_b: equipoB,
        goles_a: marcadorA === null ? null : Number(marcadorA),
        goles_b: marcadorB === null ? null : Number(marcadorB),
        cerrado
      }, {onConflict:"id"});

      if(cerrado){
        await calcularPuntos(id);
      }

      importados++;
    }

    alert("Partidos actualizados: " + importados + ". Cerrados ignorados: " + ignorados + ".");
    cargarTodo();

  }catch(e){
    console.error(e);
    alert("No se pudo conectar con la API. Revise la consola.");
  }
}

async function cargarTodo(){
  await cargarPartidos();
  await cargarRanking();
}

async function cargarPartidos(){
  const fecha = document.getElementById("fecha").value.trim();

  const {data:partidos,error} = await db
    .from("partidos")
    .select("*")
    .eq("fecha", fecha)
    .order("id", {ascending:true});

  const contenedor = document.getElementById("partidos");
  const admin = document.getElementById("adminResultados");

  contenedor.innerHTML = "";
  admin.innerHTML = "";

  if(error){
    contenedor.innerHTML = "Error al cargar partidos.";
    return;
  }

  if(!partidos || partidos.length === 0){
    contenedor.innerHTML = "No hay partidos para esta fecha.";
    admin.innerHTML = "No hay partidos para esta fecha.";
    return;
  }

  for(const p of partidos){
    let pronostico = null;

    if(usuario){
      const res = await db
        .from("pronosticos")
        .select("*")
        .eq("usuario_id", usuario.id)
        .eq("partido_id", p.id)
        .maybeSingle();

      pronostico = res.data;
    }

    if(pronostico){
      contenedor.innerHTML += `
        <div class="match">
          <div class="match-title">${mostrarPartido(p.equipo_a, p.equipo_b)}</div>
          <div class="notice">
            Resultado oficial:
            ${p.goles_a === null ? "Pendiente" : p.goles_a + " - " + p.goles_b}
          </div>
          <div class="notice locked">
            Pronóstico registrado: ${pronostico.goles_a} - ${pronostico.goles_b}.
            No se puede modificar.
          </div>
        </div>
      `;
    }else{
      contenedor.innerHTML += `
        <div class="match">
          <div class="match-title">${mostrarPartido(p.equipo_a, p.equipo_b)}</div>
          <div class="notice">
            Resultado oficial:
            ${p.goles_a === null ? "Pendiente" : p.goles_a + " - " + p.goles_b}
          </div>
          <div class="score">
            <div>Su pronóstico</div>
            <input id="pa_${p.id}" type="number" min="0">
            <input id="pb_${p.id}" type="number" min="0">
            <button onclick="guardarPronostico('${p.id}', ${p.cerrado})">Guardar</button>
          </div>
        </div>
      `;
    }

    admin.innerHTML += `
      <div class="match">
        <div class="match-title">${mostrarPartido(p.equipo_a, p.equipo_b)}</div>
        <div class="score">
          <div>Resultado oficial</div>
          <input id="ra_${p.id}" type="number" min="0" value="${p.goles_a ?? ""}">
          <input id="rb_${p.id}" type="number" min="0" value="${p.goles_b ?? ""}">
          <button class="green" onclick="guardarResultado('${p.id}')">Guardar resultado</button>
        </div>
      </div>
    `;
  }
}

async function guardarPronostico(partidoId,cerrado){
  if(!usuario){
    alert("Primero debe ingresar su usuario.");
    return;
  }

  if(cerrado){
    alert("Este partido ya está cerrado.");
    return;
  }

  const existe = await db
    .from("pronosticos")
    .select("id")
    .eq("usuario_id", usuario.id)
    .eq("partido_id", partidoId)
    .maybeSingle();

  if(existe.data){
    alert("Ya registró un pronóstico para este partido. No se puede modificar.");
    cargarTodo();
    return;
  }

  const golesA = document.getElementById("pa_" + partidoId).value;
  const golesB = document.getElementById("pb_" + partidoId).value;

  if(golesA === "" || golesB === ""){
    alert("Ingrese ambos marcadores.");
    return;
  }

  const {error} = await db
    .from("pronosticos")
    .insert({
      usuario_id: usuario.id,
      partido_id: partidoId,
      goles_a: Number(golesA),
      goles_b: Number(golesB),
      actualizado_en: new Date().toISOString()
    });

  if(error){
    alert("Error: " + error.message);
    return;
  }

  alert("Pronóstico guardado. Ya no podrá modificarlo.");
  cargarTodo();
}

async function guardarResultado(partidoId){
  if(!usuario || usuario.rol !== "admin"){
    alert("Solo el administrador puede registrar resultados.");
    return;
  }

  const golesA = document.getElementById("ra_" + partidoId).value;
  const golesB = document.getElementById("rb_" + partidoId).value;

  if(golesA === "" || golesB === ""){
    alert("Ingrese ambos resultados.");
    return;
  }

  const {error} = await db
    .from("partidos")
    .update({
      goles_a:Number(golesA),
      goles_b:Number(golesB),
      cerrado:true
    })
    .eq("id", partidoId);

  if(error){
    alert("Error: " + error.message);
    return;
  }

  await calcularPuntos(partidoId);

  alert("Resultado guardado y puntos calculados.");
  cargarTodo();
}

async function calcularPuntos(partidoId){
  const {data:partido} = await db
    .from("partidos")
    .select("*")
    .eq("id", partidoId)
    .single();

  const {data:pronosticos} = await db
    .from("pronosticos")
    .select("*")
    .eq("partido_id", partidoId);

  if(!partido || !pronosticos) return;

  if(partido.goles_a === null || partido.goles_b === null){
    return;
  }

  for(const pr of pronosticos){
    let puntos = 0;

    const exacto =
      Number(pr.goles_a) === Number(partido.goles_a) &&
      Number(pr.goles_b) === Number(partido.goles_b);

    const resultadoPronostico =
      Number(pr.goles_a) > Number(pr.goles_b)
        ? "A"
        : Number(pr.goles_a) < Number(pr.goles_b)
        ? "B"
        : "E";

    const resultadoReal =
      Number(partido.goles_a) > Number(partido.goles_b)
        ? "A"
        : Number(partido.goles_a) < Number(partido.goles_b)
        ? "B"
        : "E";

    if(exacto){
      puntos = 3;
    }else if(resultadoPronostico === resultadoReal){
      puntos = 1;
    }

    await db
      .from("pronosticos")
      .update({ puntos })
      .eq("id", pr.id);
  }
}

async function cargarRanking(){
  await cargarRankingDiario();
  await cargarRankingGlobal();
  await cargarEstadisticas();
}

async function cargarRankingDiario(){
  const fecha = document.getElementById("fecha").value.trim();

  const {data,error} = await db
    .from("pronosticos")
    .select(`
      puntos,
      goles_a,
      goles_b,
      usuarios(nombre),
      partidos(fecha, equipo_a, equipo_b, goles_a, goles_b)
    `)
    .eq("partidos.fecha", fecha);

  const tbody = document.getElementById("rankingDiario");
  tbody.innerHTML = "";

  if(error){
    tbody.innerHTML = "<tr><td colspan='4'>Error cargando ranking diario.</td></tr>";
    return;
  }

  const usuarios = {};

  if(data){
    data.forEach(item=>{
      if(!item.usuarios || !item.partidos) return;

      const nombre = item.usuarios.nombre;

      if(!usuarios[nombre]){
        usuarios[nombre] = { puntos:0, detalle:[] };
      }

      usuarios[nombre].puntos += item.puntos || 0;

      const resultado =
        item.partidos.goles_a === null
          ? "pendiente"
          : item.partidos.goles_a + "-" + item.partidos.goles_b;

      usuarios[nombre].detalle.push(`
        <div class="detalle-partido">
          <strong>${mostrarPartido(item.partidos.equipo_a, item.partidos.equipo_b)}</strong>
          <span>Pronóstico: ${item.goles_a}-${item.goles_b}</span>
          <span>Resultado: ${resultado}</span>
          <span>Puntos: ${item.puntos || 0}</span>
        </div>
      `);
    });
  }

  const ranking = Object.entries(usuarios)
    .sort((a,b)=>b[1].puntos-a[1].puntos);

  if(ranking.length === 0){
    tbody.innerHTML = "<tr><td colspan='4'>No hay puntos registrados para esta fecha.</td></tr>";
    return;
  }

  ranking.forEach((r,index)=>{
    tbody.innerHTML += `
      <tr>
        <td data-label="Posición">${index + 1}</td>
        <td data-label="Usuario">${r[0]}</td>
        <td data-label="Puntos del día"><strong>${r[1].puntos}</strong></td>
        <td data-label="Detalle">${r[1].detalle.join("")}</td>
      </tr>
    `;
  });
}

async function cargarRankingGlobal(){
  const {data,error} = await db
    .from("pronosticos")
    .select(`
      puntos,
      usuarios(nombre)
    `);

  const tbody = document.getElementById("rankingGlobal");
  tbody.innerHTML = "";

  if(error){
    tbody.innerHTML = "<tr><td colspan='4'>Error cargando ranking global.</td></tr>";
    return;
  }

  const usuarios = {};

  if(data){
    data.forEach(item=>{
      if(!item.usuarios) return;

      const nombre = item.usuarios.nombre;

      if(!usuarios[nombre]){
        usuarios[nombre] = { puntos:0, pronosticos:0 };
      }

      usuarios[nombre].puntos += item.puntos || 0;
      usuarios[nombre].pronosticos++;
    });
  }

  const ranking = Object.entries(usuarios)
    .sort((a,b)=>b[1].puntos-a[1].puntos);

  if(ranking.length === 0){
    tbody.innerHTML = "<tr><td colspan='4'>No hay puntos globales todavía.</td></tr>";
    return;
  }

  ranking.forEach((r,index)=>{
    tbody.innerHTML += `
      <tr>
        <td data-label="Posición">${index + 1}</td>
        <td data-label="Usuario">${r[0]}</td>
        <td data-label="Puntos globales"><strong>${r[1].puntos}</strong></td>
        <td data-label="Pronósticos">${r[1].pronosticos}</td>
      </tr>
    `;
  });
}

async function cargarEstadisticas(){
  const {data,error} = await db
    .from("pronosticos")
    .select(`
      puntos,
      usuarios(nombre)
    `);

  const tbody = document.getElementById("estadisticas");
  tbody.innerHTML = "";

  if(error){
    tbody.innerHTML = "<tr><td colspan='4'>Error cargando estadísticas.</td></tr>";
    return;
  }

  const usuarios = {};

  if(data){
    data.forEach(item=>{
      if(!item.usuarios) return;

      const nombre = item.usuarios.nombre;

      if(!usuarios[nombre]){
        usuarios[nombre] = {
          exactos:0,
          resultados:0,
          puntos:0
        };
      }

      usuarios[nombre].puntos += item.puntos || 0;

      if(item.puntos === 3){
        usuarios[nombre].exactos++;
      }

      if(item.puntos === 1){
        usuarios[nombre].resultados++;
      }
    });
  }

  const ranking = Object.entries(usuarios)
    .sort((a,b)=>b[1].puntos-a[1].puntos);

  if(ranking.length === 0){
    tbody.innerHTML = "<tr><td colspan='4'>No hay estadísticas todavía.</td></tr>";
    return;
  }

  ranking.forEach(r=>{
    tbody.innerHTML += `
      <tr>
        <td data-label="Usuario">${r[0]}</td>
        <td data-label="Marcadores exactos">${r[1].exactos}</td>
        <td data-label="Resultados acertados">${r[1].resultados}</td>
        <td data-label="Total puntos"><strong>${r[1].puntos}</strong></td>
      </tr>
    `;
  });
}

const nombreGuardado = localStorage.getItem("nombreUsuario");
const pinGuardado = localStorage.getItem("pinUsuario");

if(nombreGuardado && pinGuardado){
  document.getElementById("nombreUsuario").value = nombreGuardado;
  document.getElementById("pinUsuario").value = pinGuardado;
  mostrarBotonCerrarSesion();
}

cargarTodo();
