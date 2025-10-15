import Image from 'next/image'
import { FadeInSection } from './FadeInSection'
import aboutImage from '../public/images/graduation_image.jpg'

export function AboutSection() {
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