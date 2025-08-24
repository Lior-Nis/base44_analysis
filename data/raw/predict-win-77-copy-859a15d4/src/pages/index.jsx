import Layout from "./Layout.jsx";

import Home from "./Home";

import ColourGame from "./ColourGame";

import Wallet from "./Wallet";

import Cricket from "./Cricket";

import Profile from "./Profile";

import Admin from "./Admin";

import Arcade from "./Arcade";

import HedsOrTels from "./HedsOrTels";

import Mines from "./Mines";

import Anderbhar from "./Anderbhar";

import ChekianRoad from "./ChekianRoad";

import Slots from "./Slots";

import SlotGame from "./SlotGame";

import 7Up7Down from "./7Up7Down";

import Rullotr from "./Rullotr";

import DragonTiger from "./DragonTiger";

import CarRoulette from "./CarRoulette";

import Plinko from "./Plinko";

import SkyBlast from "./SkyBlast";

import Parity from "./Parity";

import DiceRoll from "./DiceRoll";

import SpinToWin from "./SpinToWin";

import ChickenRoad from "./ChickenRoad";

import Penalty from "./Penalty";

import InOut from "./InOut";

import CoinFlip from "./CoinFlip";

import HamsterRun from "./HamsterRun";

import TeenPatti from "./TeenPatti";

import FishHunter from "./FishHunter";

import Blackjack from "./Blackjack";

import Baccarat from "./Baccarat";

import VideoPoker from "./VideoPoker";

import Keno from "./Keno";

import Lottery from "./Lottery";

import SicBo from "./SicBo";

import ThreeCardPoker from "./ThreeCardPoker";

import HiLo from "./HiLo";

import ScratchCard from "./ScratchCard";

import Bingo from "./Bingo";

import Tournament from "./Tournament";

import HowToPlay from "./HowToPlay";

import Football from "./Football";

import Store from "./Store";

import JhandiMunda from "./JhandiMunda";

import Quiz from "./Quiz";

import TreasureBox from "./TreasureBox";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    ColourGame: ColourGame,
    
    Wallet: Wallet,
    
    Cricket: Cricket,
    
    Profile: Profile,
    
    Admin: Admin,
    
    Arcade: Arcade,
    
    HedsOrTels: HedsOrTels,
    
    Mines: Mines,
    
    Anderbhar: Anderbhar,
    
    ChekianRoad: ChekianRoad,
    
    Slots: Slots,
    
    SlotGame: SlotGame,
    
    7Up7Down: 7Up7Down,
    
    Rullotr: Rullotr,
    
    DragonTiger: DragonTiger,
    
    CarRoulette: CarRoulette,
    
    Plinko: Plinko,
    
    SkyBlast: SkyBlast,
    
    Parity: Parity,
    
    DiceRoll: DiceRoll,
    
    SpinToWin: SpinToWin,
    
    ChickenRoad: ChickenRoad,
    
    Penalty: Penalty,
    
    InOut: InOut,
    
    CoinFlip: CoinFlip,
    
    HamsterRun: HamsterRun,
    
    TeenPatti: TeenPatti,
    
    FishHunter: FishHunter,
    
    Blackjack: Blackjack,
    
    Baccarat: Baccarat,
    
    VideoPoker: VideoPoker,
    
    Keno: Keno,
    
    Lottery: Lottery,
    
    SicBo: SicBo,
    
    ThreeCardPoker: ThreeCardPoker,
    
    HiLo: HiLo,
    
    ScratchCard: ScratchCard,
    
    Bingo: Bingo,
    
    Tournament: Tournament,
    
    HowToPlay: HowToPlay,
    
    Football: Football,
    
    Store: Store,
    
    JhandiMunda: JhandiMunda,
    
    Quiz: Quiz,
    
    TreasureBox: TreasureBox,
    
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
                
                <Route path="/ColourGame" element={<ColourGame />} />
                
                <Route path="/Wallet" element={<Wallet />} />
                
                <Route path="/Cricket" element={<Cricket />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Arcade" element={<Arcade />} />
                
                <Route path="/HedsOrTels" element={<HedsOrTels />} />
                
                <Route path="/Mines" element={<Mines />} />
                
                <Route path="/Anderbhar" element={<Anderbhar />} />
                
                <Route path="/ChekianRoad" element={<ChekianRoad />} />
                
                <Route path="/Slots" element={<Slots />} />
                
                <Route path="/SlotGame" element={<SlotGame />} />
                
                <Route path="/7Up7Down" element={<7Up7Down />} />
                
                <Route path="/Rullotr" element={<Rullotr />} />
                
                <Route path="/DragonTiger" element={<DragonTiger />} />
                
                <Route path="/CarRoulette" element={<CarRoulette />} />
                
                <Route path="/Plinko" element={<Plinko />} />
                
                <Route path="/SkyBlast" element={<SkyBlast />} />
                
                <Route path="/Parity" element={<Parity />} />
                
                <Route path="/DiceRoll" element={<DiceRoll />} />
                
                <Route path="/SpinToWin" element={<SpinToWin />} />
                
                <Route path="/ChickenRoad" element={<ChickenRoad />} />
                
                <Route path="/Penalty" element={<Penalty />} />
                
                <Route path="/InOut" element={<InOut />} />
                
                <Route path="/CoinFlip" element={<CoinFlip />} />
                
                <Route path="/HamsterRun" element={<HamsterRun />} />
                
                <Route path="/TeenPatti" element={<TeenPatti />} />
                
                <Route path="/FishHunter" element={<FishHunter />} />
                
                <Route path="/Blackjack" element={<Blackjack />} />
                
                <Route path="/Baccarat" element={<Baccarat />} />
                
                <Route path="/VideoPoker" element={<VideoPoker />} />
                
                <Route path="/Keno" element={<Keno />} />
                
                <Route path="/Lottery" element={<Lottery />} />
                
                <Route path="/SicBo" element={<SicBo />} />
                
                <Route path="/ThreeCardPoker" element={<ThreeCardPoker />} />
                
                <Route path="/HiLo" element={<HiLo />} />
                
                <Route path="/ScratchCard" element={<ScratchCard />} />
                
                <Route path="/Bingo" element={<Bingo />} />
                
                <Route path="/Tournament" element={<Tournament />} />
                
                <Route path="/HowToPlay" element={<HowToPlay />} />
                
                <Route path="/Football" element={<Football />} />
                
                <Route path="/Store" element={<Store />} />
                
                <Route path="/JhandiMunda" element={<JhandiMunda />} />
                
                <Route path="/Quiz" element={<Quiz />} />
                
                <Route path="/TreasureBox" element={<TreasureBox />} />
                
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