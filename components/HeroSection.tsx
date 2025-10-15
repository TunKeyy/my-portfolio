import { Github, MapPin, Facebook, Linkedin } from 'lucide-react'
import Image from 'next/image'
import myAvatar from '../public/images/my_avatar.jpg'

export function HeroSection() {
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