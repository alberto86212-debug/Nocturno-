import React, { useState, useEffect, useRef } from "react";
import { Play, Info, X, Search, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, ArrowLeft, Mail, Lock, User } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------
// Conexión a Supabase (backend real de usuarios/base de datos)
// ---------------------------------------------
const SUPABASE_URL = "https://qalqhncqkifgdsirdygw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4tvmuLPTuU82r0r-OJGLpw_zaxf4RYm";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Video de muestra (licencia libre) usado cuando un título todavía no tiene video_url propio.
const SAMPLE_VIDEO = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// Paleta de colores de relleno para títulos sin imagen_url (se asignan por turno).
const PALETTE = [
  "from-[#2b3a55] to-[#0d1220]",
  "from-[#4a2545] to-[#150a17]",
  "from-[#1f4d3d] to-[#0a1a14]",
  "from-[#5a3a1f] to-[#1a0f08]",
  "from-[#2e2e52] to-[#0c0c1a]",
  "from-[#3a4a1f] to-[#0f150a]",
  "from-[#502a2a] to-[#160c0c]",
  "from-[#1f3a4a] to-[#08141a]",
  "from-[#4a1f3a] to-[#150814]",
  "from-[#1f4a4a] to-[#081515]",
  "from-[#4a3a1f] to-[#150f08]",
  "from-[#2a2a2a] to-[#0a0a0a]",
];

// Convierte una fila de la tabla "titulos" de Supabase al formato que usa la interfaz.
function mapTitulo(row, index) {
  return {
    id: row.id,
    title: row.nombre,
    desc: row.descripcion || "",
    genre: row.categoria || "Sin categoría",
    tag: row.destacado ? "Destacados" : (row.categoria || "Sin categoría"),
    color: PALETTE[index % PALETTE.length],
    imagen_url: row.imagen_url || null,
    video_url: row.video_url || null,
    destacado: !!row.destacado,
    year: row.year || null,
    duration: row.duration || null,
    rating: row.rating || null,
  };
}

// ---------------------------------------------
// Componentes
// ---------------------------------------------

function Poster({ item, onOpen }) {
  return (
    <button
      onClick={() => onOpen(item)}
      className={`group relative flex-shrink-0 w-[168px] sm:w-[200px] h-[240px] sm:h-[280px] rounded-md overflow-hidden bg-gradient-to-br ${item.color} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e3b23c] transition-transform duration-300 ease-out hover:scale-[1.04] hover:z-10`}
      style={item.imagen_url ? { backgroundImage: `url(${item.imagen_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/70 via-black/10 to-transparent">
        <span className="text-[10px] uppercase tracking-[0.15em] text-[#e3b23c]/80 mb-1">{item.genre}</span>
        <h3 className="font-serif text-[15px] sm:text-[17px] leading-tight text-[#f3ead9]">{item.title}</h3>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 flex items-center justify-center">
        <div className="w-11 h-11 rounded-full border border-[#f3ead9]/70 flex items-center justify-center">
          <Play size={16} className="text-[#f3ead9] ml-0.5" fill="currentColor" />
        </div>
      </div>
    </button>
  );
}

function Shelf({ label, items, onOpen }) {
  const scrollRef = useRef(null);
  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 480, behavior: "smooth" });
    }
  };
  if (items.length === 0) return null;
  return (
    <div className="relative mb-10 group/shelf">
      <div className="flex items-baseline justify-between mb-3 px-4 sm:px-10">
        <h2 className="font-serif text-lg sm:text-xl text-[#f3ead9]">{label}</h2>
      </div>
      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="hidden sm:flex absolute left-0 top-0 bottom-0 z-20 w-10 items-center justify-center bg-gradient-to-r from-[#0b0d14] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="text-[#f3ead9]" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 sm:px-10 pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => (
            <Poster key={it.id} item={it} onOpen={onOpen} />
          ))}
        </div>
        <button
          onClick={() => scrollBy(1)}
          className="hidden sm:flex absolute right-0 top-0 bottom-0 z-20 w-10 items-center justify-center bg-gradient-to-l from-[#0b0d14] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="text-[#f3ead9]" />
        </button>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose, onPlay }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`relative w-full max-w-lg rounded-lg overflow-hidden bg-[#12141c] border border-white/10`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`h-56 bg-gradient-to-br ${item.color} relative flex items-end p-6`}
          style={item.imagen_url ? { backgroundImage: `url(${item.imagen_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
            <X size={16} className="text-[#f3ead9]" />
          </button>
          <h2 className="font-serif text-3xl text-[#f3ead9]">{item.title}</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 text-sm text-[#f3ead9]/60 mb-4">
            {item.year && <span>{item.year}</span>}
            {item.duration && <><span>·</span><span>{item.duration}</span></>}
            {item.rating && <><span>·</span><span className="border border-[#f3ead9]/30 px-1.5 py-0.5 rounded text-xs">{item.rating}</span></>}
          </div>
          <p className="text-[#f3ead9]/85 leading-relaxed mb-6">{item.desc}</p>
          <div className="flex gap-3">
            <button onClick={() => onPlay(item)} className="flex-1 flex items-center justify-center gap-2 bg-[#e3b23c] text-[#12141c] font-medium py-2.5 rounded-md hover:bg-[#f0c25a] transition-colors">
              <Play size={16} fill="currentColor" /> Reproducir
            </button>
            <button className="flex items-center justify-center gap-2 border border-white/20 text-[#f3ead9] px-4 py-2.5 rounded-md hover:bg-white/5 transition-colors">
              <Info size={16} /> Más info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Completá todos los campos.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (err) throw err;
        if (data.user && !data.session) {
          setError("Revisá tu email para confirmar la cuenta antes de ingresar.");
          setLoading(false);
          return;
        }
        onLogin({ name, email });
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onLogin({ name: data.user?.user_metadata?.name || email.split("@")[0], email });
      }
    } catch (err) {
      setError(err.message === "Invalid login credentials" ? "Email o contraseña incorrectos." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#f3ead9] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-br from-[#2b3a55] via-[#0b0d14] to-[#0b0d14] opacity-80" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-serif text-2xl tracking-wide text-[#e3b23c]">NOCTURNO</span>
        </div>
        <div className="bg-[#12141c] border border-white/10 rounded-lg p-7">
          <h1 className="font-serif text-2xl mb-1">{mode === "login" ? "Ingresá a tu cuenta" : "Creá tu cuenta"}</h1>
          <p className="text-[#f3ead9]/50 text-sm mb-6">
            {mode === "login" ? "Ingresá con tu email y contraseña." : "Se crea una cuenta real en la base de datos."}
          </p>
          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-md px-3 py-2.5 focus-within:border-[#e3b23c]/60">
                <User size={16} className="text-[#f3ead9]/40" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="bg-transparent outline-none text-sm w-full placeholder:text-[#f3ead9]/30" />
              </div>
            )}
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-md px-3 py-2.5 focus-within:border-[#e3b23c]/60">
              <Mail size={16} className="text-[#f3ead9]/40" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="bg-transparent outline-none text-sm w-full placeholder:text-[#f3ead9]/30" />
            </div>
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-md px-3 py-2.5 focus-within:border-[#e3b23c]/60">
              <Lock size={16} className="text-[#f3ead9]/40" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="bg-transparent outline-none text-sm w-full placeholder:text-[#f3ead9]/30" />
            </div>
            {error && <p className="text-[#e35c3c] text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#e3b23c] text-[#12141c] font-medium py-2.5 rounded-md hover:bg-[#f0c25a] transition-colors mt-2 disabled:opacity-60">
              {loading ? "Un momento..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>
          <p className="text-center text-sm text-[#f3ead9]/50 mt-5">
            {mode === "login" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="text-[#e3b23c] hover:underline">
              {mode === "login" ? "Registrate" : "Ingresá"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Player({ item, onClose }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
    const onTime = () => setProgress(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause(); else v.play();
    setPlaying(!playing);
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const wake = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2800);
  };

  useEffect(() => { wake(); return () => clearTimeout(hideTimer.current); }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black" onMouseMove={wake}>
      <video ref={videoRef} src={item.video_url || SAMPLE_VIDEO} muted={muted} className="w-full h-full object-contain" onClick={togglePlay} />
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6 flex items-center gap-4">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#f3ead9]" />
          </button>
          <span className="font-serif text-lg text-[#f3ead9]">{item.title}</span>
        </div>
        <div className="bg-gradient-to-t from-black/85 to-transparent p-4 sm:p-6">
          <div onClick={seek} className="h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group">
            <div className="h-full bg-[#e3b23c] rounded-full relative" style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#e3b23c] rounded-full opacity-0 group-hover:opacity-100" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay}>
                {playing ? <Pause size={22} className="text-[#f3ead9]" fill="currentColor" /> : <Play size={22} className="text-[#f3ead9]" fill="currentColor" />}
              </button>
              <button onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX size={20} className="text-[#f3ead9]" /> : <Volume2 size={20} className="text-[#f3ead9]" />}
              </button>
              <span className="text-xs text-[#f3ead9]/60">{fmt(progress)} / {fmt(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [selected, setSelected] = useState(null);
  const [playingItem, setPlayingItem] = useState(null);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Catálogo cargado desde Supabase (tabla "titulos")
  const [titles, setTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(true);

  useEffect(() => {
    const cargarTitulos = async () => {
      const { data, error } = await supabase
        .from("titulos")
        .select("*")
        .order("creado_en", { ascending: false });
      if (!error && data) {
        setTitles(data.map(mapTitulo));
      }
      setLoadingTitles(false);
    };
    cargarTitulos();
  }, []);

  // Al cargar, revisa si ya hay una sesión activa (persistencia real)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s?.user) {
        setUser({ name: s.user.user_metadata?.name || s.user.email.split("@")[0], email: s.user.email });
      }
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ name: session.user.user_metadata?.name || session.user.email.split("@")[0], email: session.user.email });
      } else {
        setUser(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = query
    ? titles.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : null;

  // Categorías presentes en el catálogo actual (Destacados primero si hay alguno)
  const rows = [
    ...(titles.some((t) => t.destacado) ? ["Destacados"] : []),
    ...Array.from(new Set(titles.filter((t) => !t.destacado).map((t) => t.genre))),
  ];

  const featured = titles.find((t) => t.destacado) || titles[0] || null;

  if (checkingSession) {
    return <div className="min-h-screen bg-[#0b0d14]" />;
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#f3ead9] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${scrolled ? "bg-[#0b0d14]/95 backdrop-blur-sm border-b border-white/5" : "bg-gradient-to-b from-black/60 to-transparent"}`}>
        <div className="flex items-center justify-between px-4 sm:px-10 py-4">
          <div className="flex items-center gap-8">
            <span className="font-serif text-xl tracking-wide text-[#e3b23c]">NOCTURNO</span>
            <nav className="hidden md:flex gap-6 text-sm text-[#f3ead9]/70">
              <a className="hover:text-[#f3ead9] transition-colors" href="#">Inicio</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {showSearch ? (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setShowSearch(false)}
                placeholder="Buscar títulos..."
                className="bg-black/40 border border-white/20 rounded px-3 py-1.5 text-sm w-40 sm:w-56 outline-none focus:border-[#e3b23c]/60"
              />
            ) : (
              <button onClick={() => setShowSearch(true)}>
                <Search size={18} />
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded bg-gradient-to-br from-[#e3b23c] to-[#8a5a1f] flex items-center justify-center text-xs font-semibold text-[#12141c]">
                {user.name.charAt(0).toUpperCase()}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-11 w-44 bg-[#12141c] border border-white/10 rounded-md py-2 text-sm shadow-xl">
                  <div className="px-3 py-1.5 text-[#f3ead9]/50 text-xs">{user.name}</div>
                  <button onClick={logout} className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Resultados de búsqueda */}
      {filtered ? (
        <div className="pt-28 px-4 sm:px-10 pb-16">
          <h2 className="font-serif text-xl mb-4">Resultados para "{query}"</h2>
          <div className="flex flex-wrap gap-3">
            {filtered.length ? filtered.map((it) => <Poster key={it.id} item={it} onOpen={setSelected} />) : (
              <p className="text-[#f3ead9]/60">No encontramos nada. Probá con otro título.</p>
            )}
          </div>
        </div>
      ) : loadingTitles ? (
        <div className="pt-28 px-4 sm:px-10 pb-16 text-[#f3ead9]/60">Cargando catálogo...</div>
      ) : !featured ? (
        <div className="pt-28 px-4 sm:px-10 pb-16 text-[#f3ead9]/60">
          Todavía no hay títulos cargados. Agregalos desde la tabla "titulos" en Supabase.
        </div>
      ) : (
        <>
          {/* Hero */}
          <div
            className={`relative h-[62vh] sm:h-[78vh] flex items-end bg-gradient-to-br ${featured.color}`}
            style={featured.imagen_url ? { backgroundImage: `url(${featured.imagen_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-[#0b0d14]/30 to-transparent" />
            <div className="relative z-10 px-4 sm:px-10 pb-12 sm:pb-16 max-w-xl">
              <span className="text-xs uppercase tracking-[0.2em] text-[#e3b23c] mb-3 block">{featured.tag}</span>
              <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05] mb-4">{featured.title}</h1>
              <p className="text-[#f3ead9]/80 mb-6 leading-relaxed">{featured.desc}</p>
              <div className="flex gap-3">
                <button onClick={() => setPlayingItem(featured)} className="flex items-center gap-2 bg-[#e3b23c] text-[#12141c] font-medium px-5 py-2.5 rounded-md hover:bg-[#f0c25a] transition-colors">
                  <Play size={16} fill="currentColor" /> Reproducir
                </button>
                <button onClick={() => setSelected(featured)} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-md hover:bg-white/20 transition-colors">
                  <Info size={16} /> Más info
                </button>
              </div>
            </div>
          </div>

          {/* Filas por categoría */}
          <div className="pt-8 pb-16">
            {rows.map((row) => (
              <Shelf
                key={row}
                label={row}
                items={row === "Destacados" ? titles.filter((t) => t.destacado) : titles.filter((t) => !t.destacado && t.genre === row)}
                onOpen={setSelected}
              />
            ))}
          </div>
        </>
      )}

      <footer className="px-4 sm:px-10 py-8 border-t border-white/5 text-[#f3ead9]/40 text-xs">
        Nocturno
      </footer>

      <DetailModal item={selected} onClose={() => setSelected(null)} onPlay={(it) => { setSelected(null); setPlayingItem(it); }} />
      {playingItem && <Player item={playingItem} onClose={() => setPlayingItem(null)} />}
    </div>
  );
}

