import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { SkillsSection } from '@/components/SkillsSection'
import { ExperienceSection } from '@/components/ExperienceSection'
import { FieldsSection } from '@/components/FieldsSection'
import { CertificatesSection } from '@/components/CertificatesSection'
import { ContactSection } from '@/components/ContactSection'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <HeroSection />
      <section id="about" className="bg-gray-50 dark:bg-gray-800" >
        <AboutSection />
      </section>
      <section id="work" className="bg-white dark:bg-gray-900">
        <SkillsSection />
      </section>
      <section className="bg-gray-50 dark:bg-gray-800">
        <ExperienceSection />
      </section>
      <section className="bg-white dark:bg-gray-900">
        <FieldsSection />
      </section>
      <section className="bg-gray-50 dark:bg-gray-800">
        <CertificatesSection />
      </section>
      <section id="contact" className="bg-white dark:bg-gray-900">
        <ContactSection />
      </section>
      <Footer />
    </main>
  )
}