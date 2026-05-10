export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <h1 className="text-4xl font-bold text-white">Sobre Nosotros</h1>
      
      <section>
        <h2 className="text-2xl font-bold text-blue-400 mb-4">
          Nuestra Misión
        </h2>
        <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
          <p>
            Somos un equipo de estudiantes del Instituto IES Islas Filipinas, actualmente cursando el ciclo formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM). Nos apasiona la tecnología, el desarrollo de software y la creación de soluciones digitales que aporten valor real a los usuarios.
          </p>
          <p>
            A lo largo de nuestra formación, hemos adquirido conocimientos en programación, diseño de interfaces, bases de datos y desarrollo de aplicaciones tanto para entornos móviles como de escritorio. Este proyecto nace como una oportunidad para aplicar de forma práctica todo lo aprendido, enfrentándonos a retos reales y consolidando nuestras habilidades como desarrolladores.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-blue-400 mb-4">
          Objetivos
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Nuestro principal objetivo es desarrollar un Trabajo de Fin de Grado que refleje no solo los conocimientos técnicos adquiridos durante el ciclo, sino también nuestra capacidad de trabajo en equipo, resolución de problemas y adaptación a las necesidades del proyecto.
        </p>
      </section>
    </div>
  );
}