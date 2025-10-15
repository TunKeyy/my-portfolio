import Image from 'next/image'
import hrmImage from '../public/images/hrm_image.png'
import crmImage from '../public/images/crm_image.png'
import warehouseImage from '../public/images/warehouse_image.avif'
import ecommerceImage from '../public/images/ecommerce_image.webp'

export function FieldsSection() {
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
            The fields in which I have much experience
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