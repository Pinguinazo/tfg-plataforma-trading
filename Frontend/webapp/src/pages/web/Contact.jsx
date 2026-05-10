export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-10 rounded-3xl">
      <h1 className="text-3xl font-bold mb-2">Contáctanos</h1>
      <p className="text-slate-400 mb-8">¿Tienes alguna duda técnica o comercial? Escríbenos.</p>
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Mensaje enviado. ¡Gracias!'); }}>
        <div><label className="block text-sm font-bold text-slate-300 mb-2">Nombre Completo</label><input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500" required /></div>
        <div><label className="block text-sm font-bold text-slate-300 mb-2">Email</label><input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500" required /></div>
        <div><label className="block text-sm font-bold text-slate-300 mb-2">Mensaje</label><textarea rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500" required></textarea></div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-4 rounded-xl transition-all">Enviar Mensaje</button>
      </form>
    </div>
  );
}