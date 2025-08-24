

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Instagram, Youtube, Twitter, ShoppingCart, MessageCircle, Code, Settings, User as UserIcon, LogIn, UserPlus, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { CartProvider, useCart } from './components/contexts/CartContext';
import FloatingCart from './components/shared/FloatingCart';
import FloatingAssistantButton from './components/shared/FloatingAssistantButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon, X, Phone, MapPin } from 'lucide-react';
import { SiteConfig, User } from '@/api/entities';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { title: 'Início', url: createPageUrl('Home') },
  { title: 'Cardápio', url: createPageUrl('Menu') },
  { title: 'Testemunhos', url: createPageUrl('Testemunhos') },
  { title: 'Sala Learn', url: createPageUrl('SalaLearn') },
  { title: "Assistente IA", url: createPageUrl("Assistant"), icon: MessageCircle },
  { title: "Meu Painel", url: createPageUrl("CustomerPanel"), icon: UserIcon },
  { title: "API", url: createPageUrl("ApiDocs"), icon: Code },
  { title: "Admin", url: createPageUrl("AdminDashboard"), icon: Settings },
];

function Header({ siteConfig }) {
  const location = useLocation();
  const navigate = useNavigate(); // Use the navigate hook
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) { // Changed 'e' to 'error' as per outline
        setUser(null); // Keep setUser(null) for clear state
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const handleLoginRedirect = () => {
    navigate(createPageUrl('Entrar')); // Changed 'Login' to 'Entrar'
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
    window.location.reload(); // Reload to clear any user-specific data or routes
  };

  const filteredNavItems = navigationItems.filter(item => {
    if (!user) {
      // If no user, hide "Meu Painel" and "Admin"
      return !["Meu Painel", "Admin"].includes(item.title);
    }
    // If user is not admin, hide "Admin"
    if (user.role !== 'admin' && item.title === "Admin") {
      return false;
    }
    // Show all others
    return true;
  });

  const mobileMenuVariants = {
    closed: { x: '100%' },
    open: { x: '0%' },
  };

  const overlayVariants = {
    closed: { opacity: 0, transitionEnd: { display: 'none' } },
    open: { opacity: 1, display: 'block' },
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b shadow-sm">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-0">
        <Link to={createPageUrl('Home')} className="text-2xl font-bold text-orange-500 z-50 flex items-center gap-2">
          {siteConfig?.site_logo ? (
            <img 
              src={siteConfig.site_logo} 
              alt={siteConfig.site_name || 'Logo'} 
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span>{siteConfig?.site_name || 'Lina Kamati'}</span>
          )}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {filteredNavItems.map((link) => (
            <Link
              key={link.title}
              to={link.url}
              className={`text-gray-700 hover:text-orange-500 transition-colors ${
                location.pathname === link.url ? 'text-orange-500 font-semibold' : ''
              }`}
            >
              {link.title}
            </Link>
          ))}
        </nav>
        
        {/* Auth controls */}
        <div className="hidden md:flex items-center gap-2">
          {isLoadingUser ? (
             <div className="w-24 h-10 bg-gray-200 rounded-md animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.full_name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to={createPageUrl('CustomerPanel')} className="w-full">
                  <DropdownMenuItem>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Meu Painel</span>
                  </DropdownMenuItem>
                </Link>
                {user.role === 'admin' && (
                  <Link to={createPageUrl('AdminDashboard')} className="w-full">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={handleLoginRedirect}>Login</Button>
              <Button onClick={handleLoginRedirect}>
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden z-50">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl z-50 p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-orange-500">Menu</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <nav className="flex-grow">
                  <ul className="space-y-4">
                    {filteredNavItems.map((link) => (
                      <li key={link.title}>
                        <Link
                          to={link.url}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 text-lg font-medium ${
                            location.pathname === link.url ? 'text-orange-500' : 'text-gray-700'
                          }`}
                        >
                          {link.icon && <link.icon className="w-5 h-5" />}
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                <div className="pt-6 border-t">
                 {isLoadingUser ? (
                    <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
                  ) : user ? (
                    <div className="space-y-2">
                       <Link to={createPageUrl('CustomerPanel')} onClick={() => setIsMobileMenuOpen(false)}>
                         <Button variant="outline" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Meu Painel
                         </Button>
                       </Link>
                       {user.role === 'admin' && (
                         <Link to={createPageUrl('AdminDashboard')} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-start">
                               <Settings className="mr-2 h-4 w-4" />
                               Admin
                            </Button>
                         </Link>
                       )}
                       <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                         <LogOut className="mr-2 h-4 w-4" />
                         Sair
                       </Button>
                    </div>
                  ) : (
                     <div className="space-y-2">
                        <Button className="w-full" onClick={handleLoginRedirect}>
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleLoginRedirect}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Cadastrar
                        </Button>
                     </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function Footer({ siteConfig }) {
  const socialLinks = [
    { icon: Facebook, url: siteConfig?.social_links?.facebook, name: 'Facebook' },
    { icon: Instagram, url: siteConfig?.social_links?.instagram, name: 'Instagram' },
    { icon: Youtube, url: siteConfig?.social_links?.youtube, name: 'YouTube' },
    { icon: Twitter, url: siteConfig?.social_links?.twitter, name: 'Twitter' }
  ].filter(social => social.url);

  const handleWhatsAppClick = () => {
    const whatsappNumber = siteConfig?.whatsapp || '244943480916';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Vim através do site da ${siteConfig?.site_name || 'Lina Kamati'}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = () => {
    const phone = siteConfig?.phone || '+244943480916';
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto py-12 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-orange-500 mb-4 flex items-center gap-2">
              {siteConfig?.site_logo ? (
                <img 
                  src={siteConfig.site_logo} 
                  alt={siteConfig.site_name || 'Logo'} 
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <span>{siteConfig?.site_name || 'Lina Kamati'}</span>
              )}
            </h3>
            <p className="text-slate-400 mb-4">
              {siteConfig?.about_text || 'Tradição e qualidade em cada doce que preparamos com muito carinho.'}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-orange-500 transition-colors"
                    title={social.name}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {navigationItems.slice(0, 4).map(link => ( // Changed slice end to 4 as 'Pedidos' is removed
                 <li key={link.title}>
                   <Link to={link.url} className="text-slate-400 hover:text-orange-500">
                     {link.title}
                   </Link>
                 </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3 text-slate-400">
              {siteConfig?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span className="text-sm">{siteConfig.address}</span>
                </li>
              )}
              <li>
                <button 
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 hover:text-orange-500 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>+244 943 480 916</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 hover:text-orange-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </li>
              {siteConfig?.email && (
                <li>
                  <a 
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-orange-500 transition-colors"
                  >
                    {siteConfig.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Horário de Funcionamento</h4>
            <ul className="space-y-2 text-slate-400">
              <li>{siteConfig?.working_hours?.monday_friday || 'Segunda a Sexta: 8h às 18h'}</li>
              <li>{siteConfig?.working_hours?.saturday || 'Sábado: 8h às 16h'}</li>
              <li>{siteConfig?.working_hours?.sunday || 'Domingo: 9h às 15h'}</li>
            </ul>
          </div>
        </div>
        
        {siteConfig?.footer_text && (
          <div className="border-t border-slate-700 pt-6 mb-6">
            <p className="text-slate-400 text-center">{siteConfig.footer_text}</p>
          </div>
        )}
        
        <div className="border-t border-slate-700 pt-8 mt-8 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} {siteConfig?.site_name || 'Lina Kamati'}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const [siteConfig, setSiteConfig] = React.useState(null);

  React.useEffect(() => {
    loadSiteConfig();
  }, []);

  const loadSiteConfig = async () => {
    try {
      const configs = await SiteConfig.list();
      if (configs.length > 0) {
        setSiteConfig(configs[0]);
        
        // Aplicar cores personalizadas
        if (configs[0].primary_color) {
          document.documentElement.style.setProperty('--primary-color', configs[0].primary_color);
        }
        if (configs[0].secondary_color) {
          document.documentElement.style.setProperty('--secondary-color', configs[0].secondary_color);
        }
        // Note: For currency display (Kwanza - Kz), siteConfig should provide a currency_symbol or currency_code.
        // Components rendering prices (e.g., FloatingCart) would then use this info from siteConfig.
        // The siteConfig object passed to components like FloatingCart (if directly passed) or made available
        // via context would contain 'currency_symbol' (e.g., 'Kz') if set in the backend config.
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do site:', error);
    }
  };

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <style>{`
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 25 95% 53%; /* Orange */
            --primary-foreground: 0 0% 100%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 25 95% 53%;
            --radius: 0.5rem;
          }
        `}</style>
        <Header siteConfig={siteConfig} />
        <main className="flex-grow">{children}</main>
        <Footer siteConfig={siteConfig} />
        
        {/* Ícone flutuante do Assistente IA */}
        <FloatingAssistantButton />
        
        {/* Carrinho Flutuante Global */}
        <FloatingCart />
      </div>
    </CartProvider>
  );
}

