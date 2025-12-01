import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const projects = [
  {
    id: 'pink-dress',
    title: 'Розовое платье',
    year: '2023',
    description: 'Современная постановка о женской идентичности и самовыражении через театральный костюм.',
    images: [
      'https://cdn.poehali.dev/projects/d06bc7b2-909d-4086-acb0-64c61016a4de/files/f861db0c-19a3-4663-8821-997f8359715f.jpg'
    ]
  },
  {
    id: 'lubyanka-makeup',
    title: 'Лубянский Гримёр',
    year: '2022',
    description: 'Историческая драма о судьбе театрального гримёра в период политических репрессий.',
    images: [
      'https://cdn.poehali.dev/projects/d06bc7b2-909d-4086-acb0-64c61016a4de/files/d5f53d2e-a152-4e5e-a33c-524734e47d03.jpg'
    ]
  },
  {
    id: 'lavr',
    title: 'Лавр',
    year: '2023',
    description: 'Адаптация романа Евгения Водолазкина о духовном пути средневекового лекаря.',
    images: [
      'https://cdn.poehali.dev/projects/d06bc7b2-909d-4086-acb0-64c61016a4de/files/23ede909-1acd-4253-8c82-715ba1db7b62.jpg'
    ]
  },
  {
    id: 'king',
    title: 'Я убил царя',
    year: '2022',
    description: 'Постановка о последних днях императорской семьи и моральном выборе.',
    images: []
  },
  {
    id: 'aesop',
    title: 'Эзоп',
    year: '2021',
    description: 'Философская притча о создателе басен, его мудрости и трагической судьбе.',
    images: []
  },
  {
    id: 'crime',
    title: 'Преступление и Наказание',
    year: '2023',
    description: 'Визуальная интерпретация классического романа Достоевского для современной сцены.',
    images: []
  }
];

export default function Index() {
  const [activeSection, setActiveSection] = useState('portfolio');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-serif font-light tracking-wide">
              Алиса Меликова
            </h1>
            <div className="flex gap-8">
              {['portfolio', 'bio', 'about', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm uppercase tracking-widest transition-colors ${
                    activeSection === section
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section === 'portfolio' && 'Портфолио'}
                  {section === 'bio' && 'Биография'}
                  {section === 'about' && 'О работе'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <section id="portfolio" className="min-h-screen py-20 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-5xl lg:text-7xl font-serif font-light mb-20 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Проекты
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`group cursor-pointer transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                >
                  <div className="aspect-[3/4] bg-muted mb-6 overflow-hidden">
                    {project.images[0] ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="Image" size={48} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-serif font-light mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{project.year}</p>
                  
                  {selectedProject === project.id && (
                    <div className="animate-accordion-down overflow-hidden">
                      <p className="text-sm leading-relaxed text-foreground/80 mt-4">
                        {project.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="bio" className="min-h-screen py-20 px-6 lg:px-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-7xl font-serif font-light mb-16">Биография</h2>
            <div className="space-y-8 text-lg leading-relaxed">
              <p>
                <span className="font-serif text-4xl">А</span>лиса Меликова — российский художник, 
                живущая и работающая в Москве.
              </p>
              <p>
                Активно сотрудничает с ведущими режиссерами современного российского театра, 
                создавая уникальные визуальные миры для каждой постановки.
              </p>
              <p>
                Работы Алисы можно увидеть как в театральных постановках ведущих площадок страны, 
                так и в кинематографе, где её художественное видение помогает создавать 
                запоминающиеся образы и атмосферу.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="min-h-screen py-20 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-7xl font-serif font-light mb-16">О работе</h2>
            <div className="space-y-8 text-lg leading-relaxed">
              <p>
                В центре моей работы — поиск визуального языка, который точно отражает 
                внутренний мир персонажей и драматургический замысел режиссёра.
              </p>
              <p>
                Каждый костюм, каждая деталь в постановке — это не просто элемент оформления, 
                а инструмент раскрытия характера, эпохи и эмоционального состояния.
              </p>
              <p>
                Работаю с исторической реконструкцией, современными материалами и техниками, 
                создавая синтез традиции и новаторства на сцене.
              </p>
            </div>
          </div>
        </section>

        <section id="contacts" className="min-h-screen py-20 px-6 lg:px-12 bg-muted/30 flex items-center">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-5xl lg:text-7xl font-serif font-light mb-16">Контакты</h2>
            <div className="space-y-6 text-lg">
              <div className="flex items-center gap-4">
                <Icon name="Mail" size={24} className="text-muted-foreground" />
                <a href="mailto:alisa.melikova@example.com" className="hover:text-muted-foreground transition-colors">
                  alisa.melikova@example.com
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Icon name="Phone" size={24} className="text-muted-foreground" />
                <a href="tel:+79000000000" className="hover:text-muted-foreground transition-colors">
                  +7 900 000 00 00
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Icon name="Instagram" size={24} className="text-muted-foreground" />
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors">
                  @alisa.melikova
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Алиса Меликова. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
