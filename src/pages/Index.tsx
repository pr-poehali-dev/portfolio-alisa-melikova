import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  year: string;
  description: string;
  cover: string;
  images: string[];
}

const API_PROJECTS = 'https://functions.poehali.dev/e75025c2-c481-4d91-b76c-592e2e68ebe2';
const API_UPLOAD = 'https://functions.poehali.dev/3e68882f-f71f-46f8-a827-c06d69e6cbf2';

const initialProjects: Project[] = [
  {
    id: 'pink-dress',
    title: 'Розовое платье',
    year: '2023',
    description: 'Современная постановка о женской идентичности и самовыражении через театральный костюм.',
    cover: 'https://cdn.poehali.dev/projects/d06bc7b2-909d-4086-acb0-64c61016a4de/files/f861db0c-19a3-4663-8821-997f8359715f.jpg',
    images: []
  },
  {
    id: 'lubyanka-makeup',
    title: 'Лубянский Гримёр',
    year: '2022',
    description: 'Историческая драма о судьбе театрального гримёра в период политических репрессий.',
    cover: 'https://cdn.poehali.dev/projects/d06bc7b2-909d-4086-acb0-64c61016a4de/files/d5f53d2e-a152-4e5e-a33c-524734e47d03.jpg',
    images: []
  },
  {
    id: 'lavr',
    title: 'Лавр',
    year: '2023',
    description: 'Адаптация романа Евгения Водолазкина о духовном пути средневекового лекаря.',
    cover: 'https://cdn.poehali.dev/projects/d06bc7b2-909d-4086-acb0-64c61016a4de/files/23ede909-1acd-4253-8c82-715ba1db7b62.jpg',
    images: []
  },
  {
    id: 'king',
    title: 'Я убил царя',
    year: '2022',
    description: 'Постановка о последних днях императорской семьи и моральном выборе.',
    cover: '',
    images: []
  },
  {
    id: 'aesop',
    title: 'Эзоп',
    year: '2021',
    description: 'Философская притча о создателе басен, его мудрости и трагической судьбе.',
    cover: '',
    images: []
  },
  {
    id: 'crime',
    title: 'Преступление и Наказание',
    year: '2023',
    description: 'Визуальная интерпретация классического романа Достоевского для современной сцены.',
    cover: '',
    images: []
  }
];

export default function Index() {
  const [activeSection, setActiveSection] = useState('portfolio');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(API_PROJECTS);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        await initializeProjects();
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить проекты',
        variant: 'destructive'
      });
    }
  };

  const initializeProjects = async () => {
    try {
      for (const project of initialProjects) {
        await saveProject(project);
      }
      await loadProjects();
    } catch (error) {
      console.error('Failed to initialize projects:', error);
    }
  };

  const saveProject = async (project: Project) => {
    try {
      const response = await fetch(API_PROJECTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxSize = 1600;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadImageToCloud = async (imageData: string): Promise<string> => {
    const response = await fetch(API_UPLOAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData, type: 'image/jpeg' })
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const result = await response.json();
    return result.url;
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = async (projectId: string, type: 'cover' | 'gallery', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const compressedImage = await compressImage(file);
      const cloudUrl = await uploadImageToCloud(compressedImage);
      
      const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
          if (type === 'cover') {
            return { ...p, cover: cloudUrl };
          } else {
            return { ...p, images: [...p.images, cloudUrl] };
          }
        }
        return p;
      });
      
      setProjects(updatedProjects);
      
      const projectToSave = updatedProjects.find(p => p.id === projectId);
      if (projectToSave) {
        await saveProject(projectToSave);
      }
      
      toast({
        title: 'Готово!',
        description: 'Изображение загружено'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (projectId: string, imageIndex: number) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, images: p.images.filter((_, i) => i !== imageIndex) };
      }
      return p;
    });
    
    setProjects(updatedProjects);
    
    const projectToSave = updatedProjects.find(p => p.id === projectId);
    if (projectToSave) {
      await saveProject(projectToSave);
    }
  };

  const openGallery = (project: Project) => {
    if (project.images.length > 0) {
      setSelectedProject(project);
      setCurrentImageIndex(0);
    }
  };

  const nextImage = () => {
    if (selectedProject && currentImageIndex < selectedProject.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-serif font-light tracking-wide">
              Алиса Меликова
            </h1>
            <div className="flex items-center gap-8">
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span>Загрузка...</span>
                </div>
              )}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                {isEditMode ? 'Готово' : 'Редактировать'}
              </button>
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
                  className={`group transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div 
                    className="aspect-[3/4] bg-muted mb-6 overflow-hidden relative cursor-pointer group"
                    onClick={() => !isEditMode && openGallery(project)}
                  >
                    {project.cover ? (
                      <img
                        src={project.cover}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="Image" size={48} className="text-muted-foreground" />
                      </div>
                    )}
                    
                    {isEditMode && (
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-white text-center">
                          <Icon name="Upload" size={32} className="mx-auto mb-2" />
                          <span className="text-sm">Загрузить обложку</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(project.id, 'cover', e)}
                          disabled={isUploading}
                        />
                      </label>
                    )}

                    {!isEditMode && project.images.length > 0 && (
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                        {project.images.length} фото
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-serif font-light mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{project.year}</p>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {project.description}
                  </p>

                  {isEditMode && (
                    <div className="mt-4 space-y-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <Icon name="Plus" size={16} />
                        <span className="text-sm">Добавить фото в галерею</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(project.id, 'gallery', e)}
                          disabled={isUploading}
                        />
                      </label>

                      {project.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {project.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square group">
                              <img src={img} alt="" className="w-full h-full object-cover rounded" />
                              <button
                                onClick={() => removeImage(project.id, idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isUploading}
                              >
                                <Icon name="X" size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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

      <Dialog open={selectedProject !== null} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-0">
          {selectedProject && selectedProject.images.length > 0 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 text-white hover:text-white/70 transition-colors"
              >
                <Icon name="X" size={32} />
              </button>

              <button
                onClick={prevImage}
                disabled={currentImageIndex === 0}
                className="absolute left-4 z-10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
              >
                <Icon name="ChevronLeft" size={48} />
              </button>

              <button
                onClick={nextImage}
                disabled={currentImageIndex === selectedProject.images.length - 1}
                className="absolute right-4 z-10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
              >
                <Icon name="ChevronRight" size={48} />
              </button>

              <div className="w-full h-[95vh] flex items-center justify-center p-12">
                <img
                  src={selectedProject.images[currentImageIndex]}
                  alt={`${selectedProject.title} - фото ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {selectedProject.images.length}
                </p>
              </div>

              <div className="absolute top-8 left-8">
                <h3 className="text-white text-2xl font-serif font-light">{selectedProject.title}</h3>
                <p className="text-white/70 text-sm mt-1">{selectedProject.year}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Алиса Меликова. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
