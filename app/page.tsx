'use client'

import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Sun, Moon, Copy, Github, MapPin, Facebook, Linkedin, Menu, X } from 'lucide-react'
import { useTheme } from '../lib/theme.provider'
import Link from 'next/link'
import Image from 'next/image'
import { Modal } from '@/components/Modal'
import { PDFViewer } from '@/components/PDFViewer'
import myAvatar from '../public/images/my_avatar.jpg'
import aboutImage from '../public/images/graduation_image.jpg'
import nexlabLogo from '../public/images/nexlab_logo.png'
import hrmImage from '../public/images/hrm_image.png'
import crmImage from '../public/images/crm_image.png'
import warehouseImage from '../public/images/warehouse_image.avif'
import ecommerceImage from '../public/images/ecommerce_image.webp'

function Header() {
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false)

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isMobileMenuOpen])
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const handleCVClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPDFModalOpen(true)
  }

  return (
    <>
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            {'Portfolio'}
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('work')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Work
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Contact
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-white" />}
            </button>
            
            <a
              href="/pdf_files/CV.pdf"
              onClick={handleCVClick}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:opacity-90 transition-opacity"
            >
              My Resumé
            </a>
          </div>

          {/* Mobile menu drawer */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 md:hidden">
              <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-900 p-6 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-full mobile-menu-open:translate-x-0">
                <div className="flex justify-between items-center mb-8">
                  <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                    {'Portfolio'}
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => scrollToSection('about')}
                    className="text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    About
                  </button>
                  <button
                    onClick={() => scrollToSection('work')}
                    className="text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Work
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Contact
                  </button>
                  
                  <div className="flex items-center gap-4 px-4 py-2">
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-white" />}
                    </button>
                    
                    <a
                      href="/pdf_files/CV.pdf"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsMobileMenuOpen(false)
                        setIsPDFModalOpen(true)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:opacity-90 transition-opacity text-center"
                    >
                      My Resumé
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <Modal isOpen={isPDFModalOpen} onClose={() => setIsPDFModalOpen(false)}>
        <PDFViewer file="/pdf_files/CV.pdf" />
      </Modal>
    </>
  )
}

function FadeInSection({ children }: { children: React.ReactNode }) {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function HeroSection() {
  return (
    <section className="pt-32 pb-20" id="hero">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 px-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Hi, I&apos;m Kha Nguyen{' '}
              <span className="inline-block animate-wave">👋</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              I&apos;m a Backend developer with a focus on designing and creating the systems and platforms with
              the high quality of the performance and user experience. Even though I have been creating web applications 
              for a long time, I still love it as if it was something new.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-5 h-5" />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Available for new projects</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <a
                href="https://github.com/TunKeyy"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a
                href="https://www.facebook.com/kha.nguyentuan.73/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Facebook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>

              <a
                href="https://www.linkedin.com/in/kha-nguyen-tuan/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <div className="relative z-10">
              <Image
                src={myAvatar}
                alt="Profile"
                className="w-full h-auto rounded-full shadow-2xl"
              />
            </div>
            <div className="absolute inset-0 translate-x-4 translate-y-4 bg-gray-200 dark:bg-gray-800 rounded-lg -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
function AboutSection() {
  return (
    <FadeInSection>
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-2">About me</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
              <Image
                src={aboutImage}
                alt="Profile"
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
                Curious about me? Here you have it
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  I&apos;m a passionate self-proclaimed developer who specializes in web and application
                  development. I am very enthusiastic about bringing the
                  technical and visual aspects of digital products to life. User experience, system flexibility,
                   consistent data and clean, readable, highly performance code matters to me.
                </p>
                <p>
                  I had been a student in University of Information Technology since 2020 and graduated in 2024, and then, I&apos;ve
                  continued to grow and evolve as a developer, taking on new challenges and
                  learning the latest technologies along the way. Now, in my 20s, after starting 
                  my web development journey, I&apos;m building cutting-edge web
                  applications using modern technologies.
                </p>
                <p>
                  I always want to learn new things on the daily basis to help me explore the surroundings. I love languages and technologies as well so I try to combine them in daily work and activities.
                  Meeting new people and having deep conversations attract me a lot and I am firm believer in terms of sharings make us more comprehensive together.
                </p>
                <p>
                  When I&apos;m not in full-on developer mode, you can find me hovering around on
                  other platforms like Facebook, experiencing the wonderful time of some English clubs at the weekend. 
                  You can follow me with the information in contact section and share tech-related topics or experience in life.
                </p>
              </div>
              <div className="pt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  A few quick bits about me:
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
                      <span>B.E. in Information Technology</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
                      <span>Backend developer</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
                      <span>Avid learner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
                      <span>Aspiring Devops Engineer</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 pt-6">
                One last thing, Im available for freelance work, so feel free to reach out and
                say hello! I promise I dont bite 😊
              </p>
            </div>
          </div>
        </div>
      </section>
    </FadeInSection>
  )
}

function SkillsSection() {
  const skills = [
    { name: 'JavaScript', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/768px-JavaScript-logo.png' },
    { name: 'TypeScript', icon: 'https://cdn.worldvectorlogo.com/logos/typescript.svg' },
    { name: 'Node.js', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-node-js-logo-icon-download-in-svg-png-gif-file-formats--nodejs-programming-language-pack-logos-icons-1174925.png?f=webp&w=256' },
    { name: 'Golang', icon: 'https://go.dev/blog/go-brand/Go-Logo/PNG/Go-Logo_Blue.png' },
    { name: 'Hasura', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Hasura-icon-primary.png' },
    { name: 'GraphQL', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/2048px-GraphQL_Logo.svg.png' },
    { name: 'PostgreSQL', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/1200px-Postgresql_elephant.svg.png' },
    { name: 'AWS', icon: 'https://cdn.iconscout.com/icon/free/png-256/free-amazon-aws-3628617-3029842.png' },
    { name: 'GCP', icon: 'https://cdn.prod.website-files.com/6449405754e757db07f25327/6656429d1776bd09704334e8_google.webp' },
    { name: 'Github Actions', icon: 'https://cdn.prod.website-files.com/65264f6bf54e751c3a776db1/66d86964333d11e0a1f1da9e_github_actions.png' },
    { name: 'Bash scripting', icon: 'https://runcode-app-public.s3.amazonaws.com/images/bash-shell-script-online-editor-compiler.original.png' },
    { name: 'OOP', icon: 'https://t4.ftcdn.net/jpg/03/81/49/21/360_F_381492166_7VjcukTYqp0unQfIEbH3rZkqOKwore0o.jpg' },
    { name: 'Algorithms', icon: 'https://cdn-icons-png.flaticon.com/128/10484/10484355.png' },
    { name: 'Netwoking', icon: 'https://cdn-icons-png.flaticon.com/512/4152/4152018.png' },
    { name: 'Git', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Git_icon.svg/2048px-Git_icon.svg.png' },
    { name: 'Agile/Scrum', icon: 'https://miro.medium.com/v2/resize:fit:512/1*pcRNg2RXH2LWkiciru5fJQ.png' },
  ]

  return (
    <FadeInSection>
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-2">Skills</h2>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              The skills, tools and technologies I am really good at
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex flex-col items-center justify-center p-4 hover:scale-110 transition-transform duration-200"
              >
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="w-12 h-12 mb-3"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeInSection>
  )
}

function ExperienceSection() {
  const experiences = [
    {
      company: 'Nexlab Technology',
      logo: nexlabLogo,
      position: 'Backend Developer',
      period: 'October 2023 - Present',
      responsibilities: [
        'Created multi-platform applications using Golang and NodeJS combining with Hasura GraphQL, delivering high development speed and efficiency',
        'Enhanced the data retrieval times through effective database management and optimization',
        'Designed server infrastructure with on-premise and cloud server, reducing server errors by logging and debugging',
        'Automatically handled the exceptional cases with scripts, ensured the consistency and synchronization of data',
        'Maintained and refactored features of operated projects',
        'Contributed to project development with effective backend solutions and best practices'
      ]
    },
    {
      company: 'Nexlab Technology',
      logo: nexlabLogo,
      position: 'Backend Intern',
      period: 'Jul 2024 - Oct 2024',
      responsibilities: [
        'Got familiar with the new technologies, fast-paced development process, business culture',
        'Developed and released the new features for portal and application products',
        'Engaged in training sections and delivered presentation',
      ]
    }
  ]

  return (
    <FadeInSection>
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-2">Experience</h2>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              Here is a quick summary of my most recent experiences
            </p>
          </div>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <Image
                    src={exp.logo}
                    alt={exp.company}
                    className="w-16 h-16 object-contain"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {exp.position}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                          <span className="min-w-[8px] h-[8px] mt-[6px] rounded-full bg-gray-300 dark:bg-gray-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeInSection>
  )
}

function FieldsSection() {
  const skills = [
    { name: 'CRM', icon: crmImage },
    { name: 'Warehouses', icon: warehouseImage },
    { name: 'HRM', icon: hrmImage },
    { name: 'E-Commerce', icon: ecommerceImage },
  ]

  // Duplicate the skills array to create a seamless loop
  const duplicatedSkills = [...skills, ...skills]

  return (
    <section className="py-20 overflow-hidden" id="skills">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-xl text-gray-600 dark:text-gray-400 tracking-wider mb-1">
            Fields
          </h2>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            The fields in which I have much experiences
          </h3>
        </div>

        <div className="relative">
          {/* First row - moving right to left */}
          <div className="flex space-x-8 animate-scroll-left py-4">
            {duplicatedSkills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="flex-none w-48 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform transition-transform hover:scale-105"
              >
                <div className="flex flex-col items-center space-y-4">
                  <Image
                    src={skill.icon}
                    alt={`${skill.name} icon`}
                    className="w-16 h-16 object-contain"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {skill.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CertificatesSection() {
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
          <div className="text-center mb-12">
            <h2 className="text-xl text-gray-600 dark:text-gray-400 tracking-wider mb-1">
              Certificates
            </h2>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              English Certifications
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
              >
                <div className="md:w-2/5">
                  <img
                    src={cert.image}
                    alt={`${cert.title} Certificate`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6 md:w-3/5">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {cert.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {cert.issuer}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {cert.date}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
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

// function ProjectsSection() {
//   const projects = [
//     {
//       title: "Flekii",
//       description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec urna ac tellus volutpat viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
//       image: "/placeholder.svg?height=600&width=800",
//       technologies: ["React", "Next.js", "TypeScript", "Next.js", "PostgreSQL", "TailwindCSS", "Figma", "Cypress", "Storybook", "Git"],
//       link: "#"
//     },
//     {
//       title: "Flekii",
//       description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec urna ac tellus volutpat viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
//       image: "/placeholder.svg?height=600&width=800",
//       technologies: ["React", "Next.js", "TypeScript", "Next.js", "PostgreSQL", "TailwindCSS", "Figma", "Cypress", "Storybook", "Git"],
//       link: "#"
//     },
//     {
//       title: "Flekii",
//       description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec urna ac tellus volutpat viverra. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
//       image: "/placeholder.svg?height=600&width=800",
//       technologies: ["React", "Next.js", "TypeScript", "Next.js", "PostgreSQL", "TailwindCSS", "Figma", "Cypress", "Storybook", "Git"],
//       link: "#"
//     }
//   ]

//   return (
//     <FadeInSection>
//       <section className="py-20">
//         <div className="max-w-6xl mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-2">Projects</h2>
//             <p className="text-3xl font-semibold text-gray-900 dark:text-white">
//               Some of the noteworthy projects I have built
//             </p>
//           </div>
//           <div className="space-y-24">
//             {projects.map((project, index) => (
//               <div
//                 key={index}
//                 className={`flex flex-col gap-8 ${
//                   index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
//                 }`}
//               >
//                 <div className="flex-1 group">
//                   <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
//                     <img
//                       src={project.image}
//                       alt={project.title}
//                       className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex-1 flex flex-col justify-center">
//                   <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
//                     {project.title}
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-300 mb-6">
//                     {project.description}
//                   </p>
//                   <div className="flex flex-wrap gap-2 mb-8">
//                     {project.technologies.map((tech) => (
//                       <span
//                         key={tech}
//                         className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm"
//                       >
//                         {tech}
//                       </span>
//                     ))}
//                   </div>
//                   <a
//                     href={project.link}
//                     className="self-start hover:opacity-75 transition-opacity"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     <svg
//                       className="w-6 h-6 text-gray-600 dark:text-gray-300"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//                       />
//                     </svg>
//                   </a>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </FadeInSection>
//   )
// }

function ContactSection() {
  const [emailCopied, setEmailCopied] = useState(false)
  const [phoneCopied, setPhoneCopied] = useState(false)
  
  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 2000)
      } else {
        setPhoneCopied(true)
        setTimeout(() => setPhoneCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  return (
    <FadeInSection>
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Get in touch
          </h2>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
            What&apos;s next? Feel free to reach out to me if you&apos;re looking for
            a developer, have a query, or simply want to connect.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600 dark:text-gray-300">📧</span>
              <a
                href="mailto:ntkha71@gmail.com"
                className="text-xl text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
              >
                ntkha71@gmail.com
              </a>
              <button
                onClick={() => copyToClipboard('ntkha71@gmail.com', 'email')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Copy email"
              >
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {emailCopied && (
                <span className="text-sm text-green-500">Copied!</span>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600 dark:text-gray-300">📱</span>
              <a
                href="tel:+84375627330"
                className="text-xl text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
              >
                +84 375627330
              </a>
              <button
                onClick={() => copyToClipboard('+84375627330', 'phone')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Copy phone"
              >
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {phoneCopied && (
                <span className="text-sm text-green-500">Copied!</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You may also find me on these platforms:
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/TunKeyy"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="https://www.linkedin.com/in/kha-nguyen-tuan/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>

            <a
              href="https://www.facebook.com/kha.nguyentuan.73/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Facebook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
          </div>
        </div>
      </section>
    </FadeInSection>
  )
}

function Footer() {
  return (
    <footer className="py-8 text-center text-gray-600 dark:text-gray-400 text-sm">
      <p>
        © 2025 | Designed and coded ❤️ by Kha Nguyen
      </p>
    </footer>
  )
}
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
      {/* <section className="bg-white dark:bg-gray-900">
        <ProjectsSection />
      </section> */}
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
