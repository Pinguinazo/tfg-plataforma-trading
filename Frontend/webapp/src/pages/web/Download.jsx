export default function Download() {
  return (
    <div className="py-20 animate-fade-in flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-3xl w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight mb-4">
            Descarga TradingPulse
          </h1>
          
          <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
            Lleva la experiencia de TradingPulse a tu escritorio o dispositivo móvil.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://github.com/Pinguinazo/tfg-plataforma-trading/releases/download/v1.0.0/TradingPulse-Desktop-v2.exe" 
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
                </svg>
                Windows
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            <a 
              href="https://github.com/Pinguinazo/tfg-plataforma-trading/releases/download/v1.0.0/TradingPulse-Desktop-Linux.tar.gz" 
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 text-white font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 border border-slate-700 hover:border-slate-500 shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.016 1.488C9.537 1.488 7.42 2.76 6.136 4.887c-1.393.187-2.73.805-3.802 1.83-1.602 1.536-2.316 3.864-1.892 6.115.422 2.247 1.894 4.148 3.906 5.044.808 1.467 2.158 2.617 3.805 3.228 1.64.606 3.492.606 5.132 0 1.646-.61 2.996-1.76 3.804-3.227 2.01-.896 3.483-2.797 3.905-5.044.425-2.251-.29-4.58-1.892-6.115-1.071-1.025-2.408-1.643-3.8-1.83-1.284-2.127-3.4-3.399-5.88-3.399h-.5z" />
                </svg>
                Linux
              </span>
            </a> 

            <a 
              href="https://github.com/Pinguinazo/tfg-plataforma-trading/releases/download/v1.0.0/TradingPulse.apk"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-green-600/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0221 3.503C15.5342 8.2435 13.8443 7.828 12 7.828s-3.5342.4155-5.137 1.1226L4.841 5.4475a.415.415 0 00-.5676-.1521.415.415 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3436-4.1021-2.6893-7.5743-6.1185-9.4396" />
                </svg>
                Android (.apk)
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
          
          <p className="mt-6 text-sm text-slate-500 font-medium">
            Versión 1.0.0 • Para Windows, Linux y Android
          </p>
        </div>
      </div>
    </div>
  );
}