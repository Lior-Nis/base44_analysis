import Layout from "./Layout.jsx";

import Home from "./Home";

import Assistant from "./Assistant";

import Menu from "./Menu";

import Orders from "./Orders";

import ProductDetails from "./ProductDetails";

import Gallery from "./Gallery";

import Lives from "./Lives";

import CustomOrders from "./CustomOrders";

import Reviews from "./Reviews";

import Profile from "./Profile";

import Cart from "./Cart";

import OrderConfirmation from "./OrderConfirmation";

import Testemunhos from "./Testemunhos";

import SalaLearn from "./SalaLearn";

import Pedidos from "./Pedidos";

import Api from "./Api";

import ApiDocs from "./ApiDocs";

import Checkout from "./Checkout";

import AdminDashboard from "./AdminDashboard";

import CustomerPanel from "./CustomerPanel";

import RewardPage from "./RewardPage";

import Entrar from "./Entrar";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Assistant: Assistant,
    
    Menu: Menu,
    
    Orders: Orders,
    
    ProductDetails: ProductDetails,
    
    Gallery: Gallery,
    
    Lives: Lives,
    
    CustomOrders: CustomOrders,
    
    Reviews: Reviews,
    
    Profile: Profile,
    
    Cart: Cart,
    
    OrderConfirmation: OrderConfirmation,
    
    Testemunhos: Testemunhos,
    
    SalaLearn: SalaLearn,
    
    Pedidos: Pedidos,
    
    Api: Api,
    
    ApiDocs: ApiDocs,
    
    Checkout: Checkout,
    
    AdminDashboard: AdminDashboard,
    
    CustomerPanel: CustomerPanel,
    
    RewardPage: RewardPage,
    
    Entrar: Entrar,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Assistant" element={<Assistant />} />
                
                <Route path="/Menu" element={<Menu />} />
                
                <Route path="/Orders" element={<Orders />} />
                
                <Route path="/ProductDetails" element={<ProductDetails />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/Lives" element={<Lives />} />
                
                <Route path="/CustomOrders" element={<CustomOrders />} />
                
                <Route path="/Reviews" element={<Reviews />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Cart" element={<Cart />} />
                
                <Route path="/OrderConfirmation" element={<OrderConfirmation />} />
                
                <Route path="/Testemunhos" element={<Testemunhos />} />
                
                <Route path="/SalaLearn" element={<SalaLearn />} />
                
                <Route path="/Pedidos" element={<Pedidos />} />
                
                <Route path="/Api" element={<Api />} />
                
                <Route path="/ApiDocs" element={<ApiDocs />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/CustomerPanel" element={<CustomerPanel />} />
                
                <Route path="/RewardPage" element={<RewardPage />} />
                
                <Route path="/Entrar" element={<Entrar />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}