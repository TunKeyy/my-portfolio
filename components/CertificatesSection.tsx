import { FadeInSection } from './FadeInSection'

export function CertificatesSection() {
  const certificates = [
    {
      id: "toeic-cert",
      title: "Test of English for International Communication",
      issuer: "IIG Vietnam",
      date: "Issued Mar 2024 · Expires Mar 2026",
      description: "Overall: 800",
      image: "https://duhocglolink.com/wp-content/uploads/2019/05/luyen-thi-toeic-philippines-du-hoc-glolink-1.png",
    },
    {
      id: "ielts-cert",
      title: "International English Language Testing System",
      issuer: "IDP IELTS",
      date: "Issued Nov 2024 · Expires Nov 2026",
      description: "Overall: 6.5",
      image: "https://face.edu.vn/wp-content/uploads/2015/10/IELTS-logo.jpg",
    }
  ]

  return (
    <FadeInSection>
      <section className="py-20 bg-gray-50 dark:bg-gray-800" id="certificates">
        <div className="container mx-auto px-4">
        <div className="text-center mb-12 mt-12">
          <h2 className="text-sm uppercase text-gray-600 dark:text-gray-400 tracking-wider mb-1">
            Certifications
          </h2>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            English Certifications
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden flex h-[180px] hover:shadow-lg transition-shadow">
              <div className="w-1/3 p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <img
                  src={cert.image}
                  alt={`${cert.title} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="w-2/3 p-4 flex flex-col justify-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {cert.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {cert.issuer}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {cert.date}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {cert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    </FadeInSection>
  )
}