import Image from 'next/image'
import { FadeInSection } from './FadeInSection'
import nexlabLogo from '../public/images/nexlab_logo.png'

export function ExperienceSection() {
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