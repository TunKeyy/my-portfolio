import { FadeInSection } from './FadeInSection'

export function SkillsSection() {
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