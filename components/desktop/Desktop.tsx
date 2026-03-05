'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Github,
  MapPin,
  Facebook,
  Linkedin,
  Copy,
  Mail,
  Phone,
} from 'lucide-react'
import { DesktopProvider, useDesktop } from './DesktopProvider'
import { MenuBar } from './MenuBar'
import { Window } from './Window'
import { Dock, DockItem } from './Dock'
import { MobileLayout } from './MobileLayout'
import { TabletLayout } from './TabletLayout'
import { PDFViewer } from '../PDFViewer'
import { useTheme } from '../../lib/theme.provider'
import { useDeviceType } from '../../hooks/useDeviceType'

// Image imports
import myAvatar from '../../public/images/my_avatar.jpg'
import aboutImage from '../../public/images/graduation_image.jpg'
import nexlabLogo from '../../public/images/nexlab_logo.png'
import hrmImage from '../../public/images/hrm_image.png'
import crmImage from '../../public/images/crm_image.png'
import warehouseImage from '../../public/images/warehouse_image.avif'
import ecommerceImage from '../../public/images/ecommerce_image.webp'
import socialMediaImage from '../../public/images/social_media_image.png'
import iotImage from '../../public/images/iot_image.png'

// ===== App Configuration =====
const APPS = [
  { id: 'profile', title: 'Profile', icon: '👤', w: 640, h: 480, x: 120, y: 60 },
  { id: 'about', title: 'About Me', icon: '📖', w: 780, h: 560, x: 180, y: 80 },
  { id: 'skills', title: 'Skills', icon: '⚡', w: 720, h: 560, x: 240, y: 70 },
  { id: 'experience', title: 'Experience', icon: '💼', w: 760, h: 540, x: 200, y: 90 },
  { id: 'fields', title: 'Fields', icon: '📂', w: 680, h: 480, x: 280, y: 100 },
  { id: 'certificates', title: 'Certificates', icon: '🏆', w: 640, h: 420, x: 260, y: 85 },
  { id: 'contact', title: 'Contact', icon: '💬', w: 520, h: 480, x: 320, y: 110 },
  { id: 'resume', title: 'Resume', icon: '📄', w: 800, h: 650, x: 160, y: 55 },
]

const DOCK_ITEMS: DockItem[] = APPS.map((a) => ({
  id: a.id,
  icon: a.icon,
  title: a.title,
}))

// ===== Window Content Components =====

function ProfileContent() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <div className="p-5 sm:p-8 flex flex-col items-center text-center">
      <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 sm:mb-6 ring-4 ${isLight ? 'ring-black/10' : 'ring-white/10'}`}>
        <Image
          src={myAvatar}
          alt="Kha Nguyen"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className={`text-2xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
        Hi, I&apos;m Kha Nguyen{' '}
        <span className="inline-block animate-wave">👋</span>
      </h1>
      <p className="text-blue-500 font-medium mb-4">Backend Developer</p>
      <p className={`max-w-md mb-6 text-sm leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
        I&apos;m a Backend developer with a focus on designing and creating
        systems and platforms with high quality performance and user experience.
        Even though I have been creating web applications for a long time, I
        still love it as if it was something new.
      </p>
      <div className="flex items-center gap-4 mb-6 flex-wrap justify-center">
        <div className={`flex items-center gap-1.5 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          <MapPin className="w-4 h-4" />
          <span>Ho Chi Minh City, Vietnam</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500">Available for new projects</span>
        </div>
      </div>
      <div className="flex gap-3">
        <a
          href="https://github.com/TunKeyy"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-xl transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Github className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`} />
        </a>
        <a
          href="https://www.facebook.com/kha.nguyentuan.73/"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-xl transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Facebook className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`} />
        </a>
        <a
          href="https://www.linkedin.com/in/kha-nguyen-tuan/"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-xl transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Linkedin className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`} />
        </a>
      </div>
    </div>
  )
}

function AboutContent() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-full sm:w-48 shrink-0">
          <Image
            src={aboutImage}
            alt="About"
            className="rounded-lg w-full sm:w-48"
          />
        </div>
        <div className="flex-1 space-y-3 sm:space-y-4">
          <h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Curious about me? Here you have it
          </h2>
          <div className={`space-y-2 sm:space-y-3 text-sm leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
            <p>
              I&apos;m a passionate self-proclaimed developer who specializes in
              web and application development. User experience, system
              flexibility, consistent data and clean, readable, highly
              performance code matters to me.
            </p>
            <p>
              I had been a student in University of Information Technology since
              2020 and graduated in 2024, and then, I&apos;ve continued to grow
              and evolve as a developer, taking on new challenges and learning
              the latest technologies along the way.
            </p>
            <p>
              I always want to learn new things on the daily basis. I love
              languages and technologies and try to combine them in daily work.
              Meeting new people and having deep conversations attract me a lot.
            </p>
            <p>
              When I&apos;m not in developer mode, you can find me at English
              clubs on the weekends, sharing tech-related topics or life
              experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {[
              'B.E. in Information Technology',
              'Backend Developer',
              'Avid Learner',
              'Aspiring DevOps Engineer',
            ].map((tag) => (
              <div
                key={tag}
                className={`flex items-center gap-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {tag}
              </div>
            ))}
          </div>
          <p className={`text-sm pt-2 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            I&apos;m available for freelance work, so feel free to reach out and
            say hello! I promise I don&apos;t bite 😊
          </p>
        </div>
      </div>
    </div>
  )
}

function SkillsContent() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const skills = [
    {
      name: 'JavaScript',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/768px-JavaScript-logo.png',
    },
    {
      name: 'TypeScript',
      icon: 'https://cdn.worldvectorlogo.com/logos/typescript.svg',
    },
    {
      name: 'Node.js',
      icon: 'https://cdn.iconscout.com/icon/free/png-256/free-node-js-logo-icon-download-in-svg-png-gif-file-formats--nodejs-programming-language-pack-logos-icons-1174925.png?f=webp&w=256',
    },
    {
      name: 'Golang',
      icon: 'https://go.dev/blog/go-brand/Go-Logo/PNG/Go-Logo_Blue.png',
    },
    {
      name: 'Hasura',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Hasura-icon-primary.png',
    },
    {
      name: 'GraphQL',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/2048px-GraphQL_Logo.svg.png',
    },
    {
      name: 'PostgreSQL',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/1200px-Postgresql_elephant.svg.png',
    },
    {
      name: 'AWS',
      icon: 'https://cdn.iconscout.com/icon/free/png-256/free-amazon-aws-3628617-3029842.png',
    },
    {
      name: 'GCP',
      icon: 'https://cdn.prod.website-files.com/6449405754e757db07f25327/6656429d1776bd09704334e8_google.webp',
    },
    {
      name: 'Github Actions',
      icon: 'https://cdn.prod.website-files.com/65264f6bf54e751c3a776db1/66d86964333d11e0a1f1da9e_github_actions.png',
    },
    {
      name: 'Bash',
      icon: 'https://runcode-app-public.s3.amazonaws.com/images/bash-shell-script-online-editor-compiler.original.png',
    },
    {
      name: 'Git',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Git_icon.svg/2048px-Git_icon.svg.png',
    },
    {
      name: 'Networking',
      icon: 'https://cdn-icons-png.flaticon.com/512/4152/4152018.png',
    },
    {
      name: 'OOP',
      icon: 'https://t4.ftcdn.net/jpg/03/81/49/21/360_F_381492166_7VjcukTYqp0unQfIEbH3rZkqOKwore0o.jpg',
    },
    {
      name: 'Algorithms',
      icon: 'https://cdn-icons-png.flaticon.com/128/10484/10484355.png',
    },
    {
      name: 'Agile/Scrum',
      icon: 'https://miro.medium.com/v2/resize:fit:512/1*pcRNg2RXH2LWkiciru5fJQ.png',
    },
  ]

  return (
    <div className="p-4 sm:p-6">
      <p className={`text-sm mb-4 sm:mb-6 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
        The skills, tools and technologies I am really good at
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
        {skills.map((s) => (
          <div
            key={s.name}
            className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-colors cursor-default ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <img
              src={s.icon}
              alt={s.name}
              className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 object-contain"
            />
            <span className={`text-[10px] sm:text-xs text-center ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExperienceContent() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const experiences = [
    {
      logo: nexlabLogo,
      company: 'Nexlab Technology',
      position: 'Backend Developer',
      period: 'October 2023 - Present',
      responsibilities: [
        'Created multi-platform applications using Golang and NodeJS with Hasura GraphQL',
        'Enhanced data retrieval times through effective database optimization',
        'Designed server infrastructure with on-premise and cloud servers',
        'Automatically handled exceptional cases with scripts, ensured data consistency',
        'Maintained and refactored features of operated projects',
        'Contributed to project development with effective backend solutions',
      ],
    },
    {
      logo: nexlabLogo,
      company: 'Nexlab Technology',
      position: 'Backend Intern',
      period: 'Jul 2024 - Oct 2024',
      responsibilities: [
        'Got familiar with new technologies and fast-paced development process',
        'Developed and released new features for portal and application products',
        'Engaged in training sections and delivered presentations',
      ],
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <p className={`text-sm mb-2 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
        Quick summary of my most recent experiences
      </p>
      {experiences.map((exp, i) => (
        <div
          key={i}
          className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <Image
              src={exp.logo}
              alt={exp.company}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3 gap-1">
                <div>
                  <h3 className={`font-semibold text-sm sm:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>{exp.position}</h3>
                  <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{exp.company}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap self-start ${isLight ? 'text-gray-500 bg-gray-100' : 'text-gray-500 bg-white/5'}`}>
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-1.5">
                {exp.responsibilities.map((item, j) => (
                  <li
                    key={j}
                    className={`flex items-start gap-2 text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FieldsContent() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const fields = [
    { name: 'CRM', icon: crmImage },
    { name: 'Warehouses', icon: warehouseImage },
    { name: 'HRM', icon: hrmImage },
    { name: 'E-Commerce', icon: ecommerceImage },
    { name: 'Social Media', icon: socialMediaImage },
    { name: 'IOT', icon: iotImage },
  ]

  return (
    <div className="p-4 sm:p-6">
      <p className={`text-sm mb-4 sm:mb-6 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
        Fields in which I have much experience
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {fields.map((f) => (
          <div
            key={f.name}
            className={`flex flex-col items-center p-3 sm:p-5 rounded-xl border transition-all cursor-default ${isLight ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10'}`}
          >
            <Image
              src={f.icon}
              alt={f.name}
              className="w-10 h-10 sm:w-14 sm:h-14 object-contain mb-2 sm:mb-3"
            />
            <span className={`text-xs sm:text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CertificatesContent() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const certs = [
    {
      title: 'TOEIC',
      fullTitle: 'Test of English for International Communication',
      issuer: 'IIG Vietnam',
      date: 'Mar 2024 - Mar 2026',
      score: 'Overall: 800',
      image:
        'https://duhocglolink.com/wp-content/uploads/2019/05/luyen-thi-toeic-philippines-du-hoc-glolink-1.png',
    },
    {
      title: 'IELTS',
      fullTitle: 'International English Language Testing System',
      issuer: 'IDP IELTS',
      date: 'Nov 2024 - Nov 2026',
      score: 'Overall: 6.5',
      image: 'https://face.edu.vn/wp-content/uploads/2015/10/IELTS-logo.jpg',
    },
  ]

  return (
    <div className="p-4 sm:p-6">
      <p className={`text-sm mb-4 sm:mb-6 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>English Certifications</p>
      <div className="space-y-3 sm:space-y-4">
        {certs.map((c) => (
          <div
            key={c.title}
            className={`flex gap-3 sm:gap-4 rounded-xl p-3 sm:p-4 border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center p-2 shrink-0 ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
              <img
                src={c.image}
                alt={c.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm sm:text-base ${isLight ? 'text-gray-900' : 'text-white'}`}>{c.fullTitle}</h4>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{c.issuer}</p>
              <p className="text-gray-500 text-xs mt-1">{c.date}</p>
              <p className="text-blue-500 text-xs sm:text-sm font-medium mt-1">
                {c.score}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactContent() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center text-center">
      <h2 className={`text-lg sm:text-xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>Get in touch</h2>
      <p className={`text-sm mb-4 sm:mb-6 max-w-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
        Feel free to reach out if you&apos;re looking for a developer, have a
        query, or simply want to connect.
      </p>

      <div className="space-y-3 w-full max-w-sm">
        <div className={`flex items-center justify-between rounded-xl px-3 sm:px-4 py-3 border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
            <a
              href="mailto:ntkha71@gmail.com"
              className={`text-sm transition-colors ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 hover:text-white'}`}
            >
              ntkha71@gmail.com
            </a>
          </div>
          <button
            onClick={() => copy('ntkha71@gmail.com', 'email')}
            className={`transition-colors ${isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-500 hover:text-white'}`}
          >
            {copied === 'email' ? (
              <span className="text-xs text-green-500">Copied!</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className={`flex items-center justify-between rounded-xl px-3 sm:px-4 py-3 border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Phone className="w-4 h-4 text-blue-500 shrink-0" />
            <a
              href="tel:+84375627330"
              className={`text-sm transition-colors ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 hover:text-white'}`}
            >
              +84 375627330
            </a>
          </div>
          <button
            onClick={() => copy('+84375627330', 'phone')}
            className={`transition-colors ${isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-500 hover:text-white'}`}
          >
            {copied === 'phone' ? (
              <span className="text-xs text-green-500">Copied!</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <p className="text-gray-500 text-xs mt-6 mb-3">
        You may also find me on these platforms
      </p>
      <div className="flex gap-3">
        <a
          href="https://github.com/TunKeyy"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-xl transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Github className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`} />
        </a>
        <a
          href="https://www.linkedin.com/in/kha-nguyen-tuan/"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-xl transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Linkedin className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`} />
        </a>
        <a
          href="https://www.facebook.com/kha.nguyentuan.73/"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-xl transition-colors ${isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Facebook className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`} />
        </a>
      </div>
    </div>
  )
}

function ResumeContent() {
  return (
    <div className="h-full">
      <PDFViewer file="/pdf_files/CV.pdf" />
    </div>
  )
}

// ===== Window Content Router =====

function WindowContent({ id }: { id: string }) {
  switch (id) {
    case 'profile':
      return <ProfileContent />
    case 'about':
      return <AboutContent />
    case 'skills':
      return <SkillsContent />
    case 'experience':
      return <ExperienceContent />
    case 'fields':
      return <FieldsContent />
    case 'certificates':
      return <CertificatesContent />
    case 'contact':
      return <ContactContent />
    case 'resume':
      return <ResumeContent />
    default:
      return null
  }
}

// ===== Desktop Icon =====

function DesktopIcon({
  id,
  icon,
  title,
}: {
  id: string
  icon: string
  title: string
}) {
  const { openWindow, windowStates, focusWindow } = useDesktop()

  const handleClick = () => {
    const state = windowStates[id]
    if (state?.isOpen) {
      focusWindow(id)
    } else {
      openWindow(id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-1 w-[76px] p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 transition-colors group"
    >
      <span className="text-[40px] drop-shadow-lg group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-[11px] text-center leading-tight drop-shadow-md font-medium text-white/80 dark:text-white/80">
        {title}
      </span>
    </button>
  )
}

// ===== Boot Screen =====

function BootScreen() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-[99999] ${isLight ? 'bg-white' : 'bg-black'}`}>
      <div className="flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-6xl mb-8"
        >
          🍒
        </motion.span>
        <div className={`w-40 h-1 rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-gray-800'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className={`h-full rounded-full ${isLight ? 'bg-gray-500' : 'bg-white/40'}`}
          />
        </div>
      </div>
    </div>
  )
}

// ===== Main Desktop Content =====

function DesktopInner() {
  const { openWindow } = useDesktop()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [booted, setBooted] = useState(false)
  const device = useDeviceType()

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooted(true)
      if (device === 'desktop') {
        openWindow('profile')
      }
    }, 1600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!booted) {
    return <BootScreen />
  }

  // Mobile layout
  if (device === 'mobile') {
    return (
      <MobileLayout
        apps={APPS.map((a) => ({ id: a.id, title: a.title, icon: a.icon }))}
        renderContent={(id) => <WindowContent id={id} />}
      />
    )
  }

  // Tablet layout
  if (device === 'tablet') {
    return (
      <TabletLayout
        apps={APPS.map((a) => ({ id: a.id, title: a.title, icon: a.icon }))}
        renderContent={(id) => <WindowContent id={id} />}
      />
    )
  }

  // Desktop layout (original)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed inset-0 overflow-hidden ${isLight ? 'desktop-wallpaper-light' : 'desktop-wallpaper'}`}
    >
      <MenuBar />

      {/* Desktop Icons - right column (macOS style) */}
      <div className="absolute top-9 right-3 flex flex-col gap-1 pt-1">
        {APPS.map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            icon={app.icon}
            title={app.title}
          />
        ))}
      </div>

      {/* Windows */}
      {APPS.map((app) => (
        <Window
          key={app.id}
          id={app.id}
          title={app.title}
          icon={app.icon}
          defaultWidth={app.w}
          defaultHeight={app.h}
          defaultX={app.x}
          defaultY={app.y}
        >
          <WindowContent id={app.id} />
        </Window>
      ))}

      <Dock items={DOCK_ITEMS} />

      {/* Footer credit */}
      <div className={`fixed bottom-[68px] left-4 text-[10px] select-none ${isLight ? 'text-black/15' : 'text-white/15'}`}>
        © 2025 | Designed and coded ❤️ by Kha Nguyen
      </div>
    </motion.div>
  )
}

// ===== Exported Desktop Component =====

export function Desktop() {
  return (
    <DesktopProvider>
      <DesktopInner />
    </DesktopProvider>
  )
}
